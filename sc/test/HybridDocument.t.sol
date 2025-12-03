// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IssuerRegistry} from "../src/IssuerRegistry.sol";
import {HybridDocument} from "../src/HybridDocument.sol";

contract HybridDocumentTest is Test {
    IssuerRegistry public registry;
    HybridDocument public document;

    address public admin = address(1);
    address public verifiedIssuer = address(2);
    address public publicUser = address(3);
    address public recipient = address(4);
    address public attacker = address(5);

    bytes32 public testHash1 = keccak256("document1.pdf");
    bytes32 public testHash2 = keccak256("document2.pdf");
    
    string public testUri = "ipfs://QmTest123";

    function setUp() public {
        vm.startPrank(admin);
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));
        registry.addIssuer(verifiedIssuer, "Universitas Amikom");
        vm.stopPrank();
    }

    // Tes: issuer terverifikasi bisa mint dokumen resmi
    function testVerifiedIssuerCanMintOfficial() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        assertEq(document.ownerOf(1), recipient);

        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertTrue(data.isVerified);
        assertTrue(data.isSoulbound);
        assertEq(data.issuer, verifiedIssuer);
        vm.stopPrank();
    }

    // Tes: user publik tidak bisa mint dokumen resmi
    function testPublicUserCannotMintOfficial() public {
        vm.startPrank(publicUser);
        vm.expectRevert("Only verified issuers can mint official documents");
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        vm.stopPrank();
    }

    // Tes: user publik bisa mint dokumen publik
    function testPublicUserCanMintPublic() public {
        vm.startPrank(publicUser);
        document.mintPublicDocument(testUri, true, testHash1);

        assertEq(document.ownerOf(1), publicUser);
        
        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertFalse(data.isVerified);
        assertEq(data.issuer, publicUser);
        vm.stopPrank();
    }

    // Tes: hash dokumen tidak boleh duplikat
    function testCannotMintDuplicateHash() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);

        vm.expectRevert("Document with this hash already exists");
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        vm.stopPrank();
    }

    // Tes: verifyByHash harus menemukan dokumen valid
    function testVerifyByHashValid() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        (bool exists, uint256 tokenId, address owner, address issuer, string memory issuerName, HybridDocument.DocumentData memory data) 
            = document.verifyByHash(testHash1);

        assertTrue(exists);
        assertEq(tokenId, 1);
        assertEq(owner, recipient);
        assertEq(issuer, verifiedIssuer);
        assertEq(issuerName, "Universitas Amikom");
        assertTrue(data.isVerified);
        assertFalse(data.isRevoked);
    }

    // Tes: verifyByHash harus return false jika hash tidak ditemukan
    function testVerifyByHashInvalid() public view {
        bytes32 fakeHash = keccak256("fake.pdf");
        (bool exists,,,,,) = document.verifyByHash(fakeHash);
        assertFalse(exists);
    }

    // Tes: dokumen yang sudah direvoke terbaca sebagai revoked
    function testVerifyRevokedDocument() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        document.revokeDocument(1);
        vm.stopPrank();

        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertTrue(data.isRevoked);
    }

    // Tes: SBT tidak bisa ditransfer oleh pemilik
    function testSBTCannotBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        vm.startPrank(recipient);
        vm.expectRevert(); 
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
    }

    // Tes: NFT (non-soulbound) bisa ditransfer oleh pemilik
    function testNFTCanBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, false, testHash1);

        vm.startPrank(recipient);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    // Tes: issuer tetap bisa memindahkan SBT
    function testIssuerCanTransferSBT() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        vm.startPrank(verifiedIssuer);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    // Tes: issuer dapat revoke dokumen
    function testIssuerCanRevokeDocument() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        vm.prank(verifiedIssuer);
        document.revokeDocument(1);
        
        HybridDocument.DocumentData memory data = document.getDocumentData(1);
        assertTrue(data.isRevoked);
    }

    // Tes: non-issuer tidak bisa revoke dokumen
    function testNonIssuerCannotRevoke() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);

        vm.prank(attacker);
        vm.expectRevert("Only issuer can revoke document");
        document.revokeDocument(1);
    }

    // Tes: mendapatkan list dokumen yang pernah diterbitkan issuer
    function testGetIssuerDocuments() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        document.mintOfficialDocument(recipient, testUri, true, testHash2);
        vm.stopPrank();
        
        uint256[] memory docs = document.getIssuerDocuments(verifiedIssuer);
        assertEq(docs.length, 2);
        assertEq(docs[0], 1);
        assertEq(docs[1], 2);
    }

    // Tes: totalSupply harus bertambah setelah mint
    function testTotalSupply() public {
        assertEq(document.totalSupply(), 0);
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        assertEq(document.totalSupply(), 1);
    }

    // Tes: dokumen tidak bisa direvoke dua kali
    function testCannotRevokeAlreadyRevoked() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        document.revokeDocument(1);
        
        vm.expectRevert("Document already revoked");
        document.revokeDocument(1);
        
        vm.stopPrank();
    }

    // Tes: hash kosong tidak boleh digunakan saat mint
    function testCannotMintWithEmptyHash() public {
        vm.prank(verifiedIssuer);
        vm.expectRevert("Document hash cannot be empty");
        document.mintOfficialDocument(recipient, testUri, true, bytes32(0));
    }

    // Tes: tokenURI harus mengembalikan URI yang benar
    function testTokenURIWorks() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        string memory uri = document.tokenURI(1);
        assertEq(uri, testUri);
    }

    // Tes: data issuer lama tetap valid meski issuer dinonaktifkan
    function testHistoricalDataPreservedAfterDeactivation() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        vm.stopPrank();

        vm.startPrank(admin);
        registry.setIssuerStatus(verifiedIssuer, false);
        vm.stopPrank();

        vm.startPrank(verifiedIssuer);
        vm.expectRevert("Only verified issuers can mint official documents");
        document.mintOfficialDocument(recipient, testUri, true, testHash2);
        vm.stopPrank();

        (,,,, string memory issuerName, ) = document.verifyByHash(testHash1);

        assertEq(issuerName, "Universitas Amikom");
    }    
}