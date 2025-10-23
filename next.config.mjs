import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Add this for better locale handling
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
    
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
                source: '/api/backend/:path*',
                destination: 'http://localhost:3001/:path*',
            },
        ];
    },
};

export default withNextIntl(nextConfig);