const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm asset support for expo-sqlite web
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Enable package exports resolution
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
