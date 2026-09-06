/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pos/shared"],
  webpack: (config) => {
    // @pos/shared is consumed as TS source and uses NodeNext-style ".js" extensions
    // that actually point at ".ts" files (required for apps/api's ts-node/tsc resolution).
    // Node's own loader maps that automatically; webpack's resolver doesn't, so teach it to.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
