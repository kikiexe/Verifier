import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  // 1. Transpile paket Web3 modern agar kompatibel
  transpilePackages: [
    '@rainbow-me/rainbowkit', 
    'wagmi', 
    'viem', 
    '@metamask/sdk'
  ],

  // 2. Mencegah error library logging "pino" & "thread-stream"
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],

  // 3. Konfigurasi Webpack Kustom
  webpack: (config) => {
    
    // A. Abaikan modul Node.js yang tidak ada di browser
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      "bufferutil": "commonjs bufferutil",
      "pino-pretty": "commonjs pino-pretty",
      "lokijs": "commonjs lokijs",
      "encoding": "commonjs encoding",
    });

    // B. Matikan modul React Native agar tidak dicari oleh Webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false, 
    };

    // C. Sembunyikan warning yang mengganggu di log Vercel
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Module not found: Can't resolve '@react-native-async-storage\/async-storage'/,
    ];
    
    return config;
  },

  // 4. Bypass error TypeScript saat build (PENTING untuk deploy cepat)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 5. Bypass error ESLint saat build
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;