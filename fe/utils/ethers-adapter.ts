import { useMemo } from 'react';
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';

/**
 * useEthersProvider - Hook untuk mengonversi Public Client Wagmi menjadi Ethers v6 Provider.
 * Digunakan untuk operasi baca (read) dari blockchain menggunakan RPC yang terkonfigurasi.
 */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });

  return useMemo(() => {
    if (!publicClient) return undefined;
    
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    
    // Fallback if transport is not available for JsonRpcProvider
    if (transport.type === 'fallback') {
        const providers = (transport.transports as { value: { url: string } }[]).map(t => new JsonRpcProvider(t.value?.url, network));
        if (providers.length === 0) return undefined;
        return providers[0];
    }

    return new JsonRpcProvider(transport.url, network);
  }, [publicClient]);
}

/**
 * useEthersSigner - Hook untuk mengonversi Wallet Client Wagmi menjadi Ethers v6 Signer.
 * Digunakan untuk operasi tulis (write/transaksi) yang membutuhkan tanda tangan user.
 */
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
    
    // Bikin Provider Ethers v6 dari transport wallet
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);

    return signer;
  }, [walletClient]);
}