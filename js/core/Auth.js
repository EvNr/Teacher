
import { DATA_STORE } from './DataStore.js';
import { appStore } from './Store.js';

/**
 * Authentication & Security Core
 * Vision 2030 Edition: Strict Verification & Encryption Simulation.
 */
export class Auth {
    constructor() {
        this.store = appStore;
        this.loadAuthDB();
    }

    loadAuthDB() {
        const stored = localStorage.getItem('vision_auth_db');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge with existing logic if needed, or just overwrite
                DATA_STORE.AUTH_DB = { ...DATA_STORE.AUTH_DB, ...parsed };
            } catch (e) {
                console.error("Auth Load Error", e);
            }
        }
    }

    saveAuthDB() {
        localStorage.setItem('vision_auth_db', JSON.stringify(DATA_STORE.AUTH_DB));
    }

    /**
     * Step 1: Check User Status
     * Returns:
     * - 'TEACHER': If credentials match teacher (Handled in LoginView separately)
     * - 'NEW_USER': Student exists in roster but has no auth record.
     * - 'EXISTING_USER': Student has an auth record (Secret Question set).
     * - 'NOT_FOUND': Student not in roster.
     * - 'ERROR': Mismatched Grade/Section.
     */
    async checkUserStatus(name, grade, section) {
        await this.simulateNetworkDelay();

        // Find in Roster
        const student = this.findStudentInRoster(name);
        if (!student) return { status: 'NOT_FOUND', message: 'عذراً، اسمك غير موجود في كشوفات المدرسة.' };

        // Verify Grade/Section
        if (student.grade !== grade) return { status: 'ERROR', message: 'البيانات غير مطابقة للسجلات (الصف الدراسي).' };
        if (student.section && student.section !== section) return { status: 'ERROR', message: 'البيانات غير مطابقة للسجلات (الشعبة).' };

        // Check Auth DB
        const authRecord = DATA_STORE.AUTH_DB[student.name];
        if (authRecord) {
            return {
                status: 'EXISTING_USER',
                question: authRecord.secretQuestion,
                student: student
            };
        } else {
            return {
                status: 'NEW_USER',
                student: student
            };
        }
    }

    /**
     * Step 2a: Setup New Account (Secret Question)
     */
    async setupAccount(student, question, answer) {
        await this.simulateNetworkDelay();

        // Double check existence to prevent race conditions (simulated)
        if (DATA_STORE.AUTH_DB[student.name]) {
            return { success: false, message: 'تم تسجيل هذا الحساب مسبقاً.' };
        }

        DATA_STORE.AUTH_DB[student.name] = {
            secretQuestion: question,
            secretAnswer: this.normalizeAnswer(answer),
            registeredAt: new Date(),
            xp: 0,
            badges: []
        };
        this.saveAuthDB();

        return this.createSession(student);
    }

    /**
     * Step 2b: Login Existing User (Verify Answer)
     */
    async loginWithAnswer(student, answer) {
        await this.simulateNetworkDelay();

        const authRecord = DATA_STORE.AUTH_DB[student.name];
        if (!authRecord) return { success: false, message: 'حدث خطأ. الحساب غير موجود.' };

        if (this.normalizeAnswer(answer) === authRecord.secretAnswer) {
            return this.createSession(student);
        } else {
            return { success: false, message: 'إجابة السؤال السري غير صحيحة.' };
        }
    }

    /**
     * Teacher Login
     */
    async loginTeacher(email, password) {
        await this.simulateNetworkDelay();
        if (email === DATA_STORE.TEACHER.email && password === DATA_STORE.TEACHER.password) {
            const session = { ...DATA_STORE.TEACHER, lastLogin: new Date() };
            this.store.setUser(session);
            return { success: true };
        }
        return { success: false, message: 'بيانات المعلم غير صحيحة.' };
    }

    /**
     * Create Session Helper
     */
    createSession(student) {
        const authRecord = DATA_STORE.AUTH_DB[student.name];
        const session = {
            ...student,
            ...authRecord, // Includes XP, progress
            role: 'student',
            lastLogin: new Date()
        };
        this.store.setUser(session);
        return { success: true, user: session };
    }

    /**
     * Logout
     */
    logout() {
        this.store.setUser(null);
        window.location.hash = '#login';
    }

    /**
     * Check Session
     */
    checkSession() {
        return this.store.state.user;
    }

    // --- Helpers ---

    normalizeAnswer(str) {
        return str.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    findStudentInRoster(inputName) {
        if (!inputName) return null;

        const normalize = (str) => str.trim()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة$/g, 'ه')
            .replace(/ى$/g, 'ي')
            .replace(/[\u064B-\u065F]/g, ''); // Remove Tashkeel

        const target = normalize(inputName);
        let found = null;

        // Grade 10 (Array)
        if (DATA_STORE.STUDENT_ROSTER["10"]) {
            DATA_STORE.STUDENT_ROSTER["10"].forEach(name => {
                if (normalize(name) === target) found = { name, grade: "10", section: null };
            });
        }
        if (found) return found;

        // Grade 11/12 (Objects)
        ['11', '12'].forEach(grade => {
            if (DATA_STORE.STUDENT_ROSTER[grade]) {
                Object.entries(DATA_STORE.STUDENT_ROSTER[grade]).forEach(([section, list]) => {
                    list.forEach(name => {
                        if (normalize(name) === target) found = { name, grade, section };
                    });
                });
            }
        });

        return found;
    }

    simulateNetworkDelay() {
        return new Promise(resolve => setTimeout(resolve, 800)); // 800ms "Processing" feel
    }
}
