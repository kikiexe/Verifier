export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

  :root {
    --bg: #0c0c0f;
    --surface: #131318;
    --surface2: #1a1a22;
    --border: rgba(255,255,255,0.07);
    --text: #f0ede8;
    --muted: rgba(240,237,232,0.6);
    --faint: rgba(240,237,232,0.3);
    --accent: #c8f04e;
    --accent-dim: rgba(200,240,78,0.1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* Film grain */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.3;
  }

  .font-display { font-family: 'Playfair Display', serif !important; }

  /* Keyframes */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes blink {
    0%,100% { opacity:1; }
    50%      { opacity:0.3; }
  }
  @keyframes marquee {
    from { transform:translateX(0); }
    to   { transform:translateX(-50%); }
  }
  @keyframes glowPulse {
    0%,100% { opacity:.55; }
    50%      { opacity:1; }
  }

  .afu   { animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both; }
  .afi   { animation: fadeIn 0.6s ease both; }
  .d1    { animation-delay:.1s; }
  .d2    { animation-delay:.22s; }
  .d3    { animation-delay:.36s; }
  .d4    { animation-delay:.5s; }
  .d5    { animation-delay:.65s; }

  .dot-live {
    width:7px; height:7px; border-radius:50%;
    background: var(--accent);
    animation: blink 2.2s ease-in-out infinite;
    display:inline-block;
  }

  .marquee-wrap { overflow:hidden; }
  .marquee-track {
    display:flex; gap:40px; width:max-content;
    animation: marquee 22s linear infinite;
  }

  /* Navbar */
  .nav-blur {
    background: rgba(12,12,15,0.35) !important;
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.06) !important;
    border-radius: 9999px !important;
    max-width: 720px !important;
    margin: 12px auto 0 !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: calc(100% - 32px) !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }

  /* Cards */
  .feat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 32px;
    position: relative;
    overflow: hidden;
    transition: border-color .3s, transform .3s;
  }
  .feat-card::after {
    content:'';
    position:absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity:0; transition:opacity .3s;
  }
  .feat-card:hover { border-color: rgba(200,240,78,.25); transform:translateY(-5px); }
  .feat-card:hover::after { opacity:1; }

  /* Steps */
  .step-card {
    display:flex; gap:20px; align-items:flex-start;
    padding: 28px 0;
    border-top: 1px solid var(--border);
    position:relative;
    transition: padding-left .25s;
  }
  .step-card:hover { padding-left: 6px; }
  .step-icon {
    width:44px; height:44px; border-radius:12px;
    border: 1px solid var(--border);
    background: var(--surface2);
    display:flex; align-items:center; justify-content:center;
    color:var(--accent); flex-shrink:0;
    transition: background .25s, border-color .25s;
  }
  .step-card:hover .step-icon { background:var(--accent-dim); border-color:rgba(200,240,78,.3); }

  /* FAQ */
  .faq-row { border-top:1px solid var(--border); }
  .faq-row:last-child { border-bottom:1px solid var(--border); }
  .faq-btn {
    width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:20px 0; background:none; border:none; cursor:pointer;
    text-align:left; gap:20px;
  }
  .faq-chevron {
    width:30px; height:30px; border-radius:50%; border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition: all .3s;
  }
  .faq-chevron.open { background:var(--accent); border-color:var(--accent); transform:rotate(180deg); }

  /* CTA card */
  .cta-card {
    background:var(--accent); border-radius:24px;
    padding: 72px 60px;
    display:flex; align-items:center; justify-content:space-between;
    gap:40px; flex-wrap:wrap;
    position:relative; overflow:hidden;
  }
  .cta-card::before {
    content:'';
    position:absolute; inset:0;
    background:radial-gradient(ellipse at 80% 50%, rgba(255,255,255,.15) 0%, transparent 60%);
    pointer-events:none;
  }

  /* Tag */
  .vtag {
    display:inline-flex; align-items:center; gap:7px;
    padding:5px 13px; border-radius:99px;
    border:1px solid rgba(200,240,78,.3);
    background:rgba(200,240,78,.07);
    color:var(--accent); font-size:11px; font-weight:700;
    letter-spacing:.06em; text-transform:uppercase;
  }

  /* Primary button */
  .btn-primary {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 28px; border-radius:9999px;
    background:var(--accent); color:#0c0c0f;
    font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
    text-decoration:none; border:none; cursor:pointer;
    transition: background .2s, transform .2s, box-shadow .2s;
    box-shadow: 0 0 0 rgba(200,240,78,0);
  }
  .btn-primary:hover {
    background:#d4f76a;
    box-shadow: 0 8px 32px rgba(200,240,78,.3);
    transform:translateY(-2px);
  }

  /* Ghost button */
  .btn-ghost {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 28px; border-radius:10px;
    background:transparent; color:var(--text);
    font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
    text-decoration:none;
    border:1px solid var(--border);
    cursor:pointer; transition: all .2s;
  }
  .btn-ghost:hover { border-color:rgba(255,255,255,.2); background:rgba(255,255,255,.04); }

  /* Hero glow */
  .hero-radial {
    position:absolute; width:900px; height:900px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(200,240,78,.07) 0%, transparent 65%);
    top:50%; left:50%; transform:translate(-50%,-60%);
    pointer-events:none;
    animation: glowPulse 5s ease-in-out infinite;
  }

  /* Responsive */
  @media (max-width:768px) {
    .hide-mob { display:none !important; }
    .show-mob { display:flex !important; }
    .about-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .howitworks-grid { grid-template-columns:1fr !important; }
    .hiw-sticky { position:static !important; }
    .feat-grid { grid-template-columns:1fr !important; }
    .cta-card { padding:48px 24px !important; flex-direction:column !important; align-items:flex-start !important; }
    .security-card { padding:48px 24px !important; }
    .nav-blur { max-width:calc(100% - 24px) !important; }
  }
  @media (min-width:769px) {
    .show-mob { display:none !important; }
  }
`;
