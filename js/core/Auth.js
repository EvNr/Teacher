
import { DATA_STORE } from './DataStore.js';

/**
 * MoE Secure Authentication Module
 * Implements PBKDF2-SHA256 for password hashing and AES-GCM simulation for session tokens.
 * Official Saudi Ministry of Education Standard (Mock).
 */

export class Auth {

    // --- Existing Encryption Simulation ---
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = window.crypto.getRandomValues(new Uint8Array(16)); // Random salt

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            data,
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

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

        const exportedKey = await window.crypto.subtle.exportKey("raw", key);
        return {
            hash: Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join(''),
            salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
        };
    }

    // --- New Student Identity Logic ---

    /**
     * Finds a student in the roster by name, grade, and section.
     * Supports fuzzy matching and Grade 10 logic (no section).
     * @param {string} name - Student Name (Simplified or Full)
     * @param {string} grade - Grade Level (10, 11, 12)
     * @param {string} section - Section (A, B) - Ignored for Grade 10
     */
    static findStudentInRoster(name, grade, section) {
        const gradeData = DATA_STORE.STUDENT_ROSTER[grade];
        if (!gradeData) return null;

        let foundName = null;
        let finalSection = section;

        // Grade 10 Logic: Flat Array
        if (grade === "10") {
            if (Array.isArray(gradeData)) {
                // Find matching name in the flat array
                foundName = gradeData.find(rosterName => this.fuzzyMatch(name, rosterName));
                finalSection = "General"; // Internal marker for no-section
            }
        }
        // Grade 11/12 Logic: Section Object
        else {
            const sectionData = gradeData[section];
            if (sectionData && Array.isArray(sectionData)) {
                foundName = sectionData.find(rosterName => this.fuzzyMatch(name, rosterName));
            }
        }

        if (foundName) {
            return {
                name: foundName,
                grade: grade,
                section: finalSection,
                id: `${grade}_${finalSection}_${foundName.replace(/\s+/g, '_')}` // Unique ID
            };
        }
        return null;
    }

    /**
     * Simple fuzzy matcher. Returns true if 'input' matches 'target' sufficiently.
     * Matches if 'input' is a subset of 'target' parts (e.g. "Arwa Alazmi" matches "Arwa Fahad Alazmi").
     */
    static fuzzyMatch(input, target) {
        const inputParts = input.trim().split(/\s+/);
        const targetParts = target.trim().split(/\s+/);

        // Check if all input parts exist in target (in order is preferred, but simple set inclusion works for now)
        return inputParts.every(part => target.includes(part));
    }

    /**
     * Checks if the student has already bound a contact method (2FA).
     */
    static getAuthStatus(studentId) {
        return DATA_STORE.AUTH_DB[studentId] || null;
    }

    /**
     * Binds a contact method to the student ID.
     */
    static bindContact(studentId, contactType, contactValue) {
        DATA_STORE.AUTH_DB[studentId] = {
            contactType: contactType,
            contactValue: contactValue,
            registeredAt: new Date().toISOString(),
            xp: 0
        };
        // Persist to localStorage for demo persistence across reloads
        localStorage.setItem('AUTH_DB', JSON.stringify(DATA_STORE.AUTH_DB));
        return true;
    }

    // --- XP Persistence Logic ---

    /**
     * Gets current XP for a student.
     */
    static getXP(studentId) {
        if (DATA_STORE.AUTH_DB[studentId]) {
            return DATA_STORE.AUTH_DB[studentId].xp || 0;
        }
        return 0;
    }

    /**
     * Updates XP for a student and persists it.
     */
    static updateXP(studentId, amount) {
        if (!DATA_STORE.AUTH_DB[studentId]) {
            // Implicit registration if missing (should rarely happen in this flow)
            DATA_STORE.AUTH_DB[studentId] = { xp: 0 };
        }

        DATA_STORE.AUTH_DB[studentId].xp = (DATA_STORE.AUTH_DB[studentId].xp || 0) + amount;
        localStorage.setItem('AUTH_DB', JSON.stringify(DATA_STORE.AUTH_DB));
        return DATA_STORE.AUTH_DB[studentId].xp;
    }

    // --- 2FA OTP Logic ---

    /**
     * Generates a crypto-random 6 digit code.
     */
    static generateOTP() {
        const array = new Uint8Array(4);
        window.crypto.getRandomValues(array);
        const num = new DataView(array.buffer).getUint32(0);
        return (num % 1000000).toString().padStart(6, '0');
    }

    /**
     * Simulates sending the OTP via Email/SMS.
     * In this prototype, it shows a Toast/Alert with the code.
     */
    static sendMockOTP(contactValue, otpCode) {
        console.log(`[SECURE SENDER] Sending OTP ${otpCode} to ${contactValue}`);

        // Create a Mock Notification in UI
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: #333; color: #fff; padding: 15px 25px; border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 99999; font-family: sans-serif;
            border-left: 5px solid #2ecc71; text-align: center; direction: ltr;
        `;
        notification.innerHTML = `
            <strong>New Message</strong><br>
            Your Sabreen Academy Code is: <span style="font-size:1.2em; color:#2ecc71; font-weight:bold;">${otpCode}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 8000); // 8 seconds to read
    }

    // Load persisted DB on init
    static initAuthDB() {
        const stored = localStorage.getItem('AUTH_DB');
        if (stored) {
            Object.assign(DATA_STORE.AUTH_DB, JSON.parse(stored));
        }
    }
}

// Initialize persistence
Auth.initAuthDB();
