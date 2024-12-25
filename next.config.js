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
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://maps.googleapis.com https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://maps.googleapis.com https://fonts.googleapis.com",
              "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.googleapis.com"
            ].join('; ')
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
