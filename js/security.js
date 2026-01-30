// Mock Security Layer (Obfuscation & Hashing)
// NOTE: This is client-side only and for simulation purposes.

class SecureAcademy {
    // Simple Base64 encoding for "encryption"
    static encrypt(data) {
        try {
            return btoa(JSON.stringify(data));
        } catch (e) {
            console.error("Encryption Error", e);
            return null;
        }
    }

    static decrypt(data) {
        try {
            return JSON.parse(atob(data));
        } catch (e) {
            console.error("Decryption Error", e);
            return null;
        }
    }

    // Simple Hash for Password (e.g., DJB2 variant or similar simple hash for mock)
    static hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
}

window.SecureAcademy = SecureAcademy;
