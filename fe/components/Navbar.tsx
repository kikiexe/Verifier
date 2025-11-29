"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path
      ? "text-blue-600 font-bold border-b-2 border-blue-600"
      : "text-gray-600 hover:text-blue-500";

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl font-bold text-xl shadow-lg">
            V
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Velipe
            </span>
            <p className="text-xs text-gray-500">Document Authentication</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 text-sm font-medium">
          <Link href="/" className={isActive("/")}>
            🏠 Beranda
          </Link>
          <Link href="/upload" className={isActive("/upload")}>
            📤 Upload
          </Link>
          <div className="relative group">
            <button className={`${isActive("/verify") || isActive("/verify-by-file") ? "text-blue-600 font-bold" : "text-gray-600"} hover:text-blue-500`}>
              🔍 Verifikasi
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link
                href="/verify"
                className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-600"
              >
                📝 By Token ID
              </Link>
              <Link
                href="/verify-by-file"
                className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-600 border-t"
              >
                📄 By File Upload
              </Link>
            </div>
          </div>
          <Link href="/admin" className={isActive("/admin")}>
            👨‍💼 Admin
          </Link>
        </div>

        {/* Network Badge */}
        <div>
          <a
            href="https://sepolia.arbiscan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-300 hover:from-blue-200 hover:to-indigo-200 transition font-medium"
          >
            ⚡ Arbitrum Sepolia
          </a>
        </div>
      </div>
    </nav>
  );
}