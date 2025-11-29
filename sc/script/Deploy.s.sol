// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import tools bawaan Foundry
import {Script, console} from "forge-std/Script.sol";

// Import kontrak yang mau di-deploy
import {IssuerRegistry} from "../src/IssuerRegistry.sol";
import {HybridDocument} from "../src/HybridDocument.sol";

contract DeployScript is Script {
    function run() external returns (IssuerRegistry, HybridDocument) {
        // 1. Ambil Private Key dari file .env
        // Pastikan di file .env namanya PRIVATE_KEY (huruf besar semua)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Mulai siaran transaksi (Broadcast) ke blockchain
        vm.startBroadcast(deployerPrivateKey);

        // 2. Deploy Kontrak Pertama: Registry (Daftar Kampus)
        IssuerRegistry registry = new IssuerRegistry();
        console.log("IssuerRegistry deployed at:", address(registry));

        // 3. Deploy Kontrak Kedua: Dokumen Hybrid
        // PENTING: Kita masukkan alamat 'registry' ke dalam constructor 'HybridDocument'
        // Biar HybridDocument tau siapa yang boleh cetak ijazah.
        HybridDocument document = new HybridDocument(address(registry));
        console.log("HybridDocument deployed at:", address(document));

        // Berhenti siaran
        vm.stopBroadcast();

        return (registry, document);
    }
}

//forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast --verify