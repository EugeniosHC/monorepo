/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@eugenios/ui", "@eugenios/types", "@eugenios/react-query", "@eugenios/services"],
  compiler: {
    removeConsole: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
