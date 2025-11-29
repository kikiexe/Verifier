// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract IssuerRegistry is Ownable {
    event IssuerAdded(address indexed issuer, string name);
    event IssuerRemoved(address indexed issuer);

    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerNames;

    constructor() Ownable(msg.sender) {}

    function addIssuer(address _issuer, string memory _name) external onlyOwner {
        require(_issuer != address(0), "Address tidak valid");
        require(!authorizedIssuers[_issuer], "Issuer sudah terdaftar");

        authorizedIssuers[_issuer] = true;
        issuerNames[_issuer] = _name;

        emit IssuerAdded(_issuer, _name);
    }

    function removeIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Issuer tidak ditemukan");
        
        authorizedIssuers[_issuer] = false;
        delete issuerNames[_issuer];

        emit IssuerRemoved(_issuer);
    }

    function isIssuer(address _account) external view returns (bool) {
        return authorizedIssuers[_account];
    }
}