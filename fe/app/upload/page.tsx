"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/ipfs";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import HybridToggle from "@/components/HybridToggle";

declare global { interface Window { ethereum?: any; } }

export default function UploadPage() {
  const [account, setAccount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isSoulbound, setIsSoulbound] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [documentHash, setDocumentHash] = useState<string>("");

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask dulu!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setRecipient(addr);
    } catch (error: any) {
      console.error(error);
    }
  };

  const switchWallet = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      connectWallet();
    } catch (error) {
      console.log("Batal ganti akun");
    }
  };

  // Calculate SHA-256 hash from file
  const calculateHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex =
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 5MB");
        return;
      }
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        alert("Hanya file PDF yang diperbolehkan!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleMint = async () => {
    if (!file || !account || !recipient) return alert("Data belum lengkap!");
    if (!ethers.isAddress(recipient))
      return alert("Address Penerima Salah!");
    if (!form.name) return alert("Judul dokumen harus diisi!");

    setLoading(true);
    setStatus("🚀 Memulai proses upload...");

    try {
      // 1. Calculate document hash
      setStatus("🔐 Menghitung hash dokumen...");
      const docHash = await calculateHash(file);
      setDocumentHash(docHash);
      console.log("Document hash:", docHash);

      // 2. Upload file to IPFS
      setStatus("📦 Mengupload dokumen ke IPFS...");
      const fileCid = await uploadFileToIPFS(file);
      console.log("File CID:", fileCid);

      // 3. Create and upload metadata
      const metadata = {
        name: form.name,
        description: form.description,
        document: fileCid, // Use 'document' instead of 'image'
        attributes: [
          {
            trait_type: "Type",
            value: isSoulbound ? "Soulbound (SBT)" : "Transferable (NFT)",
          },
          { trait_type: "Issuer", value: account },
          { trait_type: "Document Hash", value: docHash },
          { trait_type: "Issue Date", value: new Date().toISOString() },
          { trait_type: "File Size", value: `${(file.size / 1024).toFixed(2)} KB` },
        ],
      };

      setStatus("📄 Membuat Metadata JSON...");
      const metadataCid = await uploadJSONToIPFS(metadata);
      console.log("Metadata CID:", metadataCid);

      // 4. Blockchain transaction
      setStatus("🦊 Menunggu konfirmasi MetaMask...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      let tx;
      try {
        // Try Official Document (Verified Issuer)
        tx = await contract.mintOfficialDocument(
          recipient,
          metadataCid,
          isSoulbound,
          docHash // IMPORTANT: Send hash!
        );
        setStatus("🏛️ Mencetak Dokumen Resmi (Verified)...");
      } catch (err) {
        console.log("Bukan Mitra, masuk jalur public...");
        // Public Document
        tx = await contract.mintPublicDocument(
          metadataCid,
          isSoulbound,
          docHash // IMPORTANT: Send hash!
        );
        setStatus("👤 Mencetak Dokumen Pribadi (Self-Signed)...");
      }

      setStatus("⏳ Menunggu konfirmasi blockchain...");
      const receipt = await tx.wait();
      
      // Get token ID from event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "DocumentMinted");

      const tokenId = event?.args?.tokenId?.toString();

      setStatus(
        `✅ SUKSES! Token ID: ${tokenId}\nHash: ${docHash.slice(0, 10)}...`
      );
      alert(
        `Minting Berhasil!\n\nToken ID: ${tokenId}\nHash: ${docHash}\n\nSimpan hash ini untuk verifikasi!`
      );

      // Reset form
      setFile(null);
      setForm({ name: "", description: "" });
      setRecipient(account);
    } catch (error: any) {
      console.error("Error:", error);
      setStatus("❌ Gagal: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📄 Upload & Terbitkan Dokumen
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Terbitkan dokumen digital dengan verifikasi blockchain
          </p>
        </div>

        <div className="p-8">
          {/* Wallet Control */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {!account ? (
              <button
                onClick={connectWallet}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                🦊 Hubungkan Wallet
              </button>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Terhubung sebagai:
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-800">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={switchWallet}
                  className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  Ganti Akun
                </button>
              </div>
            )}
          </div>

          {/* Form Input */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Wallet Penerima
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-mono"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Address yang akan menerima dokumen NFT
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Judul Dokumen *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900"
                  placeholder="Ijazah / Sertifikat"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  value={form.name}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  File PDF * (Max 5MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900"
                rows={3}
                placeholder="Keterangan tambahan..."
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                value={form.description}
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tipe Kepemilikan
              </label>
              <HybridToggle
                isSoulbound={isSoulbound}
                setIsSoulbound={setIsSoulbound}
              />
            </div>

            <button
              onClick={handleMint}
              disabled={loading || !account || !file}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition shadow-lg ${
                loading || !account || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {loading ? "⏳ Sedang Memproses..." : "🚀 Cetak Dokumen Sekarang"}
            </button>

            {status && (
              <div
                className={`mt-4 p-4 rounded-lg text-center text-sm font-medium ${
                  status.includes("Gagal")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {status}
              </div>
            )}

            {documentHash && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-bold text-green-800 mb-1">
                  Document Hash (SHA-256):
                </p>
                <p className="text-xs font-mono text-green-700 break-all">
                  {documentHash}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  💡 Simpan hash ini untuk verifikasi dokumen!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}