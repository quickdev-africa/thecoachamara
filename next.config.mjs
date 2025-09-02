import { createRequire } from 'module';
/** @type {import('next').NextConfig} */


const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

};

export default nextConfig;

// Provide a userland alternative for the deprecated `punycode` builtin.
// This ensures server bundles use the npm package rather than the Node builtin
// which prints DEP0040 in recent Node versions.
if (typeof process !== 'undefined') {
  // Add a webpack alias when Next.js loads this config.
  // Resolve the userland package path so webpack can inline it instead
  // of leaving a runtime `require('punycode')` that resolves to Node's
  // builtin module and emits DEP0040.
  const require = createRequire(import.meta.url);
  const punycodePath = require.resolve('punycode/');

  nextConfig.webpack = (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      // Point imports to the resolved path inside node_modules.
      config.resolve.alias['punycode'] = punycodePath;
      config.resolve.alias['node:punycode'] = punycodePath;
    }
    return config;
  };
}
