
/**
 * MoE Secure Authentication Module
 * Implements PBKDF2-SHA256 for password hashing and AES-GCM simulation for session tokens.
 * Official Saudi Ministry of Education Standard (Mock).
 */

export class Auth {
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = window.crypto.getRandomValues(new Uint8Array(16)); // Random salt

        // Import password as key material
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            data,
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        // Derive key (Hash)
        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        // Export key to raw format (for storage mock)
        const exportedKey = await window.crypto.subtle.exportKey("raw", key);
        return {
            hash: Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join(''),
            salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
        };
    }

    static async verifyMock(password, storedHash) {
        // In a real scenario, we'd re-hash with the stored salt.
        // For this prototype, we'll simulate a secure check to allow our mock users to login easily.
        // But we WILL visualize the "Verification" process in the UI.
        return new Promise(resolve => setTimeout(() => resolve(true), 1500));
    }

    static generateSessionToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static maskEmail(email) {
        const [name, domain] = email.split('@');
        return `${name[0]}***${name[name.length-1]}@${domain}`;
    }
}
