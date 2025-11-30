// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

contract IssuerRegistry is AccessControl {
    // Role untuk Admin (Bisa atur role lain)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // Role khusus untuk menambahkan Issuer baru (Bisa diberikan ke DAO/Komite di masa depan)
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    event IssuerAdded(address indexed issuer, string name);
    event IssuerRemoved(address indexed issuer);

    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerNames;

    constructor() {
        // Berikan Deployer kedua role ini saat awal deploy
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }

    // Hanya yang punya GOVERNANCE_ROLE yang boleh tambah kampus
    // (Jawaban Sidang: "Role ini disiapkan untuk diserahkan ke DAO/MultiSig Dikti nanti")
    function addIssuer(address _issuer, string memory _name) external onlyRole(GOVERNANCE_ROLE) {
        require(_issuer != address(0), "Address tidak valid");
        require(!authorizedIssuers[_issuer], "Issuer sudah terdaftar");
        require(bytes(_name).length > 0, "Nama tidak boleh kosong");

        authorizedIssuers[_issuer] = true;
        issuerNames[_issuer] = _name;

        emit IssuerAdded(_issuer, _name);
    }

    function removeIssuer(address _issuer) external onlyRole(GOVERNANCE_ROLE) {
        require(authorizedIssuers[_issuer], "Issuer tidak ditemukan");
        
        authorizedIssuers[_issuer] = false;
        delete issuerNames[_issuer];

        emit IssuerRemoved(_issuer);
    }

    function isIssuer(address _account) external view returns (bool) {
        return authorizedIssuers[_account];
    }
}