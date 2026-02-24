export default function SecurityCallout() {
  return (
    <section style={{ padding: "0 32px 120px", maxWidth: 1120, margin: "0 auto" }}>
      <div className="security-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 28, padding: "88px 72px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -10%, rgba(200,240,78,.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div className="vtag" style={{ display: "inline-flex", marginBottom: 24 }}>Privacy First</div>
          <h2 className="font-display"
            style={{ fontSize: "clamp(2.4rem,5.5vw,5rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.0, color: "var(--text)", margin: "0 auto 24px", maxWidth: 780 }}>
            We never have any<br />
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>access to your documents</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480, margin: "0 auto 14px" }}>
            File Anda tidak pernah meninggalkan browser. Hanya hash yang dikirim ke blockchain tidak ada server, tidak ada pihak ketiga.
          </p>
          <p style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Smart contract terverifikasi di BaseScan
          </p>
        </div>
      </div>
    </section>
  );
}
