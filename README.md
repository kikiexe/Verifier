# Velipe: Decentralized Document Verification Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-Base%20Sepolia-blue)
![Status](https://img.shields.io/badge/status-Development-yellow)

**Velipe** adalah solusi berbasis blockchain untuk autentikasi dan validasi dokumen digital. Platform ini dirancang untuk mencegah pemalsuan dokumen penting (seperti ijazah, sertifikat kompetensi, dan lisensi profesional) dengan memanfaatkan transparansi dan *immutability* dari teknologi Blockchain serta efisiensi penyimpanan terdistribusi (IPFS).

Sistem ini mengimplementasikan standar **Hybrid ERC-721**, yang memberikan fleksibilitas unik dalam pengelolaan aset digital:
* **Soulbound Token (SBT):** Aset non-transferable yang terikat pada identitas pemilik (Identity-Bound). Ideal untuk dokumen identitas, kredensial akademik, dan rekam jejak.
* **Standard NFT:** Aset yang dapat dipindahtangankan. Ideal untuk sertifikat kepemilikan aset, tiket, atau voucher.

---

## Fitur Utama

### Hybrid Token Standard
Smart Contract tunggal yang mampu menangani dua logika kepemilikan sekaligus. Status dokumen (SBT/NFT) ditentukan secara *immutable* pada saat proses *minting*.

### Decentralized Governance (Role-Based Access Control)
Menerapkan sistem `AccessControl` untuk manajemen penerbit (*Issuer*). Hanya entitas yang telah melalui proses *Know Your Business* (KYB) dan di-*whitelist* oleh Admin Governance yang dapat menerbitkan dokumen berstatus **"Official Verified"**.

### Privacy-Preserving Architecture
File dokumen fisik (PDF) tidak diunggah ke publik untuk menjaga privasi data sensitif (PII Compliant). Sistem hanya mencatat **Cryptographic Hash (SHA-256)** dan metadata esensial ke dalam Blockchain/IPFS. Verifikasi dilakukan dengan mencocokkan *fingerprint* file lokal dengan data *on-chain*.

### Self-Sovereign Minting
Memungkinkan pengguna individu untuk melakukan *timestamping* dokumen pribadi secara mandiri (*Self-Signed*) untuk keperluan pembuktian kepemilikan hak cipta atau integritas data tanpa memerlukan otoritas pusat.

---

## Teknologi & Arsitektur

Project ini dibangun menggunakan arsitektur **Monorepo** yang modern dan terukur.

### Blockchain (Smart Contract)
* **Base Sepolia:** Jaringan L2 EVM yang cepat dan hemat biaya.
* **Solidity 0.8.x:** Bahasa kontrak cerdas.
* **Foundry:** Framework pengembangan Ethereum untuk testing, fuzzing, dan deployment yang robust.
* **OpenZeppelin:** Standar keamanan untuk ERC-721 dan Access Control.

### Frontend (DApp)
* **Next.js 14 (App Router):** Framework React modern untuk performa tinggi.
* **TypeScript:** Type-safety untuk pengembangan skala besar.
* **Wagmi & Viem:** Library interaksi Ethereum yang ringan dan modern.
* **RainbowKit:** Manajemen koneksi wallet yang intuitif.
* **Tailwind CSS:** Utility-first CSS framework.
* **Pinata IPFS:** Layanan pinning untuk desentralisasi metadata.

---

## Struktur Direktori

```bash
Verifier/
├── sc/                        # SMART CONTRACT (Foundry Environment)
│   ├── src/                   # Source Code (.sol)
│   │   ├── HybridDocument.sol # Core Logic (ERC-721 Hybrid)
│   │   └── IssuerRegistry.sol # Governance Logic (AccessControl)
│   ├── test/                  # Unit & Integration Tests
│   └── script/                # Deployment Scripts
│
└── fe/                        # FRONTEND (Next.js Environment)
    ├── app/                   # App Router Pages
    ├── components/            # Reusable UI Components
    ├── constants/             # ABI & Contract Configuration
    └── utils/                 # Utilities (Hashing, IPFS)
````

-----

## Panduan Instalasi & Pengembangan

Ikuti langkah berikut untuk menjalankan proyek di lingkungan lokal.

### Prasyarat

  * Node.js (v18+)
  * Foundry
  * Dompet Web3 (MetaMask/Rabby) dengan saldo Base Sepolia ETH.
  * API Key Pinata & BaseScan.

### 1\. Setup Smart Contract (Backend)

Masuk ke direktori `sc`:

```bash
cd sc
```

Install dependensi dan compile kontrak:

```bash
forge install
forge build
```

Jalankan Unit Test untuk memastikan integritas logika:

```bash
forge test -vv
```

Deploy ke Jaringan Base Sepolia:
Pastikan Anda telah membuat file `.env` berdasarkan contoh.

```bash
source .env
forge script script/Deploy.s.sol:DeployScript --rpc-url base-sepolia --broadcast --verify
```

### 2\. Setup Frontend (Client)

Masuk ke direktori `fe`:

```bash
cd ../fe
```

Install dependensi:

```bash
npm install
```

Konfigurasi Environment Variable:
Buat file `.env` dan tambahkan kredensial yang diperlukan:

```env
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_WALLET_CONNECT_ID=your_reown_project_id
```

Jalankan Server Development:

```bash
npm run dev
```

Aplikasi dapat diakses melalui `http://localhost:3000`.

-----

## Security & Testing

Sistem ini telah melewati serangkaian pengujian otomatis menggunakan Foundry:

  * **Access Control:** Memastikan hanya *Authorized Issuer* yang dapat membatalkan (*revoke*) atau mentransfer dokumen tertentu.
  * **SBT Invariant:** Memastikan token berstatus SBT tidak dapat dipindahkan oleh pemilik (transfer revert), kecuali melalui mekanisme *recovery* oleh Issuer.
  * **Data Integrity:** Validasi hash dokumen untuk mencegah kolisi data.

-----

## Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.