"use client";

import { FileText, CheckCircle, Shield } from "lucide-react";

interface CertificateCardProps {
  name: string;
  issuerName?: string;
  date?: string;
  isVerified?: boolean;
  tokenId?: string;
}

export default function CertificateCard({
  name,
  issuerName,
  date,
  isVerified,
  tokenId,
}: CertificateCardProps) {
  return (
    <div className={`relative aspect-4/3 w-full overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col p-4 transition-all hover:translate-y-[-2px] ${isVerified ? 'bg-blue-600' : 'bg-slate-800'}`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Shield size={100} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between text-white">
        <div className="flex justify-between items-start">
          <div className="bg-white/20 p-1.5 rounded border border-white/30 backdrop-blur-sm">
            <FileText size={16} />
          </div>
          <span className="text-[10px] font-black opacity-60">#{tokenId}</span>
        </div>

        <div className="mt-4">
          <h5 className="font-black text-xs uppercase tracking-wider opacity-60">Certificate of Validity</h5>
          <h4 className="font-black text-lg leading-tight truncate">{name}</h4>
          <p className="text-[10px] opacity-80 mt-1 truncate">Issued by: {issuerName || "Verified Issuer"}</p>
        </div>

        <div className="mt-auto flex justify-between items-end border-t border-white/20 pt-2">
           <div>
             <p className="text-[8px] opacity-60 uppercase font-black">Date Recorded</p>
             <p className="text-[10px] font-bold">{date || "N/A"}</p>
           </div>
           {isVerified && (
             <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-[8px] font-black border border-white/30">
                <CheckCircle size={8} className="text-green-300" /> VERIFIED
             </div>
           )}
        </div>
      </div>
      
      {/* Neo-brutalism badge at bottom */}
      <div className="absolute -bottom-1 -right-1 bg-[#fbbf24] text-black text-[8px] font-black px-2 py-1 border-2 border-black transform -rotate-2">
        VELIPE TRUSTCHAIN
      </div>
    </div>
  );
}
