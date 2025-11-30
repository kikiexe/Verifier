// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FIX 1: Hapus 'console' karena tidak dipakai
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
    
    // FIX 3: Ubah 'testURI' menjadi 'testUri' untuk mixedCase
    string public testUri = "ipfs://QmTest123";

    function setUp() public {
        vm.startPrank(admin);
        registry = new IssuerRegistry();
        document = new HybridDocument(address(registry));
        // Note: Pastikan logika addIssuer di sini sesuai dengan IssuerRegistry terbaru (AccessControl)
        // Jika Anda sudah update IssuerRegistry ke AccessControl, gunakan grantRole.
        // Asumsi di sini masih menggunakan fungsi wrapper atau logic lama untuk test ini.
        // Jika error, sesuaikan dengan: registry.grantRole(registry.GOVERNANCE_ROLE(), admin); lalu addIssuer.
        registry.addIssuer(verifiedIssuer, "Universitas Amikom");
        vm.stopPrank();
    }

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

    function testPublicUserCannotMintOfficial() public {
        vm.startPrank(publicUser);
        vm.expectRevert("Only verified issuers can mint official documents");
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        vm.stopPrank();
    }

    function testPublicUserCanMintPublic() public {
        vm.startPrank(publicUser);
        document.mintPublicDocument(testUri, true, testHash1);

        assertEq(document.ownerOf(1), publicUser);
        
        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertFalse(data.isVerified);
        assertEq(data.issuer, publicUser);
        vm.stopPrank();
    }

    function testCannotMintDuplicateHash() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);

        vm.expectRevert("Document with this hash already exists");
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        vm.stopPrank();
    }

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

    // FIX 2: Tambahkan 'view' karena fungsi ini tidak mengubah state
    function testVerifyByHashInvalid() public view {
        bytes32 fakeHash = keccak256("fake.pdf");
        (bool exists,,,,,) = document.verifyByHash(fakeHash);
        assertFalse(exists);
    }

    function testVerifyRevokedDocument() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        document.revokeDocument(1);
        vm.stopPrank();

        (,,,,,HybridDocument.DocumentData memory data) = document.verifyByHash(testHash1);
        assertTrue(data.isRevoked);
    }

    function testSBTCannotBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        vm.startPrank(recipient);
        // Sesuaikan pesan revert dengan update logika SBT terbaru Anda
        vm.expectRevert(); 
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
    }

    function testNFTCanBeTransferred() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, false, testHash1); // false = NFT

        vm.startPrank(recipient);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    function testIssuerCanTransferSBT() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        // Issuer transfer SBT (Recovery Mechanism)
        vm.startPrank(verifiedIssuer);
        document.transferFrom(recipient, attacker, 1);
        vm.stopPrank();
        
        assertEq(document.ownerOf(1), attacker);
    }

    function testIssuerCanRevokeDocument() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        vm.prank(verifiedIssuer);
        document.revokeDocument(1);
        
        HybridDocument.DocumentData memory data = document.getDocumentData(1);
        assertTrue(data.isRevoked);
    }

    function testNonIssuerCannotRevoke() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);

        vm.prank(attacker);
        vm.expectRevert("Only issuer can revoke document");
        document.revokeDocument(1);
    }

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

    function testTotalSupply() public {
        assertEq(document.totalSupply(), 0);
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        assertEq(document.totalSupply(), 1);
    }

    function testCannotRevokeAlreadyRevoked() public {
        vm.startPrank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        document.revokeDocument(1);
        
        vm.expectRevert("Document already revoked");
        document.revokeDocument(1);
        
        vm.stopPrank();
    }

    function testCannotMintWithEmptyHash() public {
        vm.prank(verifiedIssuer);
        vm.expectRevert("Document hash cannot be empty");
        document.mintOfficialDocument(recipient, testUri, true, bytes32(0));
    }

    function testTokenURIWorks() public {
        vm.prank(verifiedIssuer);
        document.mintOfficialDocument(recipient, testUri, true, testHash1);
        
        string memory uri = document.tokenURI(1);
        assertEq(uri, testUri);
    }
}