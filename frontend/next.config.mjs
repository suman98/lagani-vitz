// Deployment model
// ----------------
// prod: `next build` writes a fully static site (`output: 'export'`). Laravel serves the
//       *.html files at /lagani/*; the hashed JS/CSS under _next/ are published to
//       public/vendor/lagani-vitz (php artisan vendor:publish --tag=lagani-vitz-assets) and
//       served by nginx/Valet straight from disk, hence `assetPrefix`.
// dev:  `next dev` on :3100. The browser talks to Next, and Next proxies /lagani/api/* to
//       Laravel, so the fetch URLs are identical in dev and prod (same origin, no CORS).

const basePath = process.env.LAGANI_BASE_PATH ?? '/lagani'; // must equal config('lagani-vitz.frontend.path')
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // Inlined into client code so the API client can build same-origin URLs.
  env: { NEXT_PUBLIC_LAGANI_BASE_PATH: basePath },
  reactStrictMode: true,
  images: { unoptimized: true },
  ...(isDev
    ? {
        async rewrites() {
          const laravel = process.env.LARAVEL_URL ?? 'http://develop.nepsealpha.test';
          return [{ source: '/api/:path*', destination: `${laravel}${basePath}/api/:path*` }];
        },
      }
    : {
        output: 'export',
        trailingSlash: true,
        assetPrefix: process.env.LAGANI_ASSET_PREFIX ?? '/vendor/lagani-vitz',
      }),
};

export default nextConfig;
