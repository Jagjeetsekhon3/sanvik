/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Ensure route groups work correctly on Vercel
  outputFileTracingIncludes: {
    '/*': ['./app/**/*'],
  },
}
module.exports = nextConfig
