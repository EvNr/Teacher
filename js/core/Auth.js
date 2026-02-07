
import { DATA_STORE } from './DataStore.js';
import { appStore } from './Store.js';

/**
 * Authentication & Security Core
 * Vision 2030 Edition: Strict Verification & Encryption Simulation.
 */
export class Auth {
    constructor() {
        // Use the singleton appStore
        this.store = appStore;
    }

    /**
     * Authenticate User (Login)
     * Supports Teacher (Email/Pass) and Student (Name/Secret).
     */
    async login(identifier, secret, type = 'student') {
        await this.simulateNetworkDelay();

        // 1. Teacher Login
        if (identifier === DATA_STORE.TEACHER.email && secret === DATA_STORE.TEACHER.password) {
            const session = { ...DATA_STORE.TEACHER, lastLogin: new Date() };
            this.store.setUser(session);
            return { success: true, user: session };
        }

        // 2. Student Login
        if (type === 'student') {
            // Identifier is Name
            const student = this.findStudentInRoster(identifier);
            if (!student) return { success: false, message: 'اسم الطالب غير موجود في السجلات الرسمية.' };

            const authRecord = DATA_STORE.AUTH_DB[student.name];

            // If registered, check password
            if (authRecord) {
                if (authRecord.password === secret) {
                    const session = {
                        ...student,
                        ...authRecord, // Includes XP, progress
                        role: 'student',
                        lastLogin: new Date()
                    };
                    this.store.setUser(session);
                    return { success: true, user: session };
                } else {
                    return { success: false, message: 'كلمة المرور غير صحيحة.' };
                }
            } else {
                return { success: false, message: 'هذا الحساب غير مسجل. الرجاء إنشاء حساب جديد.' };
            }
        }

        return { success: false, message: 'بيانات الدخول غير صحيحة.' };
    }

    /**
     * Register New Student Account
     */
    async register(name, grade, section, password) {
        await this.simulateNetworkDelay();

        try {
            // 1. Verify Roster Presence
            const student = this.findStudentInRoster(name);
            if (!student) return { success: false, message: 'عذراً، اسمك غير موجود في كشوفات المدرسة.' };

            // 2. Check Grade/Section match (Security)
            if (student.grade !== grade) return { success: false, message: 'البيانات غير مطابقة للسجلات (الصف الدراسي).' };
            if (student.section && student.section !== section) return { success: false, message: 'البيانات غير مطابقة للسجلات (الشعبة).' };

            // 3. Check if already registered
            if (DATA_STORE.AUTH_DB[student.name]) {
                return { success: false, message: 'هذا الحساب مسجل مسبقاً. حاول تسجيل الدخول.' };
            }

            // 4. Create Account
            DATA_STORE.AUTH_DB[student.name] = {
                password: password, // In a real app, hash this!
                registeredAt: new Date(),
                xp: 0,
                badges: []
            };

            // Auto Login
            return this.login(name, password, 'student');
        } catch (e) {
            console.error("Registration Error:", e);
            return { success: false, message: 'حدث خطأ أثناء التسجيل. يرجى المحاولة لاحقاً.' };
        }
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

    /**
     * Advanced Arabic Fuzzy Search
     * Normalizes Alif, Teh Marbuta, Yaa to match roster names strictly but forgivingly.
     */
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
