// scripts/polyfill-punycode.js
// Preload this file via NODE_OPTIONS="--require path/to/this" to make
// Node resolve `require('punycode')` to the npm package implementation
// (userland) instead of the deprecated Node builtin. This prevents DEP0040
// warnings without modifying dependencies.

const Module = require('module');
const originalLoad = Module._load;
const resolve = Module._resolveFilename;

Module._load = function(request, parent, isMain) {
  if (request === 'punycode' || request === 'node:punycode') {
    // Prefer the npm package path. Using 'punycode/' ensures we load the
    // package entry (works with different versions).
    try {
      const resolved = resolve.call(this, 'punycode/', parent, isMain);
      return originalLoad.call(this, resolved, parent, isMain);
    } catch (e) {
      // Fall back to original request if resolution fails.
    }
  }
  return originalLoad.apply(this, arguments);
};

// Also handle imports via the node: prefix when used during resolution.
// Some bundlers or loaders may pass through that specifier.
