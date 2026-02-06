
import { Auth } from '../core/Auth.js';
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';

export class LoginView {
    constructor(container) {
        this.container = container;
        this.state = 'IDENTIFY'; // IDENTIFY -> SETUP_SECRET -> VERIFY_SECRET
        this.tempUser = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="login-wrapper">
                <div class="moe-card" style="width: 100%; max-width: 450px; text-align: center;">
                    <div style="margin-bottom: 2rem; display:flex; justify-content:center;">
                        ${BRAND.logoSvg.replace('width="50"', 'width="100"').replace('height="50"', 'height="100"')}
                    </div>

                    <h2 style="color:var(--moe-green); font-weight:bold; margin-bottom:0.5rem;">${BRAND.nameAr}</h2>
                    <p style="color:#666; font-size:0.9rem; margin-bottom:2rem;">بوابة الطالبة الموحدة</p>

                    <form id="loginForm">
                        ${this.renderCurrentState()}

                        <div id="security-log" style="text-align:right; font-size:0.8rem; color:var(--moe-green); margin-bottom:1rem; min-height:20px;"></div>

                        <button type="submit" class="btn-moe" style="width:100%">${this.getButtonText()}</button>
                        ${this.state !== 'IDENTIFY' ? '<button type="button" id="backBtn" class="btn-outline" style="width:100%; margin-top:10px;">العودة</button>' : ''}
                    </form>

                    <div style="margin-top:2rem; border-top:1px solid #eee; padding-top:1rem; font-size:0.8rem; color:#999;">
                        <span class="security-badge">2FA Secured</span>
                        <p style="margin-top:5px">${BRAND.copyright}</p>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderCurrentState() {
        if (this.state === 'IDENTIFY') {
            return `
                <div class="input-group">
                    <label>اسم الطالبة</label>
                    <input type="text" id="fullName" required placeholder="الاسم الأول والثاني والعائلة (مثال: أروى فهد العازمي)" autocomplete="off">
                </div>
                <div style="display:flex; gap:10px;">
                    <div class="input-group" style="flex:1">
                        <label>الصف الدراسي</label>
                        <select id="grade" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                            <option value="10">أول ثانوي (10)</option>
                            <option value="11">ثاني ثانوي (11)</option>
                            <option value="12">ثالث ثانوي (12)</option>
                        </select>
                    </div>
                    <div class="input-group" id="sectionGroup" style="flex:1; display:none;">
                        <label>الشعبة</label>
                        <select id="section" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                            <option value="A">أ (A)</option>
                            <option value="B">ب (B)</option>
                        </select>
                    </div>
                </div>
                <!-- Teacher Login Toggle Link -->
                <div style="text-align:right; margin-bottom:1rem;">
                    <a href="#" id="teacherLoginToggle" style="color:var(--moe-gold); font-size:0.8rem;">تسجيل دخول المعلمة؟</a>
                </div>
            `;
        } else if (this.state === 'TEACHER') {
            return `
                 <div class="input-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="email" required placeholder="sabreen@academy.com" dir="ltr">
                </div>
                <div class="input-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="password" required>
                </div>
            `;
        } else if (this.state === 'SETUP_SECRET') {
            return `
                <div style="background:#e8f5e9; color:#2e7d32; padding:10px; border-radius:4px; margin-bottom:15px; font-size:0.9rem;">
                    <strong>مرحباً ${this.tempUser.name}!</strong><br>
                    هذا هو دخولك الأول. لحماية حسابك، يرجى تعيين سؤال أمان سري لا يعرف إجابته غيرك.
                </div>
                <div class="input-group">
                    <label>سؤال سري (مثال: ما هو اسم جدتك؟)</label>
                    <input type="text" id="secretQuestion" required placeholder="اكتبي سؤالاً تعرفين إجابته..." autocomplete="off">
                </div>
                <div class="input-group">
                    <label>الإجابة السرية</label>
                    <input type="text" id="secretAnswer" required placeholder="اكتبي الإجابة هنا..." autocomplete="off">
                </div>
            `;
        } else if (this.state === 'VERIFY_SECRET') {
            const authData = Auth.getAuthStatus(this.tempUser.id);
            return `
                <div style="background:#fff3cd; color:#856404; padding:10px; border-radius:4px; margin-bottom:15px; font-size:0.9rem;">
                    <strong>سؤال الأمان:</strong> ${authData.secretQuestion}
                </div>
                <div class="input-group">
                    <label>إجابتك السرية</label>
                    <input type="text" id="secretAnswerInput" required placeholder="أدخلي الإجابة..." autocomplete="off">
                </div>
            `;
        }
    }

    getButtonText() {
        if (this.state === 'IDENTIFY') return 'متابعة';
        if (this.state === 'TEACHER') return 'دخول';
        if (this.state === 'SETUP_SECRET') return 'حفظ ومتابعة';
        if (this.state === 'VERIFY_SECRET') return 'تحقق ودخول';
    }

    attachEvents() {
        const form = document.getElementById('loginForm');
        const log = document.getElementById('security-log');

        // Toggle Teacher Login
        const teacherToggle = document.getElementById('teacherLoginToggle');
        if (teacherToggle) {
            teacherToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.state = 'TEACHER';
                this.render();
            });
        }

        // Back Button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.state = 'IDENTIFY';
                this.tempUser = null;
                this.render();
            });
        }

        // Grade Logic (Hide/Show Section)
        const gradeSelect = document.getElementById('grade');
        const sectionGroup = document.getElementById('sectionGroup');
        if (gradeSelect && sectionGroup) {
            gradeSelect.addEventListener('change', () => {
                if (gradeSelect.value === '10') {
                    sectionGroup.style.display = 'none';
                } else {
                    sectionGroup.style.display = 'block';
                }
            });
            // Init
            if (gradeSelect.value === '10') sectionGroup.style.display = 'none';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;

            try {
                if (this.state === 'TEACHER') {
                    // Legacy Teacher Login
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;

                    if (email === DATA_STORE.TEACHER.email && password === DATA_STORE.TEACHER.password) {
                        appStore.setUser(DATA_STORE.TEACHER);
                        Router.navigate('home');
                    } else {
                        throw new Error("بيانات المعلم غير صحيحة");
                    }

                } else if (this.state === 'IDENTIFY') {
                    // Step 1: Find Student
                    const name = document.getElementById('fullName').value.trim();
                    const grade = document.getElementById('grade').value;
                    const section = document.getElementById('section').value;

                    log.textContent = "> جاري البحث في السجلات...";
                    await new Promise(r => setTimeout(r, 600));

                    const student = Auth.findStudentInRoster(name, grade, section);

                    if (student) {
                        this.tempUser = student;
                        const authData = Auth.getAuthStatus(student.id);

                        if (authData) {
                            // Already registered -> Verify Secret
                            this.state = 'VERIFY_SECRET';
                        } else {
                            // First time -> Setup Secret
                            this.state = 'SETUP_SECRET';
                        }
                        this.render();
                    } else {
                        throw new Error("لم يتم العثور على الطالبة في الكشف.");
                    }

                } else if (this.state === 'SETUP_SECRET') {
                    // Step 2: Bind Secret
                    const q = document.getElementById('secretQuestion').value.trim();
                    const a = document.getElementById('secretAnswer').value.trim();

                    if (q.length < 3 || a.length < 2) throw new Error("يرجى إدخال سؤال وإجابة صحيحة");

                    log.textContent = "> جاري حفظ البيانات الآمنة...";
                    await new Promise(r => setTimeout(r, 800));

                    Auth.bindSecret(this.tempUser.id, q, a);

                    // Auto-login after setup
                    appStore.setUser(this.tempUser);
                    setTimeout(() => Router.navigate('home'), 500);

                } else if (this.state === 'VERIFY_SECRET') {
                    // Step 3: Verify Answer
                    const answer = document.getElementById('secretAnswerInput').value.trim();
                    log.textContent = "> جاري التحقق من الهوية...";
                    await new Promise(r => setTimeout(r, 600));

                    if (Auth.verifySecret(this.tempUser.id, answer)) {
                        log.style.color = 'var(--moe-green)';
                        log.textContent = "> تم التحقق بنجاح.";

                        // Hydrate XP from Persistence (Fixing Previous Logic)
                        this.tempUser.xp = Auth.getXP(this.tempUser.id);

                        appStore.setUser(this.tempUser);
                        setTimeout(() => Router.navigate('home'), 500);
                    } else {
                        throw new Error("الرمز غير صحيح.");
                    }
                }
            } catch (err) {
                log.style.color = 'var(--danger)';
                log.textContent = `> ${err.message}`;
                btn.disabled = false;
            }
        });
    }

}
