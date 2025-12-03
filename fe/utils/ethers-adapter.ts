import { useMemo } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useWalletClient } from 'wagmi';

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return useMemo(() => {
    if (!walletClient) return undefined;

    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    
    // Bikin Provider Ethers v6
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);

    return signer;
  }, [walletClient]);
}