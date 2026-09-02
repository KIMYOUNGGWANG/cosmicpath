/**
 * Master Dossier Luxury A4 HTML Generator
 * Generates print-ready A4 Paged Media HTML for CosmicPath Master Dossier ($19.99-$29.99 High-Ticket PDF)
 */

export interface DossierUserData {
    name: string;
    birthDate: string;
    birthTime: string;
    cityName?: string;
    sunSign?: string;
    moonSign?: string;
    ascendant?: string;
    dayMaster?: string;
    dominantElement?: string;
    verdict?: string;
    decisionLabel?: string;
    timingBoundary?: string;
    copyReadyMessage?: string;
    keyRiskFactors?: string[];
    monthlyOutlook?: Array<{ month: string; status: 'GO' | 'CAUTION' | 'HOLD'; focus: string; advice: string }>;
    easternInsight?: string;
    westernInsight?: string;
    synthesisInsight?: string;
}

export function generateMasterDossierHtml(data: DossierUserData): string {
    const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const monthlyRows = (data.monthlyOutlook && data.monthlyOutlook.length > 0)
        ? data.monthlyOutlook
        : [
            { month: '2026 Q1 (Jan-Mar)', status: 'GO' as const, focus: 'Foundation & Contract Cleanup', advice: 'Establish clear boundary rules and audit partner terms.' },
            { month: '2026 Q2 (Apr-Jun)', status: 'GO' as const, focus: 'Primary Launch Window', advice: 'Sun-Jupiter transit activates optimal public reveal.' },
            { month: '2026 Q3 (Jul-Sep)', status: 'CAUTION' as const, focus: 'Capital Defense & Buffer', advice: 'Mercury retrograde; refrain from irreversible asset transfers.' },
            { month: '2026 Q4 (Oct-Dec)', status: 'HOLD' as const, focus: 'Harvest & Systemization', advice: 'Consolidate gains and prepare the 2027 life cycle pivot.' },
        ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CosmicPath Master Dossier — ${escapeXml(data.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4 portrait;
    margin: 0;
    @bottom-right {
      content: counter(page);
    }
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #e2e8f0;
    background-color: #0b0f19;
    font-size: 13px;
    line-height: 1.6;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 24mm 20mm 20mm 20mm;
    margin: 0 auto;
    background: #0b0f19;
    position: relative;
    page-break-after: always;
    overflow: hidden;
  }
  .page::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 1px solid rgba(212, 175, 55, 0.15);
    margin: 10mm;
    pointer-events: none;
  }
  .page-cover {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0b0f19 80%);
    padding: 30mm 25mm 25mm 25mm;
  }
  .gold-text {
    color: #d4af37;
  }
  .gold-gradient {
    background: linear-gradient(135deg, #fce043 0%, #fb7185 50%, #d4af37 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .serif-title {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .header-brand {
    font-size: 11px;
    letter-spacing: 0.3em;
    color: #94a3b8;
    text-transform: uppercase;
  }
  .cover-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin-top: 15px;
    margin-bottom: 10px;
  }
  .badge-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 30px;
  }
  .badge-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 8px;
    padding: 14px 18px;
  }
  .badge-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #94a3b8;
  }
  .badge-value {
    font-size: 15px;
    font-weight: 600;
    color: #f8fafc;
    margin-top: 4px;
  }
  .section-title {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    font-weight: 700;
    color: #d4af37;
    border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    padding-bottom: 6px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-title .chapter-num {
    font-size: 11px;
    color: #94a3b8;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .verdict-box {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .verdict-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .verdict-tag {
    background: #d4af37;
    color: #0b0f19;
    font-weight: 700;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .script-box {
    background: rgba(15, 23, 42, 0.8);
    border-left: 3px solid #38bdf8;
    padding: 14px 18px;
    margin: 15px 0;
    border-radius: 0 8px 8px 0;
    font-family: 'Noto Serif KR', serif;
    font-size: 13.5px;
    color: #e0f2fe;
  }
  .grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .info-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
  }
  .info-card h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #f1f5f9;
    font-weight: 600;
  }
  .timeline-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 12px;
  }
  .timeline-table th {
    text-align: left;
    padding: 8px 12px;
    background: rgba(212, 175, 55, 0.1);
    color: #d4af37;
    font-weight: 600;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }
  .timeline-table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .status-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
  }
  .status-go { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }
  .status-caution { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid #eab308; }
  .status-hold { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
  
  .page-footer {
    position: absolute;
    bottom: 12mm;
    left: 20mm;
    right: 20mm;
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #64748b;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 6px;
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page page-cover">
  <div>
    <div class="header-brand">CosmicPath Life Intelligence Dossier</div>
    <h1 class="cover-title serif-title gold-gradient">Dual-Cosmic<br>Strategic Master Plan</h1>
    <p style="color: #94a3b8; font-size: 13px; max-width: 480px; margin-top: 8px;">
      A high-precision synthesis of Eastern BaZi timing mechanics and Western Tropical Astrology psychology for actionable life decisions.
    </p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <!-- Astro/Saju Geometric SVG Wheel -->
    <svg width="220" height="220" viewBox="0 0 200 200" fill="none" style="margin: 0 auto; filter: drop-shadow(0 0 20px rgba(212,175,55,0.2));">
      <circle cx="100" cy="100" r="90" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="100" cy="100" r="75" stroke="#4f46e5" stroke-width="1" opacity="0.6"/>
      <circle cx="100" cy="100" r="60" stroke="#d4af37" stroke-width="0.8" opacity="0.4"/>
      <polygon points="100,20 169,140 31,140" stroke="#38bdf8" stroke-width="1" fill="none" opacity="0.5"/>
      <polygon points="100,180 31,60 169,60" stroke="#fb7185" stroke-width="1" fill="none" opacity="0.5"/>
      <circle cx="100" cy="100" r="10" fill="#d4af37"/>
    </svg>
  </div>

  <div>
    <div class="badge-grid">
      <div class="badge-card">
        <div class="badge-label">Principal Subject</div>
        <div class="badge-value">${escapeXml(data.name)}</div>
      </div>
      <div class="badge-card">
        <div class="badge-label">Natal Coordinates</div>
        <div class="badge-value">${escapeXml(data.birthDate)} ${escapeXml(data.birthTime)}</div>
      </div>
      <div class="badge-card">
        <div class="badge-label">Western Big 3</div>
        <div class="badge-value">☉ ${escapeXml(data.sunSign || 'Sun')} · ☽ ${escapeXml(data.moonSign || 'Moon')} · ↑ ${escapeXml(data.ascendant || 'Asc')}</div>
      </div>
      <div class="badge-card">
        <div class="badge-label">Eastern Core Pillar</div>
        <div class="badge-value">${escapeXml(data.dayMaster || 'Day Master')} (${escapeXml(data.dominantElement || 'Element')})</div>
      </div>
    </div>

    <div class="page-footer">
      <span>CosmicPath Private Intelligence · Confidential</span>
      <span>Issued: ${formattedDate}</span>
    </div>
  </div>
</div>

<!-- PAGE 2: EXECUTIVE VERDICT & ACTION SCRIPT -->
<div class="page">
  <div class="section-title">
    <span>Executive Summary & Action Protocol</span>
    <span class="chapter-num">Chapter 01</span>
  </div>

  <div class="verdict-box">
    <div class="verdict-header">
      <span class="verdict-tag">${escapeXml(data.decisionLabel || 'MOVE NOW')}</span>
      <span style="font-size: 11px; color: #94a3b8;">Optimal Timing Boundary: <strong style="color: #d4af37;">${escapeXml(data.timingBoundary || 'Next 72 Hours')}</strong></span>
    </div>
    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #f8fafc;">${escapeXml(data.verdict || 'Clear trajectory window open. Decisive execution recommended.')}</h3>
    <p style="margin: 0; color: #cbd5e1; font-size: 12.5px;">
      The convergence of your transit indicators demonstrates that delaying this choice increases administrative friction. Proceed with the calibrated protocol below.
    </p>
  </div>

  <h4 style="color: #38bdf8; font-size: 13px; margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">
    💬 Ready-to-Send Communication Script
  </h4>
  <div class="script-box">
    "${escapeXml(data.copyReadyMessage || '이 부분에 대해 지난주에 고민을 정리해보았는데, 지금 방향대로 이번 주 내에 매듭짓는 것이 서로에게 가장 깔끔할 것 같습니다. 의견 주시면 감사하겠습니다.')}"
  </div>

  <h4 style="color: #fb7185; font-size: 13px; margin: 25px 0 12px 0; text-transform: uppercase; letter-spacing: 0.1em;">
    ⚠️ Top 3 Critical Blindspots & Defenses
  </h4>
  <div class="grid-2col">
    ${(data.keyRiskFactors && data.keyRiskFactors.length > 0 ? data.keyRiskFactors : [
        'Emotional over-explanation: Keep message length under 3 sentences to avoid giving away negotiation leverage.',
        'Premature financial commitment: Secure 51% decision control or exit clause before transferring funds.',
        'Delayed boundary setting: Do not wait for mutual consensus; set a clear 48-hour response deadline.'
    ]).map((risk, idx) => `
      <div class="info-card" style="border-left: 3px solid #fb7185;">
        <h4>Risk 0${idx + 1}</h4>
        <p style="margin: 0; font-size: 12px; color: #cbd5e1;">${escapeXml(risk)}</p>
      </div>
    `).join('')}
  </div>

  <div class="page-footer">
    <span>CosmicPath Life Intelligence · Confidential</span>
    <span>Page 2 of 15</span>
  </div>
</div>

<!-- PAGE 3: DIALECTICAL SYNTHESIS & 2026 CALENDAR -->
<div class="page">
  <div class="section-title">
    <span>Dialectical Synthesis: East ✕ West Contrast</span>
    <span class="chapter-num">Chapter 02</span>
  </div>

  <div class="grid-2col">
    <div class="info-card" style="border-top: 2px solid #d4af37;">
      <h4 style="color: #d4af37;">🏛️ Eastern BaZi (Timing & Macro Flux)</h4>
      <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
        ${escapeXml(data.easternInsight || '2026년 丙午(병오) 세운은 화(Fire) 기운의 절정기입니다. 당신의 일주와 조후 균형을 검토할 때, 상반기는 시스템적 자산화와 계약 정리에 가장 유리한 국면입니다.')}
      </p>
    </div>
    <div class="info-card" style="border-top: 2px solid #38bdf8;">
      <h4 style="color: #38bdf8;">🌌 Western Astrology (Psychology & Shadow)</h4>
      <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
        ${escapeXml(data.westernInsight || 'Pluto transit in Aquarius activates your 10th/11th house axis. Inner psychological resistance stems from fear of autonomy loss. Channeling your natal Saturn discipline provides immediate stabilization.')}
      </p>
    </div>
  </div>

  <div class="section-title" style="margin-top: 30px;">
    <span>2026 Tactical Execution Matrix</span>
    <span class="chapter-num">Chapter 03</span>
  </div>

  <table class="timeline-table">
    <thead>
      <tr>
        <th style="width: 25%;">Phase / Window</th>
        <th style="width: 15%;">Directive</th>
        <th style="width: 30%;">Strategic Focus</th>
        <th style="width: 30%;">Action Protocol</th>
      </tr>
    </thead>
    <tbody>
      ${monthlyRows.map(row => `
        <tr>
          <td><strong>${escapeXml(row.month)}</strong></td>
          <td><span class="status-badge status-${row.status.toLowerCase()}">${row.status}</span></td>
          <td style="color: #f1f5f9;">${escapeXml(row.focus)}</td>
          <td style="color: #94a3b8;">${escapeXml(row.advice)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-footer">
    <span>CosmicPath Life Intelligence · Confidential</span>
    <span>Page 3 of 15</span>
  </div>
</div>

</body>
</html>`;
}

function escapeXml(str?: unknown): string {
    if (str === null || str === undefined) return '';
    const text = typeof str === 'string' ? str : (typeof str === 'object' ? JSON.stringify(str) : String(str));
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
