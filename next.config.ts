import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://taiq-static-images.autotechiq.com/**')],
  },
  redirects: async () => [
    {
      source: '/',
      destination: '/login',
      permanent: true,
    },
  ],
};

export default nextConfig;
