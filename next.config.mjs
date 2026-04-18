/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Pode manter, sem problemas.
  images: {
    remotePatterns: [

      {
        protocol: 'https',
        hostname: 'n8n-doodledreamsmidia.r954jc.easypanel.host', // SEU DOMÍNIO DO SERVIDOR DE MÍDIAS
        port: '',
        pathname: '/**', // Permite qualquer caminho dentro desse domínio
      },
      // Configuração para placehold.co (está correta)
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Configuração para o seu backend (corrigida)
      {
        protocol: 'https',
        hostname: 'n8n-doodledreamsbackend.r954jc.easypanel.host',
        port: '',
        // CORREÇÃO AQUI: Permite o acesso a /uploads/ e qualquer coisa dentro dele.
        pathname: '/uploads/**', 
      },
    ],
  },
};

export default nextConfig;