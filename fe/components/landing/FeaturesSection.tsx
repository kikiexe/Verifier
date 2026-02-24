import { Lock, CheckCircle, Fingerprint } from "lucide-react";

const FEATURES = [
  { stat: "2 MODES", icon: <Lock size={20} />, title: "Hybrid Token", desc: "Pilih mode Soulbound (SBT) untuk dokumen permanen atau Transferable (NFT) untuk sertifikat fleksibel." },
  { stat: "ON-CHAIN GOV", icon: <CheckCircle size={20} />, title: "Verified Issuers", desc: "Institusi resmi mendapat badge verifikasi melalui governance on-chain. Hanya pihak terpercaya yang diizinkan." },
  { stat: "SHA-256", icon: <Fingerprint size={20} />, title: "On-Chain Hash", desc: "Sidik jari digital setiap dokumen tercatat permanen di blockchain. Tidak bisa dipalsukan oleh siapapun." },
];

const PILLS = ["Hybrid Token", "Verified Issuers", "On-Chain Hash"];

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "0 32px 120px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 80, marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="vtag" style={{ marginBottom: 20 }}>Our Features</div>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.04, color: "var(--text)" }}>
              Built for trust.<br />
              <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Designed for all.</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PILLS.map((label, i) => (
              <span key={label} style={{
                padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                border: i === 0 ? "1px solid var(--accent)" : "1px solid var(--border)",
                color: i === 0 ? "#0c0c0f" : "var(--faint)",
                background: i === 0 ? "var(--accent)" : "transparent",
                letterSpacing: "0.04em",
              }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {FEATURES.map(c => (
          <div key={c.title} className="feat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700, color: "var(--accent)", opacity: .65 }}>{c.stat}</span>
              <span style={{ color: "var(--accent)", opacity: .5 }}>{c.icon}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" }}>{c.title}</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.72 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
