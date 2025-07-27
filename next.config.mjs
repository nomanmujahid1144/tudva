/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [
            'ngpdfyhvlztueekbksju.supabase.co',
            'storage.googleapis.com',
            'zghwhhjtxylurrxlsceq.supabase.co',
            'tudva-storage.storage.googleapis.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ngpdfyhvlztueekbksju.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'ngpdfyhvlztueekbksju.supabase.co',
                port: '',
                pathname: '/storage/v1/object/sign/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    async rewrites() {
        return [
            {
                source: '/api/backend/:path*',  // IMPORTANT:  Match the path in your API route
                destination: 'http://localhost:3001/:path*', // Your backend URL
            },
        ];
    },
};

export default nextConfig;
