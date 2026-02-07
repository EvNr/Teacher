
import { DATA_STORE } from './DataStore.js';
import { appStore } from './Store.js';

/**
 * Authentication & Security Core
 * Vision 2030 Edition: Strict Verification & Encryption Simulation.
 */
export class Auth {
    constructor() {
        this.store = appStore;
    }

    /**
     * Step 1: Check User Status (Uses API now)
     */
    async checkUserStatus(name, grade, section) {
        await this.simulateNetworkDelay();

        // 1. Roster Check (Client-side fast fail)
        const student = this.findStudentInRoster(name);
        if (!student) return { status: 'NOT_FOUND', message: 'عذراً، اسمك غير موجود في كشوفات المدرسة.' };

        // 2. Data Validation
        if (student.grade !== grade) return { status: 'ERROR', message: 'البيانات غير مطابقة للسجلات (الصف الدراسي).' };
        if (student.section && student.section !== section) return { status: 'ERROR', message: 'البيانات غير مطابقة للسجلات (الشعبة).' };

        // 3. API Check
        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'CHECK', username: student.name })
            });
            const data = await res.json();

            if (data.status === 'EXISTING_USER') {
                return {
                    status: 'EXISTING_USER',
                    question: data.question,
                    student: student
                };
            } else {
                return {
                    status: 'NEW_USER',
                    student: student
                };
            }
        } catch (e) {
            console.error(e);
            return { status: 'ERROR', message: 'تعذر الاتصال بالخادم.' };
        }
    }

    /**
     * Step 2a: Setup New Account (API)
     */
    async setupAccount(student, question, answer) {
        await this.simulateNetworkDelay();

        const normalizedAnswer = this.normalizeAnswer(answer);

        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    action: 'REGISTER',
                    username: student.name,
                    question: question,
                    answer: normalizedAnswer
                })
            });
            const data = await res.json();

            if (data.success) {
                // Initial session setup
                const session = {
                    ...student,
                    role: 'student',
                    xp: 0,
                    lastLogin: new Date()
                };
                this.store.setUser(session);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'فشل التسجيل.' };
            }
        } catch (e) {
            return { success: false, message: 'خطأ في الاتصال.' };
        }
    }

    /**
     * Step 2b: Login Existing User (API)
     */
    async loginWithAnswer(student, answer) {
        await this.simulateNetworkDelay();

        const normalizedAnswer = this.normalizeAnswer(answer);

        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    action: 'LOGIN',
                    username: student.name,
                    answer: normalizedAnswer
                })
            });
            const data = await res.json();

            if (data.success) {
                const userData = data.user_data || {};
                const session = {
                    ...student,
                    role: 'student',
                    xp: userData.xp || 0,
                    lastLogin: new Date()
                };
                this.store.setUser(session);
                return { success: true };
            } else {
                return { success: false, message: 'إجابة السؤال السري غير صحيحة.' };
            }
        } catch (e) {
            return { success: false, message: 'خطأ في الاتصال.' };
        }
    }

    /**
     * Teacher Login (Client-Side Check still, but could move to API later)
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

    logout() {
        this.store.setUser(null);
        window.location.hash = '#login';
    }

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
            .replace(/[\u064B-\u065F]/g, '');

        const target = normalize(inputName);
        let found = null;

        if (DATA_STORE.STUDENT_ROSTER["10"]) {
            DATA_STORE.STUDENT_ROSTER["10"].forEach(name => {
                if (normalize(name) === target) found = { name, grade: "10", section: null };
            });
        }
        if (found) return found;

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
        return new Promise(resolve => setTimeout(resolve, 800));
    }
}
