"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "Apa itu Velipe?", a: "Velipe adalah protokol verifikasi dokumen digital berbasis blockchain. Dokumen Anda di-hash dan dicatat secara permanen di Base L2, sehingga keasliannya bisa diverifikasi kapan saja oleh siapa saja." },
  { q: "Bagaimana cara kerjanya?", a: "Saat Anda mengunggah dokumen, browser menghitung hash SHA-256 dari file tersebut. Hash ini dicatat di smart contract di blockchain Base L2. Metadata dokumen disimpan di IPFS. Untuk verifikasi, cukup unggah ulang file yang sama sistem akan mencocokkan hash-nya." },
  { q: "Apakah dokumen saya aman?", a: "Ya. File dokumen asli tidak pernah dikirim ke server manapun. Hanya hash (sidik jari digital) yang dicatat di blockchain, dan metadata disimpan di IPFS secara terdesentralisasi. Tidak ada pihak ketiga yang bisa mengakses dokumen Anda." },
  { q: "Apa bedanya SBT dan NFT?", a: "Soulbound Token (SBT) tidak bisa ditransfer cocok untuk ijazah dan sertifikat permanen. NFT bisa ditransfer antar wallet cocok untuk dokumen yang perlu dipindahkan kepemilikannya." },
  { q: "Berapa biayanya?", a: "Biaya gas di Base L2 sangat murah, biasanya kurang dari $0.01 per transaksi. Tidak ada biaya platform tambahan dari Velipe." },
  { q: "Siapa yang bisa menjadi Verified Issuer?", a: "Institusi resmi (universitas, lembaga sertifikasi, dll.) bisa menjadi Verified Issuer melalui proses governance on-chain yang dikelola oleh admin protokol." },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: "0 32px 120px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 80, marginBottom: 56 }}>
        <div className="vtag" style={{ marginBottom: 20 }}>FAQ</div>
        <h2 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.06 }}>
          Everything you<br />wanted to know
        </h2>
      </div>

      {FAQS.map((item, i) => {
        const isOpen = openFaq === i;
        return (
          <div key={i} className="faq-row">
            <button className="faq-btn" onClick={() => setOpenFaq(isOpen ? null : i)}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>{item.q}</span>
              <div className={`faq-chevron${isOpen ? " open" : ""}`}>
                <ChevronDown size={14} style={{ color: isOpen ? "var(--bg)" : "var(--faint)" }} />
              </div>
            </button>
            <div style={{ overflow: "hidden", maxHeight: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0, transition: "all .38s cubic-bezier(.22,1,.36,1)" }}>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8, paddingBottom: 20 }}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
