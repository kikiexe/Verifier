"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/utils/ethers-adapter";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/ipfs"; // Pastikan import ini ada walau file upload dimatikan sementara
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import HybridToggle from "@/components/HybridToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";

// Saweria Utils
const cardStyle = `border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg bg-white p-6 transition-all`;
const inputStyle = `w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white font-bold placeholder:font-normal`;
const buttonStyle = `w-full flex items-center justify-center gap-2 px-6 py-4 font-black text-black border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all`;

export default function UploadPage() {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();

  const [recipient, setRecipient] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isSoulbound, setIsSoulbound] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [documentHash, setDocumentHash] = useState<string>("");
  const [successTx, setSuccessTx] = useState<string>("");

  useEffect(() => {
    if (address) setRecipient(address);
  }, [address]);

  const calculateHash = async (fileInput: File): Promise<string> => {
    const arrayBuffer = await fileInput.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const validateInput = (): boolean => {
    // 1. Cek File Ada
    if (!file) {
      alert("File belum dipilih!");
      return false;
    }
    
    // 2. Cek Tipe File (Wajib PDF)
    if (file.type !== "application/pdf") {
      alert("Hanya format PDF yang diizinkan! (Security Check)");
      return false;
    }

    // 3. Cek Ukuran File (Misal Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert("Ukuran file terlalu besar! Maksimal 5MB.");
      return false;
    }

    // 4. Cek Input Teks
    if (!form.name.trim() || form.name.length < 5) {
      alert("Judul dokumen terlalu pendek (min. 5 karakter).");
      return false;
    }

    if (!recipient || !ethers.isAddress(recipient)) {
      alert("Address penerima tidak valid (Format Ethereum: 0x...)");
      return false;
    }

    return true;
  };

  const handleMint = async () => {
    if (!isConnected) return alert("Koneksikan wallet dulu!");
    
    // --- FIX TYPESCRIPT 1: Cek Signer ---
    // TypeScript perlu jaminan bahwa 'signer' tidak undefined sebelum dipakai
    if (!signer) return alert("Signer belum siap / Wallet error!");

    if (!validateInput()) return;

    // --- FIX TYPESCRIPT 2: Cek File ---
    // TypeScript perlu jaminan eksplisit di scope ini bahwa file ada
    if (!file) return; 

    setLoading(true);
    setSuccessTx("");

    try {
      setStatus("Menghitung Hash Dokumen...");
      
      // Sekarang aman karena kita sudah cek 'if (!file) return' di atas
      const docHash = await calculateHash(file);
      setDocumentHash(docHash);
      
      // const fileCid = await uploadFileToIPFS(file); // Privacy: OFF
      const fileCid = "private-document"; 

      const metadata = {
        name: form.name,
        description: form.description,
        document: fileCid,
        attributes: [
          { trait_type: "Type", value: isSoulbound ? "SBT" : "NFT" },
          { trait_type: "Issuer", value: address },
          { trait_type: "Hash", value: docHash }
        ],
      };
      
      setStatus("Upload Metadata JSON (Privasi Terjaga)...");
      const message = `Konfirmasi Penerbitan:\nHash: ${docHash}\nPenerima: ${recipient}`;
      
      // Sekarang aman karena kita sudah cek 'if (!signer) return' di atas
      await signer.signMessage(message);

      const metadataCid = await uploadJSONToIPFS(metadata);

      setStatus("Menunggu Konfirmasi Transaksi Blockchain...");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      try {
        tx = await contract.mintOfficialDocument(recipient, metadataCid, isSoulbound, docHash);
        setStatus("Mencetak Dokumen Resmi (Verified Issuer)...");
      } catch (err) {
        console.log("Not verified issuer, switching to public mint...");
        tx = await contract.mintPublicDocument(metadataCid, isSoulbound, docHash);
        setStatus("Mencetak Dokumen Pribadi (Self-Signed)...");
      }

      await tx.wait();
      
      setSuccessTx(tx.hash);
      setStatus("SUKSES! Hash tercatat, File aman di lokal.");
      
    } catch (error: any) {
      console.error(error);
      setStatus("❌ Gagal: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20 pt-8 font-sans text-slate-900">
      <main className="mx-auto max-w-2xl px-4">
        
        {/* Header Box */}
        <div className="mb-6 rounded-lg border-2 border-black bg-[#fbbf24] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black flex items-center gap-2">
            <Upload size={24}/> Terbitkan Dokumen
            </h2>
            <p className="text-sm font-bold mt-1 opacity-90">
                Pastikan file benar. Blockchain tidak bisa di-undo!
            </p>
        </div>

        {/* Connect Wallet Guard */}
        {!isConnected ? (
            <div className={`${cardStyle} text-center space-y-4`}>
                <p className="font-bold text-lg">Anda belum terhubung.</p>
                <div className="flex justify-center">
                    <ConnectButton />
                </div>
            </div>
        ) : (
            <div className={`${cardStyle} space-y-6`}>
                
                {/* Success State */}
                {successTx && (
                    <div className="mb-6 rounded-lg border-2 border-black bg-green-100 p-4 animate-in zoom-in">
                        <div className="flex items-center gap-2 text-green-800 font-black text-lg mb-2">
                            <CheckCircle /> BERHASIL!
                        </div>
                        <p className="text-xs font-mono break-all bg-white p-2 rounded border border-green-300">
                            Tx: {successTx}
                        </p>
                        <button 
                            onClick={() => { setSuccessTx(""); setFile(null); setForm({name:"", description:""}); }}
                            className="mt-3 text-sm font-bold underline hover:text-green-600"
                        >
                            Upload Lagi
                        </button>
                    </div>
                )}

                {/* File Upload */}
                {!file ? (
                    <div className="relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black bg-gray-50 hover:bg-yellow-50 transition-colors">
                        <input 
                            type="file" 
                            accept=".pdf" 
                            className="absolute h-full w-full cursor-pointer opacity-0" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)} 
                        />
                        <div className="rounded-full bg-white p-3 border-2 border-black mb-2 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <p className="font-bold">Klik / Geser PDF ke sini</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-blue-50 p-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="shrink-0 bg-blue-200 p-2 rounded border border-black">
                                <FileText size={20} />
                            </div>
                            <div className="truncate">
                                <p className="font-bold truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="rounded-full p-1 hover:bg-red-100 border-2 border-transparent hover:border-black transition-all">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Form Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-black mb-1">Judul Dokumen</label>
                        <input 
                            type="text" 
                            className={inputStyle} 
                            placeholder="Contoh: Ijazah S1 - 2025"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">Penerima (Wallet Address)</label>
                        <input 
                            type="text" 
                            className={`${inputStyle} font-mono text-sm`} 
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">Deskripsi (Opsional)</label>
                        <textarea 
                            rows={2} 
                            className={inputStyle} 
                            placeholder="Keterangan tambahan..."
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Hybrid Toggle */}
                <div>
                    <label className="block text-sm font-black mb-2">Jenis Kepemilikan:</label>
                    <HybridToggle isSoulbound={isSoulbound} setIsSoulbound={setIsSoulbound} />
                </div>

                {/* Action Button */}
                <button 
                    onClick={handleMint}
                    disabled={loading || !file}
                    className={`${buttonStyle} ${loading || !file ? 'bg-gray-200 text-gray-400 border-gray-400 shadow-none cursor-not-allowed' : 'bg-[#fbbf24] hover:bg-yellow-400'}`}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin" /> Memproses Blockchain...</>
                    ) : (
                        "Tanda Tangan & Cetak"
                    )}
                </button>

                {/* Status Bar */}
                {status && !successTx && (
                    <div className="text-center text-xs font-bold bg-gray-100 p-2 rounded border border-black animate-pulse">
                        {status}
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}