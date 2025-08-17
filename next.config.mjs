/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Make sure both versions are available
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
  },
}

export default nextConfig