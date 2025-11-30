"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi"; // Gunakan hook dari Wagmi
import { useEthersSigner } from "@/utils/ethers-adapter"; // Gunakan adapter yang sudah ada
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit"; // Gunakan tombol standar RainbowKit

// Role Hash dari Solidity (keccak256("GOVERNANCE_ROLE"))
const GOVERNANCE_ROLE = ethers.id("GOVERNANCE_ROLE"); 

interface Issuer {
  address: string;
  name: string;
}

export default function AdminPage() {
  // 1. Ganti logika manual window.ethereum dengan Hooks ini
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const [newIssuerAddress, setNewIssuerAddress] = useState<string>("");
  const [newIssuerName, setNewIssuerName] = useState<string>("");

  // 2. Cek Role Admin secara otomatis saat wallet terkoneksi
  useEffect(() => {
    const checkRole = async () => {
      if (signer && address && REGISTRY_ADDRESS) {
        try {
          // Reset status dulu
          setIsAdmin(false);
          
          const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
          
          // Cek apakah user punya role GOVERNANCE_ROLE
          const hasRole = await registry.hasRole(GOVERNANCE_ROLE, address);
          setIsAdmin(hasRole);

          if (!hasRole) {
            console.warn("Wallet connected but not Admin");
          }
        } catch (error: any) {
          console.error("Error checking role:", error);
        }
      }
    };

    if (isConnected) {
      checkRole();
    } else {
      setIsAdmin(false);
    }
  }, [signer, address, isConnected]);

  const handleAddIssuer = async () => {
    if (!signer) return alert("Wallet tidak terdeteksi!");
    if (!newIssuerAddress || !newIssuerName) return alert("Data tidak lengkap!");
    
    setLoading(true);
    setStatus("⏳ Mendaftarkan Issuer ke Blockchain...");

    try {
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);

      const tx = await registry.addIssuer(newIssuerAddress, newIssuerName);
      await tx.wait();

      setStatus("✅ Berhasil! Issuer terdaftar.");
      setIssuers([...issuers, { address: newIssuerAddress, name: newIssuerName }]);
      setNewIssuerAddress("");
      setNewIssuerName("");
    } catch (error: any) {
      console.error(error);
      // Handle error spesifik
      if (error.reason) {
        setStatus("❌ Gagal: " + error.reason);
      } else {
        setStatus("❌ Gagal: " + (error.message || "Transaksi dibatalkan"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIssuer = async (targetAddress: string, targetName: string) => {
    if (!signer) return;
    if (!confirm(`Yakin ingin menghapus ${targetName}?`)) return;

    setLoading(true);
    setStatus("⏳ Menghapus issuer...");

    try {
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const tx = await registry.removeIssuer(targetAddress);
      await tx.wait();

      setStatus("✅ Issuer berhasil dihapus!");
      setIssuers(issuers.filter((i) => i.address !== targetAddress));
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Gagal: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-6">🏛️ Governance Dashboard</h1>

        {/* 3. Gunakan ConnectButton dari RainbowKit, bukan button manual */}
        <div className="mb-8 flex justify-center">
            <ConnectButton />
        </div>

        {!isConnected ? (
          <div className="bg-white p-8 rounded-xl shadow text-center border-2 border-black">
            <p className="font-bold text-lg">Silakan hubungkan wallet Admin terlebih dahulu.</p>
          </div>
        ) : !isAdmin ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded shadow">
            <p className="font-black text-xl mb-2">⛔ Akses Ditolak</p>
            <p>Wallet <b>{address}</b> tidak memiliki izin Governance (Admin).</p>
            <p className="text-sm mt-2">Pastikan Anda menggunakan wallet yang melakukan deploy contract.</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-mono">Login sebagai: {address}</p>
              <p className="font-bold text-green-700">✅ Governance Access Active</p>
            </div>

            <h2 className="text-xl font-bold mb-4">Tambah Verified Issuer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nama Institusi</label>
                <input 
                    type="text" 
                    placeholder="Contoh: Universitas Amikom" 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-black transition-colors"
                    value={newIssuerName}
                    onChange={(e) => setNewIssuerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Wallet Address</label>
                <input 
                    type="text" 
                    placeholder="0x..." 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono focus:border-black transition-colors"
                    value={newIssuerAddress}
                    onChange={(e) => setNewIssuerAddress(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddIssuer}
                disabled={loading}
                className="w-full bg-slate-900 text-white p-4 rounded-lg font-bold hover:bg-slate-800 disabled:bg-gray-400 transition-all active:scale-[0.99]"
              >
                {loading ? "Memproses Transaksi..." : "✨ Daftarkan Issuer Baru"}
              </button>
            </div>
            
            {status && (
                <div className={`mt-6 p-4 rounded-lg text-center font-bold border-2 ${status.includes("Gagal") ? "bg-red-100 border-red-500 text-red-800" : "bg-green-100 border-green-500 text-green-800"}`}>
                    {status}
                </div>
            )}

            {/* List Placeholder (Opsional) */}
            <div className="mt-10 border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Issuer Terdaftar (Session Ini)</h3>
                {issuers.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Belum ada issuer yang ditambahkan di sesi ini.</p>
                ) : (
                    <ul className="space-y-2">
                        {issuers.map((iss, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                                <div>
                                    <p className="font-bold">{iss.name}</p>
                                    <p className="text-xs font-mono text-gray-600">{iss.address}</p>
                                </div>
                                <button 
                                    onClick={() => handleRemoveIssuer(iss.address, iss.name)}
                                    className="text-red-600 text-xs font-bold hover:underline"
                                >
                                    Hapus
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}