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
    },    // Configuração para garantir que a página comece no topo quando mudar de rota
    experimental: {
        scrollRestoration: true,
        optimizeCss: {
            cssModules: true,
            fontLoaders: [
                { loader: '@next/font/google', test: /node_modules\/@next\/font\/google/ },
            ],
        }, // Otimiza o CSS
        optimizePackageImports: ["@eugenios/ui", "lucide-react", "@tanstack/react-query"], // Otimiza os imports para tree shaking
        optimisticClientCache: true, // Otimiza o cache do lado do cliente
        swcMinify: true, // Minificar com SWC que é mais rápido
    },
    // Configurações de compilação
    compiler: {
        removeConsole: process.env.NODE_ENV === "production", // Remove console.log em produção
    },
    // Otimização de bundle
    webpack: (config, { dev, isServer }) => {
        // Usar dynamic import apenas em client-side
        if (!isServer && !dev) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Chunk para bibliotecas comuns
                    framework: {
                        chunks: 'all',
                        name: 'framework',
                        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                        priority: 40,
                        enforce: true,
                    },
                    // Chunk específico para componentes UI
                    ui: {
                        chunks: 'async',
                        name: 'ui',
                        test: /[\\/]components[\\/]ui[\\/]/,
                        minChunks: 2,
                        priority: 30,
                    },
                    // Chunk para tanstack/react-query
                    tanstack: {
                        chunks: 'async',
                        name: 'tanstack',
                        test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
                        priority: 20,
                    },
                    // Chunk para Lucide icons
                    lucide: {
                        chunks: 'async',
                        name: 'lucide',
                        test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                        priority: 10,
                    },
                },
            };
        }
        return config;
    },
}

export default nextConfig
