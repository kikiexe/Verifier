/**
 * hook useIssuer - Menangani logika pengecekan status verified issuer.
 * Digunakan untuk memverifikasi apakah sebuah alamat wallet memiliki izin untuk menerbitkan dokumen resmi.
 */
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/constants";
import { useAccount } from "wagmi";

import { useEthersProvider } from "@/utils/ethers-adapter";

export function useIssuer(address?: string) {
  const { address: currentAddress } = useAccount();
  const targetAddress = address || currentAddress;
  const provider = useEthersProvider();

  return useQuery({
    queryKey: ["issuer", targetAddress],
    queryFn: async () => {
      if (!targetAddress || !provider) return null;

      const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

      const [isVerified, issuerData] = await Promise.all([
        registryContract.isIssuer(targetAddress),
        registryContract.issuers(targetAddress)
      ]);

      return {
        isVerified,
        name: isVerified ? issuerData.name : "Profil Public",
        address: targetAddress
      };
    },
    enabled: !!targetAddress,
  });
}
