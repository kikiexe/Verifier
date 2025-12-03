import axios from "axios";

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

/**
 * Fungsi untuk upload File Fisik (PDF/Gambar) ke IPFS
 */
export const uploadFileToIPFS = async (file: File) => {
  if (!JWT) throw new Error("Pinata JWT not found in .env");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data;`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

/**
 * Fungsi untuk upload JSON Metadata (Standar NFT ERC-721)
 * Ini yang masuk ke Blockchain, bukan file PDF-nya.
 */
export const uploadJSONToIPFS = async (jsonData: object) => {
  if (!JWT) throw new Error("Pinata JWT not found in .env");

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      jsonData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    return `ipfs://${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
};