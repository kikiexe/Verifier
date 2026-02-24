import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutSection() {
  return (
    <section style={{ padding: "120px 32px", maxWidth: 1120, margin: "0 auto" }}>
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div className="vtag" style={{ marginBottom: 24 }}>About Velipe</div>
          <h2 className="font-display" style={{ fontSize: "clamp(2.2rem,4.5vw,3.8rem)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.03, color: "var(--text)" }}>
            Unlocking trust<br />
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>for digital</span><br />
            documents
          </h2>
        </div>
        <div>
          <div style={{ width: 36, height: 3, background: "var(--accent)", marginBottom: 28, borderRadius: 2 }} />
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.8, marginBottom: 20 }}>
            Velipe adalah protokol notarisasi digital terdesentralisasi. Setiap dokumen mendapat sidik jari digital (SHA-256) yang dicatat secara permanen di blockchain.
          </p>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
            Transparan, anti manipulasi, dan bisa diverifikasi siapa saja tanpa perlu mempercayai pihak ketiga.
          </p>
          <Link href="/upload"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", transition: "gap .2s" }}
            onMouseEnter={e => e.currentTarget.style.gap = "14px"}
            onMouseLeave={e => e.currentTarget.style.gap = "8px"}
          >
            Launch App <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
