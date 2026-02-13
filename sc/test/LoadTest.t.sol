// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/HybridDocument.sol";
import "../src/IssuerRegistry.sol";

contract LoadTest is Test {
    HybridDocument public document;
    IssuerRegistry public registry;

    address public admin = address(0x1);
    address public issuer = address(0x2);
    address public user = address(0x3);

    // Data Dummy
    bytes32 constant HASH_DATA = keccak256("b5c3...data_hash_asli");
    string constant IPFS_URI = "ipfs://QmHash...";

    function setUp() public {
        // 1. Setup Kontrak
        vm.startPrank(admin);
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));

        // 2. Daftarkan Issuer Resmi
        registry.addIssuer(issuer, "Universitas Amikom");
        vm.stopPrank();

        // 3. Mint 1 Dokumen untuk dites rame-rame
        vm.startPrank(issuer);
        // Param: to, uri, soulbound(true), hash
        document.mintOfficialDocument(user, IPFS_URI, true, HASH_DATA);
        vm.stopPrank();
    }

    // === INI TES BEBAN 10.000 REQUEST ===
    function test_Load_10000_VerificationRequests() public view {
        uint256 tokenId = 1; // ID dokumen yang baru kita mint
        uint256 totalRequests = 10000;

        console.log("=== MEMULAI LOAD TEST: 10.000 PERMINTAAN VERIFIKASI ===");
        console.log("Target: Token ID 1");
        console.log("Total Request:", totalRequests);

        // Simulasi Loop 10.000 kali
        // Ini mensimulasikan 10.000 orang mengecek dokumen yang sama
        for (uint256 i = 0; i < totalRequests; i++) {
            // 1. Cek Hash (Integritas)
            // getDocumentHash tidak ada, pakai getDocumentData
            bytes32 retrievedHash = document
                .getDocumentData(tokenId)
                .documentHash;

            // 2. Cek Pemilik (Otoritas)
            address owner = document.ownerOf(tokenId);

            // 3. Validasi Logika (Assertion)
            // Jika ada 1 saja yang salah, tes ini akan GAGAL (FAIL)
            if (retrievedHash != HASH_DATA) {
                revert("Integritas Data Gagal pada request ke-i");
            }

            if (owner != user) {
                revert("Data Pemilik Gagal pada request ke-i");
            }
        }

        console.log(
            "=== SUKSES! 10.000 Permintaan Terverifikasi Tanpa Error ==="
        );
        console.log(
            "Kesimpulan: Smart Contract mampu menangani high-volume read requests."
        );
    }
}
