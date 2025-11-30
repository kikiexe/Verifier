// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

interface IIssuerRegistry {
    function isIssuer(address _account) external view returns (bool);
    function getIssuerName(address _account) external view returns (string memory);
}

contract HybridDocument is ERC721, ERC721URIStorage, Ownable {
    
    // FIX 1: Start dari 1 agar mapping hashToToken(0) valid untuk pengecekan existence
    uint256 private _nextTokenId = 1; 
    
    IIssuerRegistry public issuerRegistry;

    struct DocumentData {
        bytes32 documentHash;
        address issuer;
        uint256 timestamp;
        bool isSoulbound;
        bool isVerified;
        bool isRevoked;
    }
    
    mapping(uint256 => DocumentData) public documents;
    mapping(bytes32 => uint256) public hashToToken;
    mapping(address => uint256[]) private issuerDocuments;
    
    event DocumentMinted(uint256 indexed tokenId, address indexed recipient, address indexed issuer, bytes32 documentHash, bool isSoulbound, bool isVerified);
    event DocumentRevoked(uint256 indexed tokenId, address indexed issuer, uint256 timestamp);
    
    constructor(address _registryAddress) ERC721("Velipe Document", "VDOC") Ownable(msg.sender) {
        issuerRegistry = IIssuerRegistry(_registryAddress);
    }

    function mintOfficialDocument(address to, string memory uri, bool _soulbound, bytes32 _documentHash) public {
        require(issuerRegistry.isIssuer(msg.sender), "Only verified issuers can mint official documents");
        require(_documentHash != bytes32(0), "Document hash cannot be empty");
        // Check collision: 0 berarti belum ada (karena ID mulai dari 1)
        require(hashToToken[_documentHash] == 0, "Document with this hash already exists");
        
        _createToken(to, uri, _soulbound, true, _documentHash);
    }

    function mintPublicDocument(string memory uri, bool _soulbound, bytes32 _documentHash) public {
        require(_documentHash != bytes32(0), "Document hash cannot be empty");
        require(hashToToken[_documentHash] == 0, "Document with this hash already exists");
        
        _createToken(msg.sender, uri, _soulbound, false, _documentHash);
    }

    function _createToken(address to, string memory uri, bool _soulbound, bool _verified, bytes32 _documentHash) internal {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        documents[tokenId] = DocumentData({
            documentHash: _documentHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isSoulbound: _soulbound,
            isVerified: _verified,
            isRevoked: false
        });
        
        hashToToken[_documentHash] = tokenId;
        issuerDocuments[msg.sender].push(tokenId);
        
        emit DocumentMinted(tokenId, to, msg.sender, _documentHash, _soulbound, _verified);
    }

    function verifyByHash(bytes32 _hash) public view returns (bool exists, uint256 tokenId, address owner, address issuer, string memory issuerName, DocumentData memory data) {
        tokenId = hashToToken[_hash];
        
        if (tokenId == 0) {
            return (false, 0, address(0), address(0), "", documents[0]);
        }
        
        data = documents[tokenId];
        owner = ownerOf(tokenId);
        issuer = data.issuer;
        
        if (data.isVerified) {
            // Panggil fungsi getIssuerName yang baru
            // INI KUNCINYA: Walaupun issuer sudah isActive=false, namanya tetap bisa diambil!
            issuerName = issuerRegistry.getIssuerName(issuer);
        } else {
            issuerName = "Self-Signed (Public)";
        }
        
        return (true, tokenId, owner, issuer, issuerName, data);
    }
    
    function getDocumentData(uint256 tokenId) public view returns (DocumentData memory) {
        require(_ownerOf(tokenId) != address(0), "Document does not exist");
        return documents[tokenId];
    }

    function revokeDocument(uint256 tokenId) public {
        DocumentData storage doc = documents[tokenId];
        require(_ownerOf(tokenId) != address(0), "Document does not exist");
        require(doc.issuer == msg.sender, "Only issuer can revoke document");
        require(!doc.isRevoked, "Document already revoked");
        
        doc.isRevoked = true;
        emit DocumentRevoked(tokenId, msg.sender, block.timestamp);
    }

    function getIssuerDocuments(address _issuer) public view returns (uint256[] memory) {
        return issuerDocuments[_issuer];
    }
    
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1; // Adjust karena start dari 1
    }

    /**
     * @dev Fungsi darurat untuk ganti alamat Registry (Buku Telepon)
     */
    function setIssuerRegistry(address _newRegistry) external onlyOwner {
        require(_newRegistry != address(0), "Address tidak valid");
        issuerRegistry = IIssuerRegistry(_newRegistry);
    }

    // ========== OVERRIDES & SECURITY ==========
    
    // FIX 2: Override _isAuthorized untuk membiarkan Issuer melewati check Approval
    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view override(ERC721) returns (bool) {
        // Check logic standar (owner/approved/operator)
        if (super._isAuthorized(owner, spender, tokenId)) {
            return true;
        }
        // Logic tambahan: Issuer selalu authorized (terutama untuk SBT/Revoke/Re-issue case)
        return (spender == documents[tokenId].issuer);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // SBT Logic: Block transfer kecuali mint/burn atau dilakukan oleh issuer
        if (from != address(0) && to != address(0)) {
            DocumentData memory doc = documents[tokenId];
            // Logika Baru (Aman)
            if (doc.isSoulbound) {
                
                // Skenario 1: Dokumen Resmi (Verified)
                if (doc.isVerified) {
                // Boleh ditransfer CUMA oleh Issuer (Kampus).
                // Tujuannya: Jika mahasiswa kena hack, Kampus bisa "menyelamatkan" ijazahnya ke wallet baru.
                require(msg.sender == doc.issuer, "SBT: Only Issuer can transfer");
                } 
                
                // Skenario 2: Dokumen Pribadi (Self-Signed / Public)
                else {
                // SAMA SEKALI TIDAK BOLEH DITRANSFER oleh siapapun, termasuk pembuatnya.
                // Langsung tolak (revert).
                revert("SBT: Token is non-transferable (Self-Signed)");
                }
            }
        }
        
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}