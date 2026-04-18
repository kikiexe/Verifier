/**
 * hook useAdmin - Menangani logika khusus untuk peran Governance (Admin).
 * Digunakan untuk mengecek hak akses admin dan mengelola daftar issuer melalui blockchain event logs.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers, type EventLog, type Log, type LogDescription } from "ethers";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/constants";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/utils/ethers-adapter";

const GOVERNANCE_ROLE = ethers.id("GOVERNANCE_ROLE");

export interface Issuer {
  address: string;
  name: string;
}

export function useAdmin() {
  const { address } = useAccount();
  const signer = useEthersSigner();

  const roleQuery = useQuery({
    queryKey: ["adminRole", address],
    queryFn: async () => {
      if (!address || !signer) return false;
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      return await registry.hasRole(GOVERNANCE_ROLE, address);
    },
    enabled: !!address && !!signer,
  });

  const issuersQuery = useQuery({
    queryKey: ["issuers"],
    queryFn: async () => {
      if (!signer) return [];
      
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const provider = signer.provider;
      if (!provider) return [];
      
      const currentBlock = await provider.getBlockNumber();
      const deploymentBlock = 38088367;
      const CHUNK_SIZE = 10000;
      const allEvents: (Log | EventLog | LogDescription)[] = [];
      
      for (let fromBlock = deploymentBlock; fromBlock <= currentBlock; fromBlock += CHUNK_SIZE) {
        const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
        try {
          const filter = registry.filters.IssuerAdded();
          const events = await registry.queryFilter(filter, fromBlock, toBlock);
          allEvents.push(...events);
        } catch (error) {
          console.error(`Error fetching events from block ${fromBlock} to ${toBlock}:`, error);
        }
      }
      
      const issuerPromises = allEvents.map(async (event: Log | EventLog | LogDescription) => {
        const eventLog = event as EventLog;
        const issuerAddress = eventLog.args.issuer;
        const issuerName = eventLog.args.name;
        const isActive = await registry.isIssuer(issuerAddress);
        return isActive ? { address: issuerAddress, name: issuerName } : null;
      });
      
      const issuerList = await Promise.all(issuerPromises);
      return issuerList.filter((i): i is Issuer => i !== null);
    },
    enabled: !!signer && !!roleQuery.data,
  });

  return {
    isAdmin: roleQuery.data || false,
    isAdminLoading: roleQuery.isLoading,
    issuers: issuersQuery.data || [],
    issuersLoading: issuersQuery.isLoading,
    refetchIssuers: issuersQuery.refetch,
  };
}

export function useAdminMutations() {
  const signer = useEthersSigner();
  const queryClient = useQueryClient();

  const addIssuer = useMutation({
    mutationFn: async ({ address, name }: { address: string; name: string }) => {
      if (!signer) throw new Error("Wallet tidak terdeteksi!");
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const tx = await registry.addIssuer(address, name);
      return tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuers"] });
    },
  });

  const removeIssuer = useMutation({
    mutationFn: async (targetAddress: string) => {
      if (!signer) throw new Error("Wallet tidak terdeteksi!");
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const tx = await registry.setIssuerStatus(targetAddress, false);
      return tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuers"] });
    },
  });

  return { addIssuer, removeIssuer };
}
