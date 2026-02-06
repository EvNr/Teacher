
import { Auth } from '../core/Auth.js';
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';

export class LoginView {
    constructor(container) {
        this.container = container;
        this.state = 'IDENTIFY';
        this.tempUser = null;
        this.secretClicks = 0;
        this.secretTimer = null;
        this.render();
    }

    render() {
        // Luxury Layout
        this.container.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(197,160,89,0.1) 0%, transparent 70%);">
                <div class="expert-card fade-in" style="width: 100%; max-width: 500px; text-align: center; border-color: var(--gilded-gold);">

                    <div id="brandLogo" style="margin-bottom: 2rem; display:flex; justify-content:center; cursor:pointer; transition: transform 0.2s;">
                        <!-- Styled Logo Placeholder for SVG -->
                        <svg width="100" height="100" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" stroke="#c5a059" stroke-width="2" fill="none" />
                           <text x="50" y="55" font-family="Tajawal" font-size="40" text-anchor="middle" fill="#c5a059" font-weight="bold">ص</text>
                        </svg>
                    </div>

                    <h2 class="font-heading text-gold" style="font-size: 2rem; margin-bottom: 0.5rem;">${BRAND.nameAr}</h2>
                    <p class="text-grey" style="margin-bottom: 2.5rem; letter-spacing: 1px;">بوابة التميز الأكاديمي</p>

                    <form id="loginForm">
                        ${this.renderCurrentState()}

                        <div id="security-log" style="text-align:right; font-size:0.8rem; color:var(--gilded-light); margin-bottom:1.5rem; min-height:20px; font-family:monospace;"></div>

                        <button type="submit" class="btn-gold" style="width:100%">${this.getButtonText()}</button>
                        ${this.state !== 'IDENTIFY' ? '<button type="button" id="backBtn" class="btn-outline-gold" style="width:100%; margin-top:15px;">العودة</button>' : ''}
                    </form>

                    <div style="margin-top:3rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.5rem; font-size:0.75rem; color:#666;">
                        <span style="border:1px solid var(--gilded-dark); padding: 3px 8px; border-radius: 4px; color: var(--gilded-dark);">SECURE 2FA</span>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderCurrentState() {
        if (this.state === 'IDENTIFY') {
            return `
                <div class="expert-input-group slide-up">
                    <label>اسم الطالبة</label>
                    <input type="text" id="fullName" class="expert-input" required placeholder="الاسم الثلاثي..." autocomplete="off">
                </div>
                <div class="slide-up" style="display:flex; gap:15px; animation-delay: 0.1s;">
                    <div class="expert-input-group" style="flex:1">
                        <label>الصف الدراسي</label>
                        <select id="grade" class="expert-input">
                            <option value="10">أول ثانوي (10)</option>
                            <option value="11">ثاني ثانوي (11)</option>
                            <option value="12">ثالث ثانوي (12)</option>
                        </select>
                    </div>
                    <div class="expert-input-group" id="sectionGroup" style="flex:1; display:none;">
                        <label>الشعبة</label>
                        <select id="section" class="expert-input">
                            <option value="A">أ (A)</option>
                            <option value="B">ب (B)</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (this.state === 'TEACHER') {
            return `
                 <div class="slide-up" style="background:rgba(197,160,89,0.1); color:var(--gilded-gold); padding:10px; border-radius:8px; margin-bottom:20px; text-align:center;">
                    بوابة الكادر التعليمي
                 </div>
                 <div class="expert-input-group slide-up">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="email" class="expert-input" required dir="ltr">
                </div>
                <div class="expert-input-group slide-up" style="animation-delay: 0.1s;">
                    <label>كلمة المرور</label>
                    <input type="password" id="password" class="expert-input" required>
                </div>
            `;
        } else if (this.state === 'SETUP_SECRET') {
            return `
                <div class="slide-up" style="color:var(--gilded-light); margin-bottom:20px; line-height:1.6;">
                    مرحباً <strong>${this.tempUser.name}</strong>. لضمان أمان حسابك، يرجى تعيين سؤال سري خاص.
                </div>
                <div class="expert-input-group slide-up">
                    <label>سؤال سري</label>
                    <input type="text" id="secretQuestion" class="expert-input" required placeholder="مثال: اسم صديقة الطفولة؟">
                </div>
                <div class="expert-input-group slide-up" style="animation-delay: 0.1s;">
                    <label>الإجابة السرية</label>
                    <input type="text" id="secretAnswer" class="expert-input" required>
                </div>
            `;
        } else if (this.state === 'VERIFY_SECRET') {
            const authData = Auth.getAuthStatus(this.tempUser.id);
            return `
                <div class="slide-up" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:20px;">
                    <small class="text-grey">سؤال الأمان:</small><br>
                    <strong class="text-white" style="font-size:1.1rem;">${authData.secretQuestion}</strong>
                </div>
                <div class="expert-input-group slide-up" style="animation-delay: 0.1s;">
                    <label>إجابتك السرية</label>
                    <input type="text" id="secretAnswerInput" class="expert-input" required>
                </div>
            `;
        }
    }

    getButtonText() {
        if (this.state === 'IDENTIFY') return 'متابعة الدخول';
        if (this.state === 'TEACHER') return 'تسجيل الدخول';
        if (this.state === 'SETUP_SECRET') return 'حفظ البيانات';
        if (this.state === 'VERIFY_SECRET') return 'تحقق ودخول';
    }

    attachEvents() {
        const form = document.getElementById('loginForm');
        const log = document.getElementById('security-log');

        const logo = document.getElementById('brandLogo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.secretClicks++;
                logo.style.transform = `scale(${1 + (this.secretClicks * 0.1)}) rotate(${this.secretClicks * 10}deg)`;
                setTimeout(() => logo.style.transform = 'scale(1) rotate(0deg)', 200);

                if (this.secretClicks >= 5) {
                    this.state = 'TEACHER';
                    this.secretClicks = 0;
                    this.render();
                }
                clearTimeout(this.secretTimer);
                this.secretTimer = setTimeout(() => { this.secretClicks = 0; }, 3000);
            });
        }

        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.state = 'IDENTIFY';
                this.tempUser = null;
                this.render();
            });
        }

        const gradeSelect = document.getElementById('grade');
        const sectionGroup = document.getElementById('sectionGroup');
        if (gradeSelect && sectionGroup) {
            gradeSelect.addEventListener('change', () => {
                sectionGroup.style.display = gradeSelect.value === '10' ? 'none' : 'block';
            });
            if (gradeSelect.value === '10') sectionGroup.style.display = 'none';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'جاري المعالجة...';
            btn.disabled = true;

            try {
                if (this.state === 'TEACHER') {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    if (email === DATA_STORE.TEACHER.email && password === DATA_STORE.TEACHER.password) {
                        appStore.setUser(DATA_STORE.TEACHER);
                        Router.navigate('home');
                    } else throw new Error("بيانات الاعتماد غير صالحة");

                } else if (this.state === 'IDENTIFY') {
                    const name = document.getElementById('fullName').value.trim();
                    const grade = document.getElementById('grade').value;
                    const section = document.getElementById('section').value;

                    log.textContent = "> Searching Roster DB...";
                    await new Promise(r => setTimeout(r, 800));

                    const student = Auth.findStudentInRoster(name, grade, section);
                    if (student) {
                        this.tempUser = student;
                        const authData = Auth.getAuthStatus(student.id);
                        this.state = authData ? 'VERIFY_SECRET' : 'SETUP_SECRET';
                        this.render();
                    } else throw new Error("لم يتم العثور على الطالبة");

                } else if (this.state === 'SETUP_SECRET') {
                    const q = document.getElementById('secretQuestion').value.trim();
                    const a = document.getElementById('secretAnswer').value.trim();
                    if (q.length < 3 || a.length < 2) throw new Error("البيانات قصيرة جداً");

                    log.textContent = "> Encrypting Secret...";
                    await new Promise(r => setTimeout(r, 800));
                    Auth.bindSecret(this.tempUser.id, q, a);
                    appStore.setUser(this.tempUser);
                    Router.navigate('home');

                } else if (this.state === 'VERIFY_SECRET') {
                    const answer = document.getElementById('secretAnswerInput').value.trim();
                    log.textContent = "> Verifying Token...";
                    await new Promise(r => setTimeout(r, 800));

                    if (Auth.verifySecret(this.tempUser.id, answer)) {
                        this.tempUser.xp = Auth.getXP(this.tempUser.id);
                        appStore.setUser(this.tempUser);
                        Router.navigate('home');
                    } else throw new Error("الإجابة غير صحيحة");
                }
            } catch (err) {
                log.style.color = 'var(--danger-ruby)';
                log.textContent = `> Error: ${err.message}`;
                btn.disabled = false;
                btn.textContent = originalText;

                // Shake Animation
                const card = this.container.querySelector('.expert-card');
                card.style.transform = 'translateX(5px)';
                setTimeout(() => card.style.transform = 'translateX(-5px)', 50);
                setTimeout(() => card.style.transform = 'translateX(0)', 100);
            }
        });
    }
}
