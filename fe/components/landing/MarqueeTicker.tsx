const ITEMS = ["Blockchain Verified", "SHA-256 Hash", "Base L2", "Decentralized", "Open Source", "Zero Server", "Soulbound Token", "NFT Support", "Instant Verify"];

export default function MarqueeTicker() {
  return (
    <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "14px 0", background: "rgba(200,240,78,0.025)", overflow: "hidden" }}>
      <div className="marquee-track">
        {Array(2).fill(null).flatMap((_, gi) =>
          ITEMS.map((t, i) => (
            <span key={`${gi}-${i}`} style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.16em", display: "flex", alignItems: "center", gap: 32 }}>
              {t}
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", display: "inline-block", opacity: .7 }} />
            </span>
          ))
        )}
      </div>
    </div>
  );
}
