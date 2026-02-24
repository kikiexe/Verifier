import Link from "next/link";
import { ArrowRight, Fingerprint } from "lucide-react";

export default function HeroSection() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 32px 80px", position: "relative", textAlign: "center" }}>
      <div className="hero-radial" />

      <div className="vtag afu" style={{ marginBottom: 32 }}>
        <span className="dot-live" />
        Built on Base L2
      </div>

      <h1 className="font-display afu d1"
        style={{ fontSize: "clamp(3rem,9.5vw,8.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.05em", color: "var(--text)", maxWidth: 920 }}>
        Verify The<br />
        <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Authenticity</span><br />
        Of Any Document
      </h1>

      <p className="afu d2" style={{ fontSize: "clamp(15px,2vw,18px)", color: "var(--muted)", maxWidth: 540, lineHeight: 1.75, margin: "28px auto 44px" }}>
        Amankan dokumen digital dengan Blockchain &amp; IPFS. Transparan, permanen, anti-manipulasi.
      </p>

      <div className="afu d3" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/dashboard" className="btn-primary">
          Launch App <ArrowRight size={16} />
        </Link>
        <Link href="/verify" className="btn-ghost">
          <Fingerprint size={16} /> Verifikasi
        </Link>
      </div>

      {/* Stats */}
      <div className="afu d4" style={{ display: "flex", gap: 56, marginTop: 72, flexWrap: "wrap", justifyContent: "center", borderTop: "1px solid var(--border)", paddingTop: 48 }}>
        {[["< $0.01", "Per transaksi"], ["SHA-256", "Enkripsi"], ["Base L2", "Blockchain"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em" }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
