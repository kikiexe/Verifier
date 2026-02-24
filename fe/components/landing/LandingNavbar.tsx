"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const S: React.CSSProperties = { textDecoration: "none" };

  return (
    <nav className={scrolled ? "nav-blur" : ""}
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        border: "1px solid transparent",
        transition: "all .6s cubic-bezier(0.16,1,0.3,1)",
      }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: scrolled ? "0 24px" : "0 32px", height: scrolled ? 52 : 64, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .6s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Logo */}
        <Link href="/" style={{ ...S, display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/icon.png" alt="Velipe" width={28} height={28} style={{ borderRadius: 6 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", fontFamily: "'DM Sans',sans-serif" }}>Velipe</span>
        </Link>

        {/* Desktop links */}
        <div className="hide-mob" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {["Features", "How it Works", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 13, fontWeight: 500, color: "var(--faint)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--faint)"}
            >{item}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hide-mob" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/verify" style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--faint)", transition: "color .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--faint)"}
          >Verify</Link>
          <Link href="/upload" className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>
            Launch App <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="show-mob" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6 }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "16px 32px 28px" }}>
          {["Features", "How it Works", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "13px 0", fontSize: 15, color: "var(--muted)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
            >{item}</a>
          ))}
          <Link href="/upload" className="btn-primary" style={{ marginTop: 20, width: "100%", justifyContent: "center" }}>
            Launch App <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </nav>
  );
}
