/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@eugenios/ui", "@eugenios/types", "@eugenios/react-query", "@eugenios/services"],
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "pub-dd6c6759a4454b4cb75e3cd097f59bb1.r2.dev",
            },
        ],

        // Aumentar o tamanho máximo das imagens
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024],
        // Desativar o redimensionamento para formatos sem perda
        formats: ["image/webp", "image/avif"],
        minimumCacheTTL: 60,
    },
    // Configuração para garantir que a página comece no topo quando mudar de rota
    experimental: {
        scrollRestoration: true,
    },
}

export default nextConfig
