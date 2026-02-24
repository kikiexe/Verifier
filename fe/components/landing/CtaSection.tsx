import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section style={{ padding: "0 32px 120px", maxWidth: 1120, margin: "0 auto" }}>
      <div className="cta-card">
        <div>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3.4rem)", fontWeight: 900, letterSpacing: "-0.045em", color: "#0c0c0f", lineHeight: 1.04, marginBottom: 12 }}>
            Start securing your<br />documents today
          </h2>
          <p style={{ fontSize: 15, color: "rgba(12,12,15,.6)", lineHeight: 1.65 }}>Gratis, permanen, dan terdesentralisasi.</p>
        </div>
        <Link href="/upload"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 34px", background: "#0c0c0f", color: "var(--accent)", fontSize: 15, fontWeight: 800, borderRadius: 9999, whiteSpace: "nowrap", transition: "all .2s", fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1e1e2e"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#0c0c0f"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Launch App <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
