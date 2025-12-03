// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

contract IssuerRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    struct Issuer {
        string name;
        bool isActive;      // True = Boleh minting, False = Dibekukan
        bool isRegistered;  // True = Pernah terdaftar
    }

    mapping(address => Issuer) public issuers;

    event IssuerAdded(address indexed issuer, string name);
    event IssuerStatusChanged(address indexed issuer, bool isActive);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }

    // Fungsi Tambah / Update Issuer
    function addIssuer(address _issuer, string memory _name) external onlyRole(GOVERNANCE_ROLE) {
        require(_issuer != address(0), "Address tidak valid");
        require(bytes(_name).length > 0, "Nama tidak boleh kosong");

        // Jika sudah terdaftar, update data & aktifkan kembali. Jika belum, buat baru.
        issuers[_issuer] = Issuer({
            name: _name,
            isActive: true,
            isRegistered: true
        });

        emit IssuerAdded(_issuer, _name);
        emit IssuerStatusChanged(_issuer, true);
    }

    // Fungsi Soft Delete (Hanya set isActive = false)
    function setIssuerStatus(address _issuer, bool _status) external onlyRole(GOVERNANCE_ROLE) {
        require(issuers[_issuer].isRegistered, "Issuer tidak ditemukan");
        
        issuers[_issuer].isActive = _status;
        emit IssuerStatusChanged(_issuer, _status);
    }

    // --- Helper Functions ---

    // Cek apakah boleh minting (Wajib Active)
    function isIssuer(address _account) external view returns (bool) {
        return issuers[_account].isActive;
    }

    // Ambil nama (Walaupun sudah tidak aktif, nama tetap tersimpan untuk histori)
    function getIssuerName(address _account) external view returns (string memory) {
        return issuers[_account].name;
    }
}