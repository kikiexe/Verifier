// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
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
    string public testURI = "ipfs://QmTest123";

    function setUp() public {
        vm.startPrank(admin);
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));
        registry.addIssuer(verifiedIssuer, "Universitas Amikom");
        vm.stopPrank();
    }

    function testVerifiedIssuerCanMintOfficial() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        // Assert tokenId 1 (karena start dari 1)
        assertEq(document.ownerOf(1), recipient);
        
        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertTrue(data.isVerified);
        assertTrue(data.isSoulbound);
        assertEq(data.issuer, verifiedIssuer);
        vm.stopPrank();
    }

    function testPublicUserCannotMintOfficial() public {
        vm.startPrank(publicUser);
        vm.expectRevert("Only verified issuers can mint official documents");
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        vm.stopPrank();
    }

    function testPublicUserCanMintPublic() public {
        vm.startPrank(publicUser);
        document.mintPublicDocument(testURI, true, testHash1);
        
        assertEq(document.ownerOf(1), publicUser);
        
        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertFalse(data.isVerified);
        assertEq(data.issuer, publicUser);
        vm.stopPrank();
    }

    function testCannotMintDuplicateHash() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        // Pengecekan collision harusnya berhasil sekarang
        vm.expectRevert("Document with this hash already exists");
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        vm.stopPrank();
    }

    function testVerifyByHashValid() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        (bool exists, uint256 tokenId, address owner, address issuer, string memory issuerName, HybridDocument.DocumentData memory data) 
            = document.verifyByHash(testHash1);
        
        assertTrue(exists);
        assertEq(tokenId, 1); // Check ID 1
        assertEq(owner, recipient);
        assertEq(issuer, verifiedIssuer);
        assertEq(issuerName, "Universitas Amikom");
        assertTrue(data.isVerified);
        assertFalse(data.isRevoked);
    }

    function testVerifyByHashInvalid() public {
        bytes32 fakeHash = keccak256("fake.pdf");
        (bool exists,,,,,) = document.verifyByHash(fakeHash);
        assertFalse(exists);
    }

    function testVerifyRevokedDocument() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        document.revokeDocument(1); // Revoke ID 1
        vm.stopPrank();
        
        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertTrue(data.isRevoked);
    }

    function testSBTCannotBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        vm.startPrank(recipient);
        vm.expectRevert("SBT: Token is non-transferable");
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
    }

    function testNFTCanBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, false, testHash1);
        
        vm.startPrank(recipient);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    function testIssuerCanTransferSBT() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        // Issuer transfer SBT (Sekarang harusnya berhasil karena override _isAuthorized)
        vm.startPrank(verifiedIssuer);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    function testIssuerCanRevokeDocument() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        vm.prank(verifiedIssuer);
        document.revokeDocument(1);
        
        HybridDocument.DocumentData memory data = document.getDocumentData(1);
        assertTrue(data.isRevoked);
    }

    function testNonIssuerCannotRevoke() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        vm.prank(attacker);
        vm.expectRevert("Only issuer can revoke document");
        document.revokeDocument(1);
    }

    function testGetIssuerDocuments() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        document.mintOfficialDocument(recipient, testURI, true, testHash2);
        vm.stopPrank();
        
        uint256[] memory docs = document.getIssuerDocuments(verifiedIssuer);
        assertEq(docs.length, 2);
        assertEq(docs[0], 1);
        assertEq(docs[1], 2);
    }

    function testTotalSupply() public {
        assertEq(document.totalSupply(), 0);
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        assertEq(document.totalSupply(), 1);
    }

    function testCannotRevokeAlreadyRevoked() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        document.revokeDocument(1); // Gunakan ID 1
        
        vm.expectRevert("Document already revoked");
        document.revokeDocument(1); // Gunakan ID 1
        
        vm.stopPrank();
    }

    function testCannotMintWithEmptyHash() public {
        vm.prank(verifiedIssuer);
        vm.expectRevert("Document hash cannot be empty");
        document.mintOfficialDocument(recipient, testURI, true, bytes32(0));
    }

    function testTokenURIWorks() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testURI, true, testHash1);
        
        string memory uri = document.tokenURI(1); // Gunakan ID 1
        assertEq(uri, testURI);
    }
}