"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { Search, CheckCircle, XCircle, FileText, Upload, Loader2, ShieldAlert } from "lucide-react";

const cardStyle = `border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg bg-white p-6`;

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

      // 2. Panggil Blockchain
      const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/IRm0znUyu95uZVbyEupxv");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Panggil fungsi verifyByHash dari Smart Contract
      const result = await contract.verifyByHash(docHash);
      
      // Destructure hasil return dari Solidity
      // returns (bool exists, uint256 tokenId, address owner, address issuer, string issuerName, DocumentData data)
      const [exists, tokenId, owner, issuer, issuerName, docData] = result;

      if (!exists) {
        throw new Error("Dokumen ini TIDAK TERDAFTAR di Blockchain TrustChain.");
      }

      // 3. Ambil Metadata Tambahan (Optional)
      let metadata = {};
      try {
        const uri = await contract.tokenURI(tokenId);
        const httpUri = uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
        const metaRes = await fetch(httpUri);
        metadata = await metaRes.json();
      } catch (err) {
        console.warn("Gagal ambil metadata IPFS");
      }

      setData({
        tokenId: tokenId.toString(),
        owner,
        issuer,
        issuerName,
        isSoulbound: docData.isSoulbound,
        isVerified: docData.isVerified,
        isRevoked: docData.isRevoked,
        timestamp: new Date(Number(docData.timestamp) * 1000).toLocaleDateString("id-ID", { dateStyle: 'full' }),
        hash: docData.documentHash,
        metadata
      });

    } catch (err: any) {
        console.error(err);
        setError(err.reason || err.message || "Terjadi kesalahan sistem.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20 pt-8 font-sans text-slate-900">
      <main className="mx-auto max-w-2xl px-4">
        
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-black mb-2">Verifikasi Dokumen</h1>
            <p className="font-medium text-gray-600">Upload file PDF untuk mengecek validitasnya.</p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
            {!file ? (
                <div className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black bg-gray-50 hover:bg-yellow-50 transition-colors">
                    <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute h-full w-full cursor-pointer opacity-0" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                                setError(""); // Reset error saat file baru dipilih
                            }
                        }} 
                    />
                    <div className="rounded-full bg-white p-4 border-2 border-black mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Upload size={32} />
                    </div>
                    <p className="font-bold">Klik atau Geser PDF ke sini</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-blue-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-200 p-2 rounded border border-black"><FileText /></div>
                            <span className="font-bold">{file.name}</span>
                        </div>
                        <button onClick={() => {setFile(null); setData(null);}} className="text-red-600 font-bold hover:underline">Ganti</button>
                    </div>
                    <button 
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full bg-[#fbbf24] border-2 border-black p-4 rounded-lg font-black text-lg hover:bg-yellow-400 shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <><Loader2 className="animate-spin"/> Memeriksa...</> : "🔍 CEK KEASLIAN SEKARANG"}
                    </button>
                </div>
            )}
        </div>

        {/* Error State */}
        {error && (
            <div className="bg-red-100 border-2 border-black p-6 rounded-lg text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in">
                <XCircle size={48} className="mx-auto text-red-600 mb-2" />
                <h3 className="font-black text-xl text-red-800">DOKUMEN PALSU / TIDAK TERDAFTAR</h3>
                <p className="font-medium text-red-700 mt-1">{error}</p>
            </div>
        )}

        {/* Success / Result State */}
        {data && (
            <div className={`${cardStyle} animate-in slide-in-from-bottom-4 border-l-8 ${data.isRevoked ? 'border-l-red-500' : (data.isVerified ? 'border-l-blue-500' : 'border-l-gray-400')}`}>
                
                {/* Status Badge */}
                <div className="mb-6 flex justify-center">
                    {data.isRevoked ? (
                        <div className="px-4 py-2 bg-red-500 text-white font-black border-2 border-black rounded-full flex items-center gap-2">
                            <ShieldAlert /> DOKUMEN DICABUT (REVOKED)
                        </div>
                    ) : data.isVerified ? (
                        <div className="px-4 py-2 bg-blue-500 text-white font-black border-2 border-black rounded-full flex items-center gap-2">
                            <CheckCircle /> TERVERIFIKASI RESMI (OFFICIAL)
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-gray-200 text-gray-800 font-black border-2 border-black rounded-full flex items-center gap-2">
                            ⚠️ SELF-SIGNED (PUBLIC)
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-4 text-center">
                    <div>
                        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1">Penerbit Dokumen</p>
                        <h2 className="text-2xl font-black">{data.issuerName || "Unknown Issuer"}</h2>
                        <p className="font-mono text-xs bg-gray-100 inline-block px-2 py-1 rounded border border-gray-300 mt-1">{data.issuer}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left mt-6">
                        <div className="bg-yellow-50 p-3 border-2 border-black rounded">
                            <p className="text-[10px] font-bold text-gray-500">PEMILIK</p>
                            <p className="font-mono text-xs break-all">{data.owner}</p>
                        </div>
                        <div className="bg-cyan-50 p-3 border-2 border-black rounded">
                            <p className="text-[10px] font-bold text-gray-500">TANGGAL</p>
                            <p className="font-bold text-sm">{data.timestamp}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                        <p className="text-xs text-gray-500 font-bold mb-1">HASH TERDAFTAR (SHA-256)</p>
                        <p className="font-mono text-[10px] break-all bg-slate-900 text-white p-2 rounded">{data.hash}</p>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}