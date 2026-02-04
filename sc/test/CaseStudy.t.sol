// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {IssuerRegistry} from "src/IssuerRegistry.sol";
import {HybridDocument} from "src/HybridDocument.sol";

contract CaseStudyTest is Test {
    IssuerRegistry registry;
    HybridDocument document;

    address univ = address(10); // Universitas
    address bpn = address(11); // Badan Pertanahan (Land Agency)
    address mhs = address(20); // Mahasiswa
    address tuanTanah = address(30);
    address pembeli = address(31);

    function setUp() public {
        vm.startPrank(address(1));
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));

        // Daftarkan Institusi
        registry.addIssuer(univ, "Universitas Amikom Yogyakarta");
        registry.addIssuer(bpn, "Badan Pertanahan Nasional");
        vm.stopPrank();
    }

    // STUDI KASUS 1: Ijazah (Soulbound Token)
    // Sifat: Melekat selamanya, tidak bisa dijual, tapi bisa direcover Kampus kalau wallet hilang.
    function testCase_Ijazah() public {
        bytes32 hashIjazah = keccak256("Ijazah_22.11.5122.pdf");

        // 1. Penerbitan
        vm.prank(univ);
        document.mintOfficialDocument(
            mhs,
            "ipfs://ijazah_metadata",
            true,
            hashIjazah
        );

        // 2. Mahasiswa mencoba menjual/transfer (Harus Gagal)
        vm.startPrank(mhs);
        vm.expectRevert("SBT: Only Issuer can transfer"); // Error dari Smart Contract
        document.transferFrom(mhs, pembeli, 1);
        vm.stopPrank();

        // 3. Skenario: Mahasiswa kehilangan wallet -> Kampus bantu recovery
        vm.prank(univ);
        document.transferFrom(mhs, address(999), 1); // Pindah ke wallet baru

        assertEq(document.ownerOf(1), address(999));
    }

    // STUDI KASUS 2: Sertifikat Tanah (Non-Fungible Token / NFT)
    // Sifat: Resmi, tapi bisa dipindahtangankan (jual beli aset).
    function testCase_SertifikatTanah() public {
        bytes32 hashSertifikat = keccak256("Sertifikat_Tanah_No_123.pdf");

        // 1. BPN Menerbitkan Sertifikat ke Pemilik Awal
        // Parameter soulbound = false (artinya Transferable)
        vm.prank(bpn);
        document.mintOfficialDocument(
            tuanTanah,
            "ipfs://tanah_metadata",
            false,
            hashSertifikat
        );

        // 2. Pemilik menjual tanah ke Pembeli
        vm.startPrank(tuanTanah);
        // PERBAIKAN: Ubah ID dari 2 menjadi 1
        document.transferFrom(tuanTanah, pembeli, 1);
        vm.stopPrank();

        // 3. Verifikasi pemilik baru
        // PERBAIKAN: Ubah ID dari 2 menjadi 1
        assertEq(document.ownerOf(1), pembeli, "Kepemilikan harus berpindah");

        // 4. Cek Validitas Issuer (Masih tertulis diterbitkan oleh BPN)
        (, , , address issuer, , ) = document.verifyByHash(hashSertifikat);
        assertEq(issuer, bpn, "Penerbit awal tetap BPN");
    }
}
