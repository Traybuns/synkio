/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*.vercel.app', 'beta.synkio.app', 'synkio.app', 'localhost'],
  },
  reactStrictMode: true,
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig

