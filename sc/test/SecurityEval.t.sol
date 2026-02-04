// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {IssuerRegistry} from "src/IssuerRegistry.sol";
import {HybridDocument} from "src/HybridDocument.sol";

contract SecurityEvalTest is Test {
    IssuerRegistry registry;
    HybridDocument document;

    address issuer = address(10);
    address attacker = address(666);
    address user = address(20);

    function setUp() public {
        vm.startPrank(address(1));
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));
        registry.addIssuer(issuer, "Kampus Resmi");
        vm.stopPrank();
    }

    // [SECURITY 1] Apa yang terjadi jika isi dokumen diganti (bahkan 1 huruf)?
    // Jawaban: Hash berubah -> Dokumen dianggap TIDAK ADA / TIDAK VALID.
    function testSecurity_DocumentTampering() public {
        bytes32 originalHash = keccak256("Ijazah Asli Putra.pdf");
        bytes32 tamperedHash = keccak256("Ijazah Asli Putra Edit Nilai.pdf"); // Dokumen diubah

        // 1. Kampus menerbitkan dokumen asli
        vm.prank(issuer);
        document.mintOfficialDocument(user, "ipfs://asli", true, originalHash);

        // 2. User mencoba memverifikasi dokumen yang sudah diedit
        (bool exists, , , , , ) = document.verifyByHash(tamperedHash);

        // 3. Assert: Sistem menolak verifikasi (False)
        assertFalse(
            exists,
            "Dokumen palsu/editan seharusnya tidak terverifikasi"
        );
    }

    // [SECURITY 2] Serangan Replay / Overwrite Metadata
    // Apa yang terjadi jika Attacker mencoba me-mint ulang hash yang sama dengan metadata palsu?
    // Jawaban: Revert "Document with this hash already exists".
    function testSecurity_ReplayAttack() public {
        bytes32 docHash = keccak256("Dokumen Rahasia.pdf");

        // 1. Issuer menerbitkan dokumen
        vm.prank(issuer);
        document.mintOfficialDocument(user, "ipfs://asli", true, docHash);

        // 2. Attacker mencoba menimpa dokumen tersebut dengan URI palsu
        vm.startPrank(attacker);
        vm.expectRevert("Document with this hash already exists");
        document.mintPublicDocument("ipfs://palsu_berbahaya", true, docHash);
        vm.stopPrank();

        // 3. Verifikasi bahwa URI tidak berubah
        (, , , , , HybridDocument.DocumentData memory data) = document
            .verifyByHash(docHash);
        assertEq(
            document.tokenURI(1),
            "ipfs://asli",
            "Metadata tidak boleh berubah"
        );
    }

    // [SECURITY 3] Front-Running Attack
    // Skenario: Attacker melihat Kampus mau minting, lalu dia duluan minting Public Document
    // dengan hash yang sama untuk memblokir Kampus.
    function testSecurity_FrontRunningBlock() public {
        bytes32 docHash = keccak256("Ijazah Baru.pdf");

        // 1. Attacker (Front-runner) minting duluan
        vm.prank(attacker);
        document.mintPublicDocument("ipfs://claim_palsu", true, docHash);

        // 2. Kampus mencoba minting dokumen resmi
        vm.prank(issuer);
        vm.expectRevert("Document with this hash already exists");
        document.mintOfficialDocument(user, "ipfs://resmi", true, docHash);

        // CATATAN UNTUK SKRIPSI:
        // Ini adalah fitur, bukan bug. First-come-first-served menjamin keunikan.
        // Solusi mitigasi: Kampus harus memastikan hash unik atau menggunakan salt jika perlu,
        // tapi dalam kasus Ijazah, jika hash sudah ada di public, Kampus bisa mendeteksi
        // bahwa dokumen tersebut sudah diklaim dan melakukan investigasi off-chain.
    }
}
