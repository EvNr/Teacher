
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
     * Uses robust Arabic normalization.
     */
    static fuzzyMatch(input, target) {
        const normInput = this.normalizeArabic(input);
        const normTarget = this.normalizeArabic(target);

        const inputParts = normInput.split(/\s+/);

        // Check if all input parts exist in target
        return inputParts.every(part => normTarget.includes(part));
    }

    /**
     * Normalizes Arabic text for comparison.
     * - Unifies Alif forms (أ, إ, آ -> ا)
     * - Unifies Yaa/Alif Maqsura (ي, ى -> ي)
     * - Unifies Ta Marbuta/Ha (ة, ه -> ه)
     * - Removes Tatweel (ـ)
     * - Removes Diacritics (Tashkeel)
     */
    static normalizeArabic(text) {
        if (!text) return "";
        let norm = text;

        // Remove Diacritics
        norm = norm.replace(/[\u064B-\u065F\u0670]/g, "");

        // Remove Tatweel
        norm = norm.replace(/\u0640/g, "");

        // Normalize Alif (أ, إ, آ -> ا)
        norm = norm.replace(/[أإآ]/g, "ا");

        // Normalize Yaa (ى -> ي)
        norm = norm.replace(/ى/g, "ي");

        // Normalize Ta Marbuta (ة -> ه)
        norm = norm.replace(/ة/g, "ه");

        return norm.trim();
    }

    /**
     * Checks if the student has already bound a contact method (2FA).
     */
    static getAuthStatus(studentId) {
        return DATA_STORE.AUTH_DB[studentId] || null;
    }

    /**
     * Binds a Secret Question/Answer to the student ID.
     */
    static bindSecret(studentId, question, answer) {
        DATA_STORE.AUTH_DB[studentId] = {
            secretQuestion: question,
            secretAnswer: this.normalizeArabic(answer), // Normalize for consistency
            registeredAt: new Date().toISOString(),
            xp: 0
        };
        localStorage.setItem('AUTH_DB', JSON.stringify(DATA_STORE.AUTH_DB));
        return true;
    }

    /**
     * Verifies the provided answer against the stored secret.
     */
    static verifySecret(studentId, inputAnswer) {
        const record = DATA_STORE.AUTH_DB[studentId];
        if (!record) return false;

        // Normalize input and stored answer for comparison
        return this.normalizeArabic(inputAnswer) === record.secretAnswer;
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

    // --- 2FA OTP Logic (Deprecated for Secret Q/A) ---
    // Kept for reference or future hybrid use if needed.

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
