const nextConfig = {
  swcMinify: true,
  transpilePackages: ['swagger-ui-react'],
  experimental: {
    serverActions: true,
    turbo: true,
  },
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
