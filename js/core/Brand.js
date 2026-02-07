
/**
 * Brand Assets for Sabreen Math Academy
 * Vision 2030 Edition.
 */

export const BRAND = {
    nameAr: "أكاديمية صابرين للرياضيات",
    nameEn: "Sabreen Math Academy",
    copyright: "© 2025 أكاديمية صابرين. فخر الصناعة السعودية.",

    // Concept: Abstract Kufic Monogram "Sad" (ص) + Infinity Loop + Palm Leaf
    // Colors: Vision Emerald (#006C35) & Desert Gold (#C6A664)

    logoSvg: `
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="visionGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#C6A664"/>
                    <stop offset="1" stop-color="#DFC075"/>
                </linearGradient>
            </defs>

            <!-- Outer Geometric Shield -->
            <path d="M50 5 L95 30 V70 L50 95 L5 70 V30 Z" fill="#006C35" stroke="url(#visionGrad)" stroke-width="2"/>

            <!-- Inner "S" / Infinity / Kufic Motif -->
            <path d="M35 35 H65 M35 35 V50 H65 V65 H35" stroke="white" stroke-width="6" stroke-linecap="round"/>
            <circle cx="65" cy="35" r="4" fill="#C6A664"/>
            <circle cx="35" cy="65" r="4" fill="#C6A664"/>

            <!-- Mathematical Integral Accent -->
            <path d="M50 20 V80" stroke="url(#visionGrad)" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
        </svg>
    `,

    logoHorizontal: `
        <div style="display:flex; align-items:center; gap:12px;">
            <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L95 30 V70 L50 95 L5 70 V30 Z" fill="#006C35"/>
                <path d="M35 35 H65 M35 35 V50 H65 V65 H35" stroke="white" stroke-width="6" stroke-linecap="round"/>
            </svg>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
                <span style="font-weight:800; font-size:1.3rem; color:var(--vision-emerald); font-family:'Cairo', sans-serif;">أكاديمية صابرين</span>
                <span style="font-size:0.75rem; color:var(--vision-gold); letter-spacing:1px; font-weight:600;">بوابتك نحو المستقبل</span>
            </div>
        </div>
    `
};
