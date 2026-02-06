
/**
 * Brand Assets for Sabreen Math Academy
 * Contains SVG Logos and shared branding constants.
 */

export const BRAND = {
    nameAr: "أكاديمية صابرين للرياضيات",
    nameEn: "Sabreen Math Academy",
    copyright: "© 2025 أكاديمية صابرين. جميع الحقوق محفوظة.",

    // SVG Logo: Stylized 'Sad' (ص) letter intertwined with an Infinity symbol (∞)
    logoSvg: `
        <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background Shape (Optional) -->
            <circle cx="50" cy="50" r="48" fill="var(--moe-green)" fill-opacity="0.1" stroke="var(--moe-green)" stroke-width="2"/>

            <!-- The 'Sad' (ص) Curve flowing into Infinity -->
            <path d="M75 40C75 30 65 25 55 25C40 25 30 40 30 50C30 60 40 75 55 75H80" stroke="var(--moe-green)" stroke-width="6" stroke-linecap="round"/>
            <path d="M55 25C45 25 25 35 25 50C25 65 45 75 55 75" stroke="var(--moe-gold)" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>

            <!-- Math Symbols Accents -->
            <path d="M35 45L45 45M40 40L40 50" stroke="var(--moe-gold)" stroke-width="3" /> <!-- Plus -->
            <circle cx="70" cy="35" r="3" fill="var(--moe-gold)" /> <!-- Dot -->
        </svg>
    `,

    // Logo with Text (Horizontal)
    logoHorizontal: `
        <div style="display:flex; align-items:center; gap:12px;">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" fill="white" stroke="var(--moe-green)" stroke-width="2"/>
                <path d="M75 40C75 30 65 25 55 25C40 25 30 40 30 50C30 60 40 75 55 75H80" stroke="var(--moe-green)" stroke-width="6" stroke-linecap="round"/>
                <path d="M55 25C45 25 25 35 25 50C25 65 45 75 55 75" stroke="var(--moe-gold)" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>
                <path d="M35 45L45 45M40 40L40 50" stroke="var(--moe-gold)" stroke-width="3" />
            </svg>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
                <span style="font-weight:bold; font-size:1.1rem; color:var(--moe-green);">أكاديمية صابرين</span>
                <span style="font-size:0.75rem; color:var(--moe-gold); letter-spacing:1px;">للتميز الرياضي</span>
            </div>
        </div>
    `
};
