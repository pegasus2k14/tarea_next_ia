import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // La UI carga datos desde el cliente (mocks o API con `useAsync`), por lo
    // que ninguna navegación puede ser "instantánea". Validamos solo segmentos
    // que lo declaren explícitamente con `export const instant`.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
