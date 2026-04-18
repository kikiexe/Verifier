/**
 * Web3Provider - Konfigurasi utama untuk ekosistem Web3 di aplikasi.
 * Menghubungkan Wagmi, RainbowKit (Wallet), dan TanStack Query ke dalam satu root provider.
 */
"use client";

import React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { baseSepolia } from "wagmi/chains"; 
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Velipe",
  projectId: "071c0c56863052b8e8b516d3cd1669e9",
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 menit
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
            theme={lightTheme({
                accentColor: '#2563EB',
                borderRadius: 'medium',
            })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}