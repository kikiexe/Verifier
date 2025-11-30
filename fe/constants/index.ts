// fe/constants/index.ts

export const REGISTRY_ADDRESS = "0xF48a2086202F89B000645c68c933cbB3bEfBA958";
export const CONTRACT_ADDRESS = "0x1f33c4Ad972ecf3E8C20817667861e109889A015";

export const CONTRACT_ABI = [
  "function mintOfficialDocument(address to, string uri, bool soulbound, bytes32 hash) external",
  "function mintPublicDocument(string uri, bool soulbound, bytes32 hash) external",
  "function verifyByHash(bytes32 hash) external view returns (bool, uint256, address, address, string, tuple(bytes32 documentHash, address issuer, uint256 timestamp, bool isSoulbound, bool isVerified, bool isRevoked) data)",
  "function revokeDocument(uint256 tokenId) external",
  "function getDocumentData(uint256 tokenId) external view returns (tuple(bytes32 documentHash, address issuer, uint256 timestamp, bool isSoulbound, bool isVerified, bool isRevoked) data)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

export const REGISTRY_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function addIssuer(address _issuer, string _name)",
  "function setIssuerStatus(address _issuer, bool _status)",
  "function isIssuer(address _account) view returns (bool)",
  "function getIssuerName(address _account) view returns (string)",
  "function GOVERNANCE_ROLE() view returns (bytes32)"
];