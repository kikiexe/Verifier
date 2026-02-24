"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Upload, Search, House, User } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit'; 
import ProfileSidebar from './ProfileSidebar';
import { useAccount } from 'wagmi';

const colors = {
  primary: 'bg-[#fbbf24]',
};

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getLinkClass = (path: string) => 
    `hover:text-yellow-600 ${pathname === path ? 'underline decoration-2 underline-offset-4' : ''}`;

  const getMobileClass = (path: string) => 
    `flex-1 flex flex-col items-center p-2 rounded-lg ${pathname === path ? 'bg-yellow-100' : ''}`;


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

          <div className="flex items-center gap-4">
            <ConnectButton />

            {isConnected && (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-2 border-2 border-black rounded-full hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white"
                title="Profil Saya"
              >
                <User size={24} />
              </button>
            )}
          </div>
        </div>
      </nav>

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

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