"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

interface DocData {
  tokenId: string;
  owner: string;
  issuer: string;
  issuerName: string;
  documentHash: string;
  isSoulbound: boolean;
  isVerified: boolean;
  isRevoked: boolean;
  timestamp: string;
  tokenURI: string;
  metadata?: {
    name: string;
    description: string;
    document: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export default function VerifyPage() {
  const [tokenId, setTokenId] = useState("");
  const [data, setData] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!tokenId) return alert("Masukkan Token ID!");
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      // 1. Setup Provider (Read-Only, no wallet needed)
      const provider = new ethers.JsonRpcProvider(
        "https://sepolia-rollup.arbitrum.io/rpc"
      );
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // 2. Get document data (using the new struct)
      const docData = await contract.getDocumentData(tokenId);
      
      // 3. Get owner and token URI
      const [owner, uri] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.tokenURI(tokenId),
      ]);

      // 4. Get issuer name (if verified)
      let issuerName = "Self-Signed (Public)";
      if (docData.isVerified) {
        try {
          // Call registry to get issuer name
          // Note: You'd need to add registry contract interaction here
          // For now, we'll show a placeholder
          issuerName = "Verified Issuer";
        } catch (err) {
          console.log("Could not fetch issuer name");
        }
      }

      // 5. Fetch metadata from IPFS
      const httpUri = uri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
      
      let metadata;
      try {
        const metaRes = await fetch(httpUri);
        metadata = await metaRes.json();
      } catch (err) {
        console.error("Error fetching metadata:", err);
        metadata = null;
      }

      // 6. Format timestamp
      const timestamp = new Date(
        Number(docData.timestamp) * 1000
      ).toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setData({
        tokenId,
        owner,
        issuer: docData.issuer,
        issuerName,
        documentHash: docData.documentHash,
        isSoulbound: docData.isSoulbound,
        isVerified: docData.isVerified,
        isRevoked: docData.isRevoked,
        timestamp,
        tokenURI: httpUri,
        metadata,
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === "CALL_EXCEPTION" || err.message.includes("does not exist")) {
        setError("Token ID tidak ditemukan atau tidak valid.");
      } else {
        setError("Error: " + (err.reason || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 Verifikasi Dokumen
          </h1>
          <p className="text-gray-600">
            Masukkan Token ID untuk mengecek keaslian dokumen di Blockchain
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Token ID adalah nomor unik yang diberikan saat dokumen diterbitkan
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="flex gap-3">
            <input
              type="number"
              className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 text-lg"
              placeholder="Contoh: 0, 1, 2, 3..."
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !tokenId}
              className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition shadow-lg ${
                loading || !tokenId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {loading ? "🔍..." : "Cek"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Token ID bisa dilihat di transaction receipt saat minting dokumen
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border-2 border-red-200 mb-6 animate-fade-in-up">
            <p className="font-bold text-lg mb-2">❌ Dokumen Tidak Ditemukan</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {data && (
          <div
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-2 animate-fade-in-up ${
              data.isRevoked
                ? "border-red-500"
                : data.isVerified
                ? "border-green-500"
                : "border-yellow-500"
            }`}
          >
            {/* Status Banner */}
            <div
              className={`px-6 py-4 flex justify-between items-center ${
                data.isRevoked
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : data.isVerified
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-yellow-500 to-amber-500"
              }`}
            >
              <span className="font-bold text-white text-lg flex items-center gap-2">
                {data.isRevoked ? (
                  <>⚠️ DOKUMEN DIBATALKAN</>
                ) : data.isVerified ? (
                  <>✅ VERIFIED ISSUER</>
                ) : (
                  <>⚠️ SELF-SIGNED (PUBLIC)</>
                )}
              </span>
              <span className="text-xs font-mono text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
                ID: #{tokenId}
              </span>
            </div>

            <div className="p-8">
              {/* Revocation Warning */}
              {data.isRevoked && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="font-bold text-red-800 mb-1">
                    ⛔ PERINGATAN PENTING
                  </p>
                  <p className="text-sm text-red-700">
                    Dokumen ini telah dibatalkan oleh penerbit dan tidak lagi
                    valid. Jangan terima dokumen ini sebagai bukti yang sah.
                  </p>
                </div>
              )}

              {/* Document Title & Description */}
              {data.metadata && (
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {data.metadata.name || "Dokumen Tanpa Judul"}
                  </h2>
                  {data.metadata.description && (
                    <p className="text-gray-600">{data.metadata.description}</p>
                  )}
                </div>
              )}

              {/* Detail Grid */}
              <div className="space-y-4">
                {/* Owner */}
                <DetailRow label="👤 Pemilik Dokumen" value={data.owner} />

                {/* Issuer */}
                <DetailRow label="🏛️ Penerbit Dokumen" value={data.issuer} />

                {/* Issuer Name & Status */}
                <div className="py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    📝 Status Penerbit
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        data.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {data.isVerified ? "✅ Verified" : "⚠️ Unverified"}
                    </span>
                    <span className="text-sm text-gray-700">
                      {data.issuerName}
                    </span>
                  </div>
                  {!data.isVerified && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠️ Dokumen ini diterbitkan oleh user publik (bukan
                      institusi terverifikasi)
                    </p>
                  )}
                </div>

                {/* Document Type */}
                <div className="py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">🔐 Tipe Dokumen</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      data.isSoulbound
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {data.isSoulbound
                      ? "🔒 Soulbound (SBT)"
                      : "💸 Transferable (NFT)"}
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    {data.isSoulbound
                      ? "Dokumen ini terkunci di wallet pemilik dan tidak dapat dipindahtangankan"
                      : "Dokumen ini dapat ditransfer ke wallet lain"}
                  </p>
                </div>

                {/* Document Hash */}
                <div className="py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    🔐 Document Hash (SHA-256)
                  </p>
                  <p className="text-xs font-mono text-gray-800 break-all bg-gray-50 p-3 rounded-lg">
                    {data.documentHash}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Hash ini digunakan untuk memverifikasi integritas file
                    dokumen
                  </p>
                </div>

                {/* Timestamp */}
                <DetailRow label="📅 Tanggal Terbit" value={data.timestamp} />

                {/* Metadata Attributes */}
                {data.metadata?.attributes && (
                  <div className="py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500 mb-3">
                      📊 Detail Tambahan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {data.metadata.attributes.map((attr, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <p className="text-xs text-gray-500 mb-1">
                            {attr.trait_type}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {attr.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 space-y-3">
                  {data.metadata?.document && (
                    <a
                      href={data.metadata.document.replace(
                        "ipfs://",
                        "https://gateway.pinata.cloud/ipfs/"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
                    >
                      📄 Lihat Dokumen Asli (IPFS)
                    </a>
                  )}

                  <a
                    href={data.tokenURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                    📋 Lihat Metadata (IPFS)
                  </a>

                  <a
                    href={`https://sepolia.arbiscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                    🔗 Lihat di Blockchain Explorer
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
                  >
                    🖨️ Print Hasil Verifikasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Verification Method */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">
            💡 Cara Verifikasi Lainnya
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Tidak punya Token ID? Anda bisa memverifikasi dokumen dengan
            mengupload file PDF:
          </p>
          <a
            href="/verify-by-file"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            📂 Verifikasi dengan Upload File
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-gray-100">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-3 rounded-lg">
        {value}
      </p>
    </div>
  );
}