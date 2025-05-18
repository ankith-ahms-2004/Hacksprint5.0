/**
 * Utility for making authenticated API requests
 */

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
  
  return response;
};

export const getWithAuth = (url: string, options: RequestInit = {}) => {
  return fetchWithAuth(url, { ...options, method: 'GET' });
};

export const postWithAuth = (url: string, data: any, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const putWithAuth = (url: string, data: any, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWithAuth = (url: string, options: RequestInit = {}) => {
  return fetchWithAuth(url, { ...options, method: 'DELETE' });
}; 