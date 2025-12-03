"use client";

import Link from "next/link";
import { Upload, Search, Lock, CheckCircle, Wallet } from "lucide-react";

const cardStyle = `border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg bg-white p-6 transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`;
const buttonStyle = `flex items-center justify-center gap-2 px-6 py-3 font-bold text-black border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all`;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20 pt-8 font-sans text-slate-900">
      <main className="mx-auto max-w-3xl px-4 space-y-12">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border-2 border-black bg-[#fbbf24] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-black bg-white opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-2 border-black bg-white opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-black md:text-6xl">
              Notaris Digital <br/> Terdesentralisasi
            </h1>
            <p className="mx-auto mb-8 max-w-md font-bold text-black text-lg">
              Amankan ijazah, sertifikat, dan aset digitalmu dengan kekuatan Blockchain Arbitrum & IPFS
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/upload" className={`${buttonStyle} bg-white hover:bg-gray-50`}>
                <Upload size={20} /> Mulai Notarisasi
              </Link>
              <Link href="/verify" className={`${buttonStyle} bg-[#67e8f9] hover:brightness-110`}>
                <Search size={20} /> Cek Keaslian
              </Link>
            </div>
          </div>
        </div>

        {/* FFitur */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={cardStyle}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#67e8f9]">
              <Lock size={24} className="text-black" />
            </div>
            <h3 className="mb-2 text-lg font-black">Hybrid Token</h3>
            <p className="text-sm font-medium text-gray-600">
              Pilih mode <b>Terkunci (SBT)</b> untuk Ijazah atau <b>Transferable (NFT)</b> untuk Tiket
            </p>
          </div>

          <div className={cardStyle}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#f472b6]">
              <CheckCircle size={24} className="text-black" />
            </div>
            <h3 className="mb-2 text-lg font-black">Terverifikasi</h3>
            <p className="text-sm font-medium text-gray-600">
              Institusi resmi mendapat tanda <span className="inline-block rounded border border-black bg-blue-500 px-1 text-[10px] text-white">Centang Biru</span>. Anti palsu
            </p>
          </div>

          <div className={cardStyle}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-green-400">
              <Wallet size={24} className="text-black" />
            </div>
            <h3 className="mb-2 text-lg font-black">Hemat Biaya</h3>
            <p className="text-sm font-medium text-gray-600">
              Data di IPFS, bukti di Arbitrum L2. Biaya gas super murah (&lt;Rp 500/dokumen)
            </p>
          </div>
        </div>

        {/* Alur Kerja */}
        <div className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-6 text-2xl font-black text-center">Cara Kerja Velipe</h2>
          <div className="space-y-4">
              <Step number="1" text="Hubungkan Wallet & Upload PDF ke IPFS" />
              <Step number="2" text="Pilih Tipe: Permanen (SBT) atau Aset (NFT)" />
              <Step number="3" text="Smart Contract mencatat 'Sidik Jari' dokumen" />
              <Step number="4" text="Dokumen aman selamanya & mudah diverifikasi" />
          </div>
        </div>

      </main>
    </div>
  );
}

function Step({ number, text }: { number: string; text: string }) {
    return (
        <div className="flex items-center gap-4 rounded-lg border-2 border-black bg-gray-50 p-3 hover:bg-yellow-50 transition-colors">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border-2 border-black bg-black font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                {number}
            </span>
            <p className="font-bold text-sm">{text}</p>
        </div>
    )
}