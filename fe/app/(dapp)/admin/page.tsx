/**
 * AdminPage - Halaman tata kelola (Governance).
 * Hanya dapat diakses oleh Pengelola Platform untuk mendaftarkan atau menghapus verified issuer.
 */
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAdmin, useAdminMutations } from "@/hooks/useAdmin";
import { Loader2, ShieldCheck, ShieldAlert, Plus, Trash2, UserCog } from "lucide-react";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { 
    isAdmin, 
    isAdminLoading, 
    issuers, 
    issuersLoading, 
    refetchIssuers 
  } = useAdmin();
  
  const { addIssuer, removeIssuer } = useAdminMutations();

  const [newIssuerAddress, setNewIssuerAddress] = useState<string>("");
  const [newIssuerName, setNewIssuerName] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleAddIssuer = async () => {
    if (!newIssuerAddress || !newIssuerName) return alert("Data tidak lengkap!");
    
    setStatus("Mendaftarkan Issuer ke Blockchain...");
    try {
      await addIssuer.mutateAsync({ address: newIssuerAddress, name: newIssuerName });
      setStatus("✅ Berhasil! Issuer terdaftar.");
      setNewIssuerAddress("");
      setNewIssuerName("");
    } catch (error: unknown) {
      console.error(error);
      const err = error as { reason?: string; message?: string };
      setStatus("❌ Gagal: " + (err.reason || err.message || "Terjadi kesalahan"));
    }
  };

  const handleRemoveIssuer = async (targetAddress: string, targetName: string) => {
    if (!confirm(`Yakin ingin menghapus ${targetName}?`)) return;

    setStatus("Menghapus issuer...");
    try {
      await removeIssuer.mutateAsync(targetAddress);
      setStatus("✅ Issuer berhasil dihapus!");
    } catch (error: unknown) {
      console.error(error);
      const err = error as { reason?: string; message?: string };
      setStatus("❌ Gagal: " + (err.reason || err.message));
    }
  };

  const cardStyle = "bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const inputStyle = "w-full p-4 border-4 border-black rounded-xl focus:outline-none focus:bg-yellow-50 transition-colors font-bold";
  const buttonStyle = "w-full bg-black text-white p-4 rounded-xl font-black text-lg hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
            <div className="bg-[#fbbf24] p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <UserCog size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Governance</h1>
        </div>

        <div className="mb-10 flex justify-center">
            <ConnectButton />
        </div>

        {!isConnected ? (
          <div className={cardStyle + " text-center"}>
            <p className="font-black text-xl">Wallet Disconnected</p>
            <p className="text-gray-500 font-bold mt-2">Silakan hubungkan wallet Pengelola Platform untuk melanjutkan.</p>
          </div>
        ) : isAdminLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-black">Memverifikasi Izin Pengelola Platform...</p>
          </div>
        ) : !isAdmin ? (
          <div className="bg-red-50 border-4 border-red-500 p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <div className="flex items-center gap-4 text-red-600 mb-4">
                <ShieldAlert size={40} />
                <h2 className="text-3xl font-black">AKSES DITOLAK</h2>
            </div>
            <p className="font-bold text-red-800 mb-4">
                Wallet <code className="bg-white px-2 py-1 rounded border-2 border-red-200">{address}</code> tidak memiliki izin Governance.
            </p>
            <p className="text-sm text-red-600 font-bold uppercase tracking-widest bg-white p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_black]">
                Hanya akun pembuat smart contract yang dapat mengakses fitur ini.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* User Info */}
            <div className="bg-green-50 border-4 border-green-500 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-1">Authenticated Wallet</p>
                <p className="font-mono text-xs font-black text-green-800 truncate max-w-[200px] sm:max-w-md">{address}</p>
              </div>
              <ShieldCheck className="text-green-600 shrink-0" size={32} />
            </div>

            {/* Form Tambah Issuer */}
            <div className={cardStyle}>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Plus size={24} strokeWidth={3} /> TAMBAH VERIFIED ISSUER
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Nama Institusi</label>
                  <input 
                      type="text" 
                      placeholder="Contoh: Universitas Amikom" 
                      className={inputStyle}
                      value={newIssuerName}
                      onChange={(e) => setNewIssuerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Wallet Address (0x...)</label>
                  <input 
                      type="text" 
                      placeholder="0x..." 
                      className={inputStyle + " font-mono text-sm"}
                      value={newIssuerAddress}
                      onChange={(e) => setNewIssuerAddress(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAddIssuer}
                  disabled={addIssuer.isPending}
                  className={buttonStyle}
                >
                  {addIssuer.isPending ? (
                    <span className="flex items-center justify-center gap-2 uppercase">
                        <Loader2 className="animate-spin" /> Sedang Memproses...
                    </span>
                  ) : "DAFTARKAN ISSUER SEKARANG"}
                </button>
              </div>
              
              {status && (
                  <div className={`mt-6 p-4 rounded-xl text-center font-black border-4 shadow-[4px_4px_0px_0px_black] ${status.includes("Gagal") ? "bg-red-100 border-red-500 text-red-800" : "bg-green-100 border-green-500 text-green-800"}`}>
                      {status.toUpperCase()}
                  </div>
              )}
            </div>
            
            {/* List Issuer Terdaftar */}
            <div className={cardStyle}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-2xl">ISSUER TERDAFTAR</h3>
                    <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-black">
                        {issuers.length}
                    </div>
                </div>

                {issuersLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="font-bold text-gray-400">Menarik data dari blockchain...</p>
                    </div>
                ) : issuers.length === 0 ? (
                    <p className="text-gray-400 font-bold italic text-center py-10 bg-slate-50 rounded-xl border-4 border-dashed border-slate-200">
                        Belum ada issuer yang terdaftar di smart contract.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {issuers.map((iss, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border-4 border-black hover:bg-yellow-50 transition-colors group">
                                <div className="overflow-hidden">
                                    <p className="font-black text-lg truncate">{iss.name}</p>
                                    <p className="text-xs font-mono font-bold text-gray-500 truncate">{iss.address}</p>
                                </div>
                                <button 
                                    onClick={() => handleRemoveIssuer(iss.address, iss.name)}
                                    disabled={removeIssuer.isPending && removeIssuer.variables === iss.address}
                                    className="bg-white border-4 border-black p-2 rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                                    title="Hapus Issuer"
                                >
                                    {removeIssuer.isPending && removeIssuer.variables === iss.address ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={20} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={() => refetchIssuers()}
                    className="w-full mt-6 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                >
                    Refresh List
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}