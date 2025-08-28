/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Alias wagmi/chains -> viem/chains to satisfy older internal imports
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['wagmi/chains'] = 'viem/chains'
    return config
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
