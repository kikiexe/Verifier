/**
 * ProfilePage - Halaman profil pengguna.
 * Menampilkan ringkasan status issuer dan daftar dokumen yang pernah diterbitkan oleh user.
 */
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  FileText, 
  ShieldAlert, 
  Trash2, 
  Loader2, 
  User, 
  Building, 
  Copy, 
  Check,
  RefreshCw
} from "lucide-react";
import CertificateCard from "@/components/CertificateCard";
import { useIssuer } from "@/hooks/useIssuer";
import { useDocuments, useRevokeDocument } from "@/hooks/useDocuments";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: issuer, isLoading: issuerLoading, refetch: refetchIssuer } = useIssuer();
  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = useDocuments();
  const revokeMutation = useRevokeDocument();
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRevoke = async (tokenId: string) => {
    if (!confirm(`PERINGATAN: Cabut validitas Dokumen #${tokenId}? Ini permanen!`)) return;
    try {
      await revokeMutation.mutateAsync(tokenId);
      alert(`SUKSES! Dokumen #${tokenId} telah dicabut.`);
    } catch (err) {
      console.error(err);
      alert("Gagal mencabut dokumen.");
    }
  };

  const handleRefresh = () => {
    refetchIssuer();
    refetchDocs();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl max-w-md w-full text-center">
          <User size={64} className="mx-auto mb-6 text-gray-400" />
          <h1 className="text-2xl font-black mb-4">Profil Saya</h1>
          <p className="text-gray-600 font-bold mb-6">Silakan hubungkan wallet untuk melihat dokumen Anda.</p>
        </div>
      </div>
    );
  }

  const isOfficialIssuer = issuer?.isVerified || false;
  const issuerProfileName = issuer?.name || "Profil Publik";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Profil */}
        <div className={`border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 flex flex-col md:flex-row justify-between items-center gap-6 ${isOfficialIssuer ? 'bg-[#fbbf24]' : 'bg-white'}`}>
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {isOfficialIssuer ? <Building size={48} /> : <User size={48} />}
            </div>
            <div>
              <h1 className="text-3xl font-black text-black leading-tight truncate max-w-[300px] md:max-w-md">
                {issuerProfileName}
              </h1>
              <p className="font-mono text-sm font-bold text-gray-700 break-all">{address}</p>
              {isOfficialIssuer && (
                <span className="inline-block mt-2 bg-black text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                  Verified Issuer
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white hover:bg-black hover:text-white transition-all border-2 border-black px-4 py-2 rounded-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <RefreshCw size={18} className={(issuerLoading || docsLoading) ? "animate-spin" : ""} />
            REFRESH DATA
          </button>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-10">
          <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                    <FileText size={28} /> RIWAYAT PENERBITAN
                    <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full border-2 border-black">
                        {documents?.length || 0}
                    </span>
                </h2>
            </div>

            {docsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                <p className="font-black text-lg">Menyelam ke Blockchain...</p>
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-20 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h3 className="font-black text-xl mb-2">Belum ada dokumen</h3>
                <p className="text-gray-500 font-bold">Anda belum menerbitkan apa pun melalui alamat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {documents.map((doc) => (
                  <div key={doc.tokenId} className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col">
                    
                    {doc.isRevoked && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-4 py-1 rounded-md border-2 border-black rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        REVOKED
                      </div>
                    )}

                    <div className="mb-6">
                        <CertificateCard 
                            name={doc.name}
                            issuerName={issuerProfileName}
                            date={doc.timestamp}
                            isVerified={doc.isVerified}
                            tokenId={doc.tokenId}
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             <h4 className="font-black text-xl text-black truncate">{doc.name}</h4>
                             <span className="text-xs font-bold text-gray-400 shrink-0">#{doc.tokenId}</span>
                        </div>
                        {doc.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border-2 border-dashed border-slate-200">
                                {doc.description}
                            </p>
                        )}
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Status:</span>
                                <span className={`px-2 py-0.5 rounded border ${doc.isVerified ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                                    {doc.isVerified ? 'OFFICIAL' : 'PUBLIC'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span>Tanggal:</span>
                                <span className="text-black">{doc.timestamp}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Fingerprint (Hash):</p>
                                <div className="flex items-center gap-2">
                                    <code className="bg-black text-green-400 p-2 rounded-lg text-[10px] font-mono break-all flex-1 border border-green-900/50 shadow-inner">
                                        {doc.hash.substring(0, 16)}...{doc.hash.substring(doc.hash.length - 16)}
                                    </code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(doc.hash);
                                            setCopiedId(doc.tokenId);
                                            setTimeout(() => setCopiedId(null), 2000);
                                        }}
                                        className="bg-white border-2 border-black p-2 rounded-lg hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                    >
                                        {copiedId === doc.tokenId ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!doc.isRevoked ? (
                      <button 
                        onClick={() => handleRevoke(doc.tokenId)}
                        disabled={revokeMutation.isPending && revokeMutation.variables === doc.tokenId}
                        className="w-full mt-auto flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-black py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50"
                      >
                        {revokeMutation.isPending && revokeMutation.variables === doc.tokenId ? (
                          <><Loader2 size={18} className="animate-spin" /> MENCABUT...</>
                        ) : (
                          <><Trash2 size={18} /> REVOKE DOKUMEN</>
                        )}
                      </button>
                    ) : (
                      <div className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-200 text-gray-500 font-black py-3 rounded-xl border-2 border-gray-300">
                        <ShieldAlert size={18} /> TELAH DICABUT
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
