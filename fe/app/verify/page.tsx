"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Upload, 
  Loader2, 
  ShieldAlert, 
  Shield, 
  Globe, 
  ExternalLink 
} from "lucide-react";

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleVerify = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      // 1. Hitung Hash File Lokal
      const docHash = await calculateHash(file);
      console.log("Calculated Hash:", docHash);

      // 2. Panggil Blockchain (Menggunakan RPC Publik)
      const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/IRm0znUyu95uZVbyEupxv");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // 3. Verifikasi on-chain
      const result = await contract.verifyByHash(docHash);
      const [exists, tokenId, owner, issuer, issuerName, docData] = result;

      if (!exists) {
        throw new Error("Dokumen ini TIDAK TERDAFTAR di Blockchain TrustChain.");
      }

      // 4. Ambil Metadata (Optional via IPFS)
      let metadata = {};
      try {
        const uri = await contract.tokenURI(tokenId);
        const httpUri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const metaRes = await fetch(httpUri);
        metadata = await metaRes.json();
      } catch (err) {
        console.warn("Gagal ambil metadata IPFS, menggunakan data on-chain saja.");
      }

      setData({
        tokenId: tokenId.toString(),
        owner,
        issuer,
        issuerName,
        isSoulbound: docData.isSoulbound,
        isVerified: docData.isVerified,
        isRevoked: docData.isRevoked,
        timestamp: new Date(Number(docData.timestamp) * 1000).toLocaleDateString("id-ID", { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        hash: docData.documentHash,
        uri: await contract.tokenURI(tokenId),
        metadata
      });

    } catch (err: any) {
        console.error(err);
        setError(err.reason || err.message || "Terjadi kesalahan sistem atau koneksi RPC.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20 pt-8 font-sans text-slate-900">
      <main className="mx-auto max-w-3xl px-4">
        
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Verifikasi Dokumen</h1>
            <p className="font-medium text-gray-500 text-lg">Validasi keaslian dokumen digital dengan teknologi Blockchain.</p>
        </div>

        {/* Upload Area */}
        <div className="mb-10 w-full max-w-2xl mx-auto">
            {!file ? (
                <div className="relative flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-3 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                    <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute h-full w-full cursor-pointer opacity-0 z-10" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                                setError(""); 
                            }
                        }} 
                    />
                    <div className="mb-4 rounded-full bg-white p-5 shadow-sm ring-1 ring-gray-200 group-hover:scale-110 transition-transform">
                        <Upload size={32} className="text-blue-600" />
                    </div>
                    <p className="font-bold text-lg text-gray-700 group-hover:text-blue-700">Klik atau Geser PDF ke sini</p>
                    <p className="text-sm text-gray-400 mt-1">Mendukung format PDF</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border-2 border-black p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl mb-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-200 p-3 rounded-lg border-2 border-black text-black">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                <p className="text-xs font-bold text-blue-600">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {setFile(null); setData(null); setError("");}} 
                            className="text-red-600 font-bold hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                        >
                            Ganti
                        </button>
                    </div>
                    <button 
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full bg-[#fbbf24] hover:bg-yellow-400 text-black p-4 rounded-xl font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex justify-center items-center gap-3"
                    >
                        {loading ? <><Loader2 className="animate-spin" size={24}/> Memeriksa...</> : <><Search size={24} strokeWidth={3} /> CEK KEASLIAN SEKARANG</>}
                    </button>
                </div>
            )}
        </div>

        {/* Error State */}
        {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-500 p-8 rounded-2xl text-center animate-in zoom-in duration-300">
                <div className="inline-flex bg-red-100 p-4 rounded-full mb-4">
                    <XCircle size={48} className="text-red-600" />
                </div>
                <h3 className="font-black text-2xl text-red-800 mb-2">DOKUMEN TIDAK VALID</h3>
                <p className="font-medium text-red-700 text-lg">Hash dokumen tidak ditemukan di database Blockchain kami.</p>
                <p className="text-sm text-red-500 mt-4 bg-white/50 p-2 rounded inline-block font-mono">{error}</p>
            </div>
        )}

        {/* Success / Result State */}
        {data && (
          <div className="mt-8 w-full max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            {/* Header Kartu - Gradient Background */}
            <div className={`relative overflow-hidden rounded-t-3xl p-8 ${data.isVerified ? "bg-linear-to-br from-blue-600 to-blue-800" : "bg-linear-to-br from-gray-700 to-gray-900"} text-white shadow-2xl`}>
              
              {/* Background Pattern Hiasan */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <Shield size={180} strokeWidth={1.5} />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {data.metadata?.name || "Dokumen Terverifikasi"}
                  </h2>
                  <p className="text-blue-100/90 text-sm max-w-xl leading-relaxed">
                    {data.metadata?.description || "Deskripsi tidak tersedia untuk dokumen ini."}
                  </p>
                </div>
                
                {/* Badge Status */}
                <div className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-lg whitespace-nowrap border backdrop-blur-sm ${data.isVerified ? "bg-white/10 border-white/30 text-white" : "bg-white/10 border-white/30 text-gray-200"}`}>
                  {data.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Shield className="h-5 w-5 text-yellow-400" />
                  )}
                  <span>
                    {data.isVerified ? "TERVERIFIKASI RESMI (OFFICIAL)" : "SELF-SIGNED (PUBLIC)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Body Kartu - Detail Informasi */}
            <div className="bg-white rounded-b-3xl p-8 shadow-2xl border border-t-0 border-gray-100 relative top-px">
              
              {/* Revoked Warning */}
              {data.isRevoked && (
                  <div className="mb-8 flex items-center gap-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <ShieldAlert className="text-red-600 h-8 w-8" />
                      <div>
                          <h4 className="font-bold text-red-800">PERINGATAN: DOKUMEN DICABUT</h4>
                          <p className="text-sm text-red-700">Penerbit telah menyatakan dokumen ini tidak lagi berlaku.</p>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Kolom Kiri: Detail Penerbit & Waktu */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-blue-50/50">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diterbitkan Oleh</p>
                      <p className="text-xl font-bold text-gray-900 wrap-break-words leading-tight">
                        {data.issuerName || (data.isVerified ? "Institusi Tidak Dikenal" : "User (Self-Signed)")}
                      </p>
                      {data.issuerName && data.isVerified && (
                         <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                           <CheckCircle size={12} /> Verified Issuer
                         </span>
                      )}
                      <p className="font-mono text-[10px] text-gray-400 mt-2 truncate max-w-[200px]">{data.issuer}</p>
                    </div>
                  </div>

                   <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-purple-50/50">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Pencatatan</p>
                      <p className="text-lg font-bold text-gray-900">
                        {data.timestamp}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Waktu blok tervalidasi</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Detail Teknis & Link */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield size={14} /> Digital Fingerprint (SHA-256)
                    </p>
                    <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl border border-gray-200 shadow-inner">
                      <code className="font-mono text-xs text-green-400 break-all leading-relaxed">
                        {data.hash}
                      </code>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full w-fit">
                        <CheckCircle size={14} /> Hash Cocok dengan File Fisik
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <a
                      href={data.uri ? data.uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition-all text-center"
                    >
                      <Upload className="h-5 w-5" />
                      Lihat Metadata JSON
                    </a>
                    <a
                      href={`https://sepolia.basescan.org/token/${CONTRACT_ADDRESS}?a=${data.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 text-center"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Cek di BaseScan
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}