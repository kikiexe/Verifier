/**
 * DappLayout - Layout khusus untuk halaman-halaman aplikasi (dapp).
 * Menyediakan kerangka dasar termasuk komponen Navbar.
 */
import Navbar from "../../components/Navbar";

export default function DappLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
