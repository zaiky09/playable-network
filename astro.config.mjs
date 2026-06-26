import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://theplayablenetwork.org',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    // Active locales only. Keep this in sync with src/i18n/config.ts. Adding a
    // locale here without also wiring it in config.ts gives broken hreflang
    // and 404s. The fr/ar/es JSON stubs on disk are not yet translation-ready.
    locales: ['en', 'sw'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
});
