import Navbar from "../../components/Navbar";
import ClientLayout from "../../components/ClientLayout";

export default function DappLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>
      <Navbar />
      {children}
    </ClientLayout>
  );
}
