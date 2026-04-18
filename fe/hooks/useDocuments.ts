/**
 * hook useDocuments - Mengelola daftar dokumen yang dimiliki oleh user.
 * Menangani pengambilan metadata dari IPFS dan integrasi dengan Smart Contract Velipe.
 * Termasuk mutasi untuk melakukan 'revoke' (pencabutan) dokumen.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { useAccount } from "wagmi";
import { useEthersSigner, useEthersProvider } from "@/utils/ethers-adapter";

export interface DocItem {
  tokenId: string;
  timestamp: string;
  isVerified: boolean;
  isRevoked: boolean;
  hash: string;
  name: string;
  description: string;
  image?: string;
}


export function useDocuments() {
  const { address } = useAccount();
  const provider = useEthersProvider();

  return useQuery({
    queryKey: ["documents", address],
    queryFn: async () => {
      if (!address || !provider) return [];

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const tokenIds: bigint[] = await contract.getIssuerDocuments(address);
      
      const docsData = await Promise.all(
        tokenIds.map(async (id) => {
          const [data, uri] = await Promise.all([
            contract.getDocumentData(id),
            contract.tokenURI(id)
          ]);

          let docName = "Memuat nama...";
          let docDesc = "";
          try {
            const httpUri = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            const metaRes = await fetch(httpUri);
            const metadata = await metaRes.json();
            docName = metadata.name || "Dokumen Tanpa Nama";
            docDesc = metadata.description || "";
          } catch (e) {
            console.warn(`Gagal ambil metadata untuk #${id}`, e);
            docName = "Dokumen # " + id.toString();
          }

          return {
            tokenId: id.toString(),
            name: docName,
            description: docDesc,
            timestamp: new Date(Number(data.timestamp) * 1000).toLocaleDateString("id-ID", {
              day: 'numeric', month: 'short', year: 'numeric'
            }),
            isVerified: data.isVerified,
            isRevoked: data.isRevoked,
            hash: data.documentHash,
          };
        })
      );

      return docsData.reverse();
    },
    enabled: !!address,
  });
}

export function useRevokeDocument() {
  const signer = useEthersSigner();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      if (!signer) throw new Error("Wallet belum terhubung dengan benar!");
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.revokeDocument(tokenId);
      return tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", address] });
    },
  });
}
