/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "connect-src * 'unsafe-inline'",
              "img-src * data: blob: 'unsafe-inline'",
              "frame-src *",
              "style-src * 'unsafe-inline'",
              "font-src * data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // ... other config
};

module.exports = nextConfig;
