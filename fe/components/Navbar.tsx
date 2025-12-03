"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Upload, Search, Globe, House } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const colors = {
  primary: 'bg-[#fbbf24]',
};

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => 
    `hover:text-yellow-600 ${pathname === path ? 'underline decoration-2 underline-offset-4' : ''}`;

  const getMobileClass = (path: string) => 
    `flex-1 flex flex-col items-center p-2 rounded-lg ${pathname === path ? 'bg-yellow-100' : ''}`;

  const baseButtonStyle = "cursor-pointer font-bold border-2 border-black rounded-lg py-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-white text-black px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex cursor-pointer items-center gap-2">
            <div className={`h-10 w-10 overflow-hidden rounded-full border-2 border-black ${colors.primary} flex items-center justify-center`}>
              <Shield className="h-6 w-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tighter">VELIPE</span>
          </Link>

          <div className="hidden md:flex gap-6 font-bold text-sm">
            <Link href="/" className={getLinkClass('/')}>Beranda</Link>
            <Link href="/upload" className={getLinkClass('/upload')}>Terbitkan Dokumen</Link>
            <Link href="/verify" className={getLinkClass('/verify')}>Verifikasi</Link>
          </div>

          <div>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className={`${baseButtonStyle} bg-blue-600 text-white hover:bg-blue-700`}
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button 
                            onClick={openChainModal} 
                            type="button"
                            className={`${baseButtonStyle} bg-red-500 text-white hover:bg-red-600`}
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className={`${baseButtonStyle} bg-green-400 text-black hover:bg-green-500 flex items-center gap-2`}
                          >
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Bottom */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="flex justify-between rounded-xl border-2 border-black bg-white text-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           
           <Link href="/" className={getMobileClass('/')}>
             <House size={20} strokeWidth={2.5} />
             <span className="text-[10px] font-bold mt-1">Home</span>
           </Link>

           <Link href="/upload" className={getMobileClass('/upload')}>
             <Upload size={20} strokeWidth={2.5} />
             <span className="text-[10px] font-bold mt-1">Upload</span>
           </Link>

           <Link href="/verify" className={getMobileClass('/verify')}>
             <Search size={20} strokeWidth={2.5} />
             <span className="text-[10px] font-bold mt-1">Cek</span>
           </Link>

        </div>
      </div>
    </>
  );
}