/**
 * ClientLayout - Komponen pembungkus sisi klien (Client-side Wrapper).
 * Menangani import dinamis Web3Provider dengan `ssr: false` untuk menghindari error hidrasi.
 */
"use client";

import React from "react";
import dynamic from "next/dynamic";

// Web3Provider is imported dynamically with ssr: false 
// to prevent hydration issues with Wagmi/RainbowKit
const Web3Provider = dynamic(
  () => import("../provider/wallet").then((mod) => mod.Web3Provider),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}