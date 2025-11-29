"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
// Note: You'll need to add REGISTRY_ADDRESS and REGISTRY_ABI to constants/index.ts
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

// For now, using placeholder - update after deployment
const REGISTRY_ADDRESS = "0x..."; // Update this after deploy
const REGISTRY_ABI = [
  "function owner() view returns (address)",
  "function addIssuer(address _issuer, string _name)",
  "function removeIssuer(address _issuer)",
  "function isIssuer(address _account) view returns (bool)",
  "function issuerNames(address _account) view returns (string)",
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Issuer {
  address: string;
  name: string;
  isAuthorized: boolean;
}

export default function AdminPage() {
  const [account, setAccount] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  // Form state
  const [newIssuerAddress, setNewIssuerAddress] = useState<string>("");
  const [newIssuerName, setNewIssuerName] = useState<string>("");

  // Connect wallet and check if owner
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      // Check if user is contract owner
      const registry = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );
      const owner = await registry.owner();
      setIsOwner(addr.toLowerCase() === owner.toLowerCase());

      if (addr.toLowerCase() !== owner.toLowerCase()) {
        alert("⚠️ Anda bukan admin! Hanya owner contract yang bisa akses.");
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  // Load issuers (for display purposes, would need event indexing in production)
  const loadIssuers = async () => {
    // Note: In production, you'd want to use The Graph or event indexing
    // This is a simplified example
    setStatus("📊 Loading issuers...");
    // For now, just show manual input
    setStatus("");
  };

  // Add new issuer
  const handleAddIssuer = async () => {
    if (!newIssuerAddress || !newIssuerName) {
      return alert("Address dan Nama harus diisi!");
    }

    if (!ethers.isAddress(newIssuerAddress)) {
      return alert("Address tidak valid!");
    }

    setLoading(true);
    setStatus("⏳ Menambahkan issuer...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const registry = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await registry.addIssuer(newIssuerAddress, newIssuerName);
      setStatus("⏳ Menunggu konfirmasi blockchain...");

      await tx.wait();

      setStatus("✅ Issuer berhasil ditambahkan!");
      alert(`✅ Issuer berhasil ditambahkan!\n\n${newIssuerName}\n${newIssuerAddress}`);

      // Reset form
      setNewIssuerAddress("");
      setNewIssuerName("");

      // Add to local state
      setIssuers([
        ...issuers,
        {
          address: newIssuerAddress,
          name: newIssuerName,
          isAuthorized: true,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Gagal: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Remove issuer
  const handleRemoveIssuer = async (address: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return;

    setLoading(true);
    setStatus("⏳ Menghapus issuer...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const registry = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await registry.removeIssuer(address);
      await tx.wait();

      setStatus("✅ Issuer berhasil dihapus!");
      alert(`✅ ${name} berhasil dihapus!`);

      // Remove from local state
      setIssuers(issuers.filter((i) => i.address !== address));
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Gagal: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && isOwner) {
      loadIssuers();
    }
  }, [account, isOwner]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👨‍💼 Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Kelola Verified Issuers (Institusi/Mitra/Kampus)
          </p>
        </div>

        {/* Connect Wallet */}
        {!account ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="mb-4">
              <div className="inline-block p-4 bg-blue-100 rounded-full">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              Connect wallet untuk mengakses admin panel
            </p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              🦊 Connect Wallet
            </button>
          </div>
        ) : !isOwner ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
            <p className="text-red-800 font-bold text-lg mb-2">
              ⛔ Access Denied
            </p>
            <p className="text-red-600">
              Anda tidak memiliki akses admin. Hanya contract owner yang dapat
              mengakses halaman ini.
            </p>
            <p className="text-sm text-red-500 font-mono mt-4">
              Your address: {account}
            </p>
          </div>
        ) : (
          <>
            {/* Connected Info */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-8">
              <p className="text-green-800 font-bold mb-1">
                ✅ Connected as Admin
              </p>
              <p className="text-sm font-mono text-green-700">{account}</p>
            </div>

            {/* Add Issuer Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                ➕ Tambah Verified Issuer
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nama Institusi/Organisasi *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
                    placeholder="Contoh: Universitas Amikom Yogyakarta"
                    value={newIssuerName}
                    onChange={(e) => setNewIssuerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono text-gray-900"
                    placeholder="0x..."
                    value={newIssuerAddress}
                    onChange={(e) => setNewIssuerAddress(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Address wallet yang akan digunakan institusi untuk
                    menerbitkan dokumen resmi
                  </p>
                </div>

                <button
                  onClick={handleAddIssuer}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-white transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  {loading ? "⏳ Processing..." : "✓ Tambahkan Issuer"}
                </button>
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`mb-8 p-4 rounded-xl text-center font-medium ${
                  status.includes("Gagal")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : status.includes("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {status}
              </div>
            )}

            {/* Issuers List */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                📋 Daftar Verified Issuers
              </h2>

              {issuers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Belum ada issuer terdaftar</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tambahkan issuer pertama menggunakan form di atas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issuers.map((issuer, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                              ✓ VERIFIED
                            </span>
                            <h3 className="font-bold text-gray-900">
                              {issuer.name}
                            </h3>
                          </div>
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {issuer.address}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveIssuer(issuer.address, issuer.name)
                          }
                          disabled={loading}
                          className="ml-4 text-red-600 hover:text-red-800 font-bold text-sm disabled:opacity-50"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">
                💡 Petunjuk Admin
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  • Hanya address yang terdaftar yang bisa menerbitkan dokumen
                  "Official"
                </li>
                <li>
                  • Verifikasi identitas institusi sebelum menambahkan (email,
                  website, dokumen resmi)
                </li>
                <li>
                  • Address yang ditambahkan akan mendapat role "Verified
                  Issuer"
                </li>
                <li>
                  • Dokumen dari issuer terverifikasi akan mendapat badge
                  "Centang Hijau"
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}