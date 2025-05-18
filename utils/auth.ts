import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (payload: TokenPayload): Tokens => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
  
  const accessExpiration = process.env.JWT_ACCESS_EXPIRATION 
    ? parseInt(process.env.JWT_ACCESS_EXPIRATION) 
    : 3600; 
    
  const refreshExpiration = process.env.JWT_REFRESH_EXPIRATION 
    ? parseInt(process.env.JWT_REFRESH_EXPIRATION) 
    : 2592000; 

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: accessExpiration,
  });

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: refreshExpiration,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  const secret = isRefreshToken 
    ? process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    : process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
    
  return jwt.verify(token, secret) as TokenPayload;
};

export const getTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}; 