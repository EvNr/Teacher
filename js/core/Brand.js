
/**
 * Brand Assets for Sabreen Math Academy
 * Professional Geometric Design.
 */

export const BRAND = {
    nameAr: "أكاديمية صابرين للرياضيات",
    nameEn: "Sabreen Math Academy",
    copyright: "© 2025 أكاديمية صابرين. جميع الحقوق محفوظة.",

    // Logo Concept: "Geometric S" - A Hexagon (Efficiency/Nature's Math) containing a stylized S formed by negative space or intersecting planes.
    // Colors: Deep Emerald Green (Growth/Wealth) & Gold (Excellence).

    logoSvg: `
        <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#dfc075;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#c6a664;stop-opacity:1" />
                </linearGradient>
            </defs>

            <!-- Hexagon Base -->
            <path d="M50 5 L93.3 25 V75 L50 95 L6.7 75 V25 Z" fill="#1b4d3e" stroke="url(#goldGrad)" stroke-width="2"/>

            <!-- Mathematical S / Infinity Abstract -->
            <!-- Top Curve -->
            <path d="M70 35 C70 35 60 25 50 25 C40 25 30 30 30 40 C30 55 70 55 70 70 C70 80 60 85 50 85 C40 85 30 75 30 75"
                  stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Math Accents: Integral-like sweep or geometric cuts -->
            <circle cx="50" cy="50" r="38" stroke="white" stroke-opacity="0.1" stroke-width="1"/>
        </svg>
    `,

    logoHorizontal: `
        <div style="display:flex; align-items:center; gap:12px;">
            <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L93.3 25 V75 L50 95 L6.7 75 V25 Z" fill="#1b4d3e" stroke="#c6a664" stroke-width="2"/>
                <path d="M70 35 C70 35 60 25 50 25 C40 25 30 30 30 40 C30 55 70 55 70 70 C70 80 60 85 50 85 C40 85 30 75 30 75"
                  stroke="#dfc075" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
                <span style="font-weight:bold; font-size:1.2rem; color:var(--moe-green); font-family:var(--font-display);">أكاديمية صابرين</span>
                <span style="font-size:0.75rem; color:#888; letter-spacing:1px;">للرياضيات المتقدمة</span>
            </div>
        </div>
    `
};
