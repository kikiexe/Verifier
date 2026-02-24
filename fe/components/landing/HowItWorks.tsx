import { Wallet, Upload, Blocks, FileCheck } from "lucide-react";

const STEPS = [
  { n: "01", icon: <Wallet size={18} />, title: "Connect Wallet", desc: "Hubungkan wallet Ethereum Anda MetaMask, Coinbase, atau wallet lainnya dalam hitungan detik." },
  { n: "02", icon: <Upload size={18} />, title: "Upload Document", desc: "Unggah file PDF. Hash SHA-256 dihitung otomatis di browser file tidak pernah dikirim ke server." },
  { n: "03", icon: <Blocks size={18} />, title: "Mint on Blockchain", desc: "Smart contract mencatat sidik jari digital dokumen secara permanen di Base L2." },
  { n: "04", icon: <FileCheck size={18} />, title: "Verify Anytime", desc: "Siapapun bisa memverifikasi keaslian dokumen kapan saja, dari mana saja selamanya." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "80px 32px 120px", borderTop: "1px solid var(--border)", maxWidth: 1120, margin: "0 auto" }}>
      <div className="howitworks-grid" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 80, alignItems: "start" }}>
        {/* Sticky label */}
        <div style={{ position: "sticky", top: 100 }}>
          <div className="vtag" style={{ marginBottom: 20 }}>How it Works</div>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.04, color: "var(--text)", marginBottom: 20 }}>
            Four steps to secure forever
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75 }}>
            Proses notarisasi digital yang sederhana namun menggunakan teknologi blockchain grade enterprise.
          </p>
        </div>

        {/* Steps */}
        <div>
          {STEPS.map(step => (
            <div key={step.n} className="step-card">
              <div className="step-icon">{step.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", opacity: .6 }}>{step.n}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{step.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
