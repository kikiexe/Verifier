"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/utils/ethers-adapter";
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  REGISTRY_ADDRESS, 
  REGISTRY_ABI 
} from "@/constants";
import { X, FileText, ShieldAlert, Trash2, Loader2, User, Building, Copy, Check } from "lucide-react";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocItem {
  tokenId: string;
  timestamp: string;
  isVerified: boolean;
  isRevoked: boolean;
  hash: string;
  name: string;
  description: string;
}

export default function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State baru untuk menyimpan nama Institusi
  const [issuerProfileName, setIssuerProfileName] = useState<string>("Profil Publik");
  const [isOfficialIssuer, setIsOfficialIssuer] = useState<boolean>(false);

  const fetchMyDocuments = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org";
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

      // 1. Cek Status & Nama Issuer
      const isVerified = await registryContract.isIssuer(address);
      setIsOfficialIssuer(isVerified);
      if (isVerified) {
        // Ambil data struct Issuer dari mapping
        const issuerData = await registryContract.issuers(address);
        setIssuerProfileName(issuerData.name); 
      } else {
        setIssuerProfileName("Profil Publik");
      }

      // 2. Ambil array Token ID milik user ini
      const tokenIds: bigint[] = await contract.getIssuerDocuments(address);
      
      // 3. Looping ambil data per dokumen + Fetch Nama dari IPFS
      const docsData = await Promise.all(
        tokenIds.map(async (id) => {
          const [data, uri] = await Promise.all([
            contract.getDocumentData(id),
            contract.tokenURI(id)
          ]);

          let docName = "Memuat nama...";
          let docDesc = "";
          try {
            const httpUri = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            const metaRes = await fetch(httpUri);
            const metadata = await metaRes.json();
            docName = metadata.name || "Dokumen Tanpa Nama";
            docDesc = metadata.description || "";
          } catch (e) {
            console.warn(`Gagal ambil metadata untuk #${id}`, e);
            docName = "Dokumen # " + id.toString();
          }

          return {
            tokenId: id.toString(),
            name: docName,
            description: docDesc,
            timestamp: new Date(Number(data.timestamp) * 1000).toLocaleDateString("id-ID", {
              day: 'numeric', month: 'short', year: 'numeric'
            }),
            isVerified: data.isVerified,
            isRevoked: data.isRevoked,
            hash: data.documentHash,
          };
        })
      );

      setDocuments(docsData.reverse());
    } catch (error) {
      console.error("Gagal mengambil data dokumen:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isOpen && isConnected) {
      fetchMyDocuments();
    }
  }, [isOpen, isConnected, fetchMyDocuments]);

  const handleRevoke = async (tokenId: string) => {
    if (!signer) return alert("Wallet belum terhubung dengan benar!");
    if (!confirm(`PERINGATAN: Cabut validitas Dokumen #${tokenId}? Ini permanen!`)) return;

    setRevokingId(tokenId);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.revokeDocument(tokenId);
      
      alert("Memproses pencabutan di blockchain...");
      await tx.wait();
      
      alert(`SUKSES! Dokumen #${tokenId} telah dicabut.`);
      fetchMyDocuments(); 
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Gagal mencabut: " + errorMessage);
    } finally {
      setRevokingId(null);
    }
  };

  // UI IMPROVEMENT: Lebar sidebar dinaikkan dan border kiri dipertebal (Neobrutalism style)
  const sidebarClass = `fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[550px] bg-white border-black z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`;
  const overlayClass = `fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`;

  return (
    <>
      <div className={overlayClass} onClick={onClose} />
      
      <div className={sidebarClass}>
        {/* Header Dinamis */}
        <div className={`flex justify-between items-center p-6 border-b-4 border-black ${isOfficialIssuer ? 'bg-[#fbbf24]' : 'bg-gray-200'}`}>
          <div className="flex items-center gap-3 font-black text-xl truncate pr-4">
            <div className="bg-white p-2 border-2 border-black rounded-full shrink-0 text-black">
              {isOfficialIssuer ? <Building size={24} /> : <User size={24} />}
            </div>
            <span className="truncate">{issuerProfileName}</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white p-2 border-2 border-transparent hover:border-black rounded-lg transition-all shrink-0">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {!isConnected ? (
            <div className="text-center font-bold text-gray-500 mt-10">
              Silakan hubungkan wallet untuk melihat dokumen Anda.
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center mt-20 text-blue-600 font-bold">
              <Loader2 size={40} className="animate-spin mb-4" />
              Menyelam ke Blockchain...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center mt-20">
              <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                <FileText size={32} className="text-gray-500" />
              </div>
              <p className="font-bold text-lg">Belum ada dokumen</p>
              <p className="text-sm text-gray-500">Anda belum menerbitkan apa pun.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">
                Riwayat Penerbitan ({documents.length})
              </p>
              
              {documents.map((doc) => (
                <div key={doc.tokenId} className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                  
                  {doc.isRevoked && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg border-l-2 border-b-2 border-black">
                      DICABUT
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-black text-xl text-black leading-tight mb-1">{doc.name}</h4>
                    {doc.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-400">#{doc.tokenId}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${doc.isVerified ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        {doc.isVerified ? 'OFFICIAL' : 'PUBLIC'}
                        </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <p className="text-xs text-gray-500 font-bold">TANGGAL: <span className="text-black">{doc.timestamp}</span></p>
                    <div className="text-xs text-gray-500 font-bold flex flex-col gap-2">
                      <span>DIGITAL FINGERPRINT (HASH):</span>
                      <div className="relative group">
                        <code className="bg-gray-100 text-green-700 p-3 rounded-lg border-2 border-dashed border-gray-300 break-all w-full font-mono text-[11px] leading-relaxed block pr-12">
                          {doc.hash}
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(doc.hash);
                            setCopiedId(doc.tokenId);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all active:translate-x-px active:translate-y-px active:shadow-none"
                          title="Salin Hash"
                        >
                          {copiedId === doc.tokenId ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!doc.isRevoked ? (
                    <button 
                      onClick={() => handleRevoke(doc.tokenId)}
                      disabled={revokingId === doc.tokenId}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold py-3 rounded-lg border-2 border-red-200 hover:border-black transition-all text-sm"
                    >
                      {revokingId === doc.tokenId ? (
                        <><Loader2 size={16} className="animate-spin" /> MENCABUT...</>
                      ) : (
                        <><Trash2 size={16} /> REVOKE DOKUMEN INI</>
                      )}
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-bold py-3 rounded-lg border-2 border-gray-200 text-sm cursor-not-allowed">
                      <ShieldAlert size={16} /> TELAH DICABUT
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}