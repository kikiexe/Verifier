🔐 TrustChain: Platform Autentikasi Dokumen Digital Terdesentralisasi

Skripsi S1 - Universitas Amikom Yogyakarta > Judul: Rancang Bangun Sistem Autentikasi Dokumen Digital Menggunakan Smart Contract Berbasis Hybrid ERC-721 dan IPFS dengan Mekanisme Verifikasi Penerbit

(Ganti link gambar di atas dengan screenshot aplikasi kamu nanti)

📖 Tentang Proyek

TrustChain adalah Decentralized Application (DApp) yang dirancang untuk mengatasi masalah pemalsuan dokumen akademik dan sertifikat profesional. Sistem ini memanfaatkan teknologi Blockchain (Arbitrum Sepolia) dan IPFS untuk menciptakan ekosistem verifikasi yang aman, transparan, dan efisien.

Fitur utama dari sistem ini adalah penerapan standar Hybrid ERC-721, yang memungkinkan satu kontrak pintar (Smart Contract) untuk menangani dua jenis aset sekaligus:

Soulbound Token (SBT): Dokumen yang terkunci pada identitas pemilik (Non-transferable). Cocok untuk Ijazah, Transkrip Nilai, dan Surat Warisan.

Transferable NFT: Dokumen/Aset digital yang dapat dipindah-tangankan atau diperjualbelikan. Cocok untuk Sertifikat Pelatihan, Tiket Event, atau Karya Seni.

✨ Fitur Utama

🛡️ Hybrid Token Mechanism: Fleksibilitas menentukan status dokumen (SBT atau NFT) saat pencetakan (minting).

🏛️ Issuer Verification: Mekanisme whitelist on-chain untuk menjamin hanya institusi resmi yang mendapatkan tanda "Verified".

👤 Public Minting: Memungkinkan pengguna umum (Non-Institusi) untuk mengamankan dokumen pribadi secara mandiri (Self-Signed).

📦 IPFS Storage: Penyimpanan metadata dan file dokumen secara terdistribusi menggunakan Pinata IPFS untuk efisiensi biaya (gas fee).

✅ Real-time Verification: Verifikasi keaslian dokumen secara instan menggunakan Token ID tanpa perantara.

🛠️ Teknologi yang Digunakan

Blockchain & Backend:

Solidity: Bahasa pemrograman Smart Contract.

Foundry: Framework untuk pengembangan, pengujian, dan deploy kontrak.

OpenZeppelin: Standar keamanan kontrak ERC-721 dan Ownable.

Arbitrum Sepolia: Jaringan Layer 2 Ethereum (Testnet) untuk transaksi cepat dan murah.

Frontend & Integration:

Next.js 14: Framework React untuk antarmuka pengguna.

TypeScript: Supaya kodingan lebih aman dan terstruktur.

Ethers.js v6: Library untuk interaksi antara Frontend dan Blockchain.

Tailwind CSS: Styling antarmuka yang modern dan responsif.

Pinata API: Gateway untuk upload file ke IPFS.

📂 Struktur Proyek

Proyek ini menggunakan struktur Monorepo yang memisahkan logika Blockchain dan Frontend.

skripsi-hybrid-sbt/
├── blockchain/                # SMART CONTRACT (Foundry)
│   ├── src/                   # Kode Solidity (.sol)
│   │   ├── HybridDocument.sol # Kontrak Utama (Logika Hybrid)
│   │   └── IssuerRegistry.sol # Kontrak Whitelist Mitra
│   ├── test/                  # Script Pengujian (.t.sol)
│   ├── script/                # Script Deploy (.s.sol)
│   └── foundry.toml           # Konfigurasi Foundry
│
└── frontend/                  # WEBSITE (Next.js)
    ├── src/
    │   ├── app/               # Halaman Website (Home, Dashboard, Verify)
    │   ├── components/        # Komponen UI (Navbar, Card)
    │   ├── constants/         # Alamat Kontrak & ABI
    │   └── utils/             # Fungsi Upload IPFS
    ├── public/                # Aset Gambar
    └── next.config.mjs


🚀 Cara Menjalankan (Local Development)

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal.

Prasyarat

Node.js (Versi 18 atau lebih baru)

Foundry (Untuk Blockchain lokal)

MetaMask (Extension Browser)

Akun Pinata (Untuk API Key IPFS)

1. Setup Blockchain (Backend)

Masuk ke folder blockchain dan install dependensi:

cd blockchain
forge install


Jalankan Blockchain Lokal (Anvil):

anvil


(Biarkan terminal ini berjalan. Copy salah satu Private Key yang muncul untuk dipakai di MetaMask)

Deploy Smart Contract ke Localhost (Buka terminal baru):

forge script script/Deploy.s.sol:DeployScript --rpc-url [http://127.0.0.1:8545](http://127.0.0.1:8545) --broadcast --private-key <PRIVATE_KEY_ANVIL>


Catat alamat kontrak yang muncul di terminal!

2. Setup Frontend (Website)

Masuk ke folder frontend dan install dependensi:

cd ../frontend
npm install


Konfigurasi Environment Variable:
Buat file .env.local di dalam folder frontend, lalu isi:

NEXT_PUBLIC_PINATA_JWT=paste_jwt_pinata_kamu_disini


Update Alamat Kontrak:
Buka file src/constants/index.ts dan ganti CONTRACT_ADDRESS dengan alamat yang didapat saat deploy tadi.

Jalankan Website:

npm run dev


Buka browser dan akses: http://localhost:3000

🧪 Pengujian Smart Contract (Testing)

Proyek ini dilengkapi dengan Automated Test untuk memastikan keamanan logika Hybrid (SBT tidak bisa dijual).

Jalankan perintah ini di folder blockchain:

forge test -vv


Skenario Pengujian:

✅ testMitraMinting: Mitra resmi berhasil mencetak dokumen "Verified".

✅ testPublicMinting: User umum berhasil mencetak dokumen "Self-Signed".

✅ testSBT_Fail: Dokumen bertipe SBT GAGAL saat coba ditransfer (Aman).

✅ testNFT_Success: Dokumen bertipe NFT BERHASIL dipindah-tangankan.

📄 Lisensi

Proyek ini dibuat untuk keperluan Skripsi dan bersifat Open Source di bawah lisensi MIT.

Dibuat oleh: [Nama Kamu] - Universitas Amikom Yogyakarta (2025)