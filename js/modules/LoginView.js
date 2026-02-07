
import { BRAND } from '../core/Brand.js';
import { Auth } from '../core/Auth.js';

export class LoginView {
    constructor() {
        this.auth = new Auth();
        this.app = document.getElementById('app');
        this.clicks = 0; // Teacher secret
        this.render();
    }

    render() {
        this.app.innerHTML = `
            <div class="split-screen">
                <!-- LEFT: ART & BRANDING -->
                <div class="split-left">
                    <div style="position:relative; z-index:2; text-align:center; padding:2rem;">
                        <div class="logo-trigger" style="margin-bottom:2rem; cursor:pointer;">
                            ${BRAND.logoSvg.replace('width="60"', 'width="120"').replace('height="60"', 'height="120"')}
                        </div>
                        <h1 style="font-family:'Cairo'; font-weight:800; font-size:2.5rem; margin-bottom:1rem;">${BRAND.nameAr}</h1>
                        <p style="font-size:1.1rem; opacity:0.9; max-width:400px; margin:0 auto; line-height:1.6;">
                            منصة تعليمية ذكية تواكب تطلعات جيل الرؤية.
                            <br>نسعى لبناء عقول مفكرة، مبدعة، ومتميزة.
                        </p>
                    </div>
                </div>

                <!-- RIGHT: FORM -->
                <div class="split-right">
                    <div class="glass-card" style="width:100%; max-width:450px; border:none; box-shadow:none; background:transparent;">

                        <!-- TABS -->
                        <div style="display:flex; gap:1rem; margin-bottom:2rem; border-bottom:2px solid rgba(0,0,0,0.05); padding-bottom:10px;">
                            <button id="tabLogin" class="btn btn-outline active" style="flex:1; border:none; border-bottom:3px solid var(--vision-emerald); border-radius:0;">دخول الطالبة</button>
                            <button id="tabRegister" class="btn btn-outline" style="flex:1; border:none; border-bottom:3px solid transparent; border-radius:0; color:#888;">تسجيل جديد</button>
                        </div>

                        <!-- FORMS CONTAINER -->
                        <div id="formContainer">
                            <!-- LOGIN FORM -->
                            <form id="loginForm" class="auth-form">
                                <h2 style="margin-bottom:1.5rem; color:var(--vision-emerald);">أهلاً بك مجدداً</h2>

                                <div class="input-group">
                                    <input type="text" id="loginName" class="input-modern" placeholder=" " required>
                                    <label class="input-label">الاسم الثلاثي</label>
                                </div>

                                <div class="input-group">
                                    <input type="password" id="loginPass" class="input-modern" placeholder=" " required>
                                    <label class="input-label">كلمة المرور / الرمز السري</label>
                                </div>

                                <button type="submit" class="btn btn-primary" style="width:100%;">
                                    تسجيل الدخول
                                </button>

                                <div id="loginError" style="color:red; margin-top:10px; font-size:0.9rem; text-align:center;"></div>
                            </form>

                            <!-- REGISTER FORM (Hidden by default) -->
                            <form id="registerForm" class="auth-form" style="display:none;">
                                <h2 style="margin-bottom:1.5rem; color:var(--vision-gold-light);">إنشاء حساب جديد</h2>
                                <p style="font-size:0.85rem; color:#666; margin-bottom:1.5rem;">يرجى إدخال بياناتك المطابقة لسجلات المدرسة.</p>

                                <div class="input-group">
                                    <input type="text" id="regName" class="input-modern" placeholder=" " required>
                                    <label class="input-label">الاسم الثلاثي</label>
                                </div>

                                <div class="input-group" style="display:flex; gap:10px;">
                                    <select id="regGrade" class="input-modern" style="flex:1;" required>
                                        <option value="" disabled selected>الصف</option>
                                        <option value="10">أول ثانوي (10)</option>
                                        <option value="11">ثاني ثانوي (11)</option>
                                        <option value="12">ثالث ثانوي (12)</option>
                                    </select>
                                    <select id="regSection" class="input-modern" style="flex:1;">
                                        <option value="" disabled selected>الشعبة</option>
                                        <option value="A">أ (A)</option>
                                        <option value="B">ب (B)</option>
                                    </select>
                                </div>

                                <div class="input-group">
                                    <input type="password" id="regPass" class="input-modern" placeholder=" " required>
                                    <label class="input-label">إنشاء كلمة مرور</label>
                                </div>

                                <button type="submit" class="btn btn-gold" style="width:100%;">
                                    تفعيل الحساب
                                </button>

                                <div id="regError" style="color:red; margin-top:10px; font-size:0.9rem; text-align:center;"></div>
                            </form>

                            <!-- TEACHER LOGIN (Hidden) -->
                            <form id="teacherForm" class="auth-form" style="display:none; border:2px solid var(--vision-emerald); padding:20px; border-radius:15px; background:rgba(0,108,53,0.05);">
                                <h3 style="color:var(--vision-emerald); text-align:center; margin-bottom:1rem;">بوابة المعلم</h3>
                                <div class="input-group">
                                    <input type="email" id="tEmail" class="input-modern" placeholder="البريد الإلكتروني" required>
                                </div>
                                <div class="input-group">
                                    <input type="password" id="tPass" class="input-modern" placeholder="كلمة المرور" required>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:100%;">دخول المعلم</button>
                                <div id="tError" style="color:red; margin-top:5px; text-align:center;"></div>
                            </form>
                        </div>

                        <div style="margin-top:2rem; text-align:center; font-size:0.8rem; color:#aaa;">
                            ${BRAND.copyright}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const logo = document.querySelector('.logo-trigger');
        const teacherForm = document.getElementById('teacherForm');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        // Teacher Secret Trigger
        logo.addEventListener('click', () => {
            this.clicks++;
            if (this.clicks === 5) {
                loginForm.style.display = 'none';
                registerForm.style.display = 'none';
                teacherForm.style.display = 'block';
                // Reset tabs
                document.getElementById('tabLogin').classList.remove('active', 'btn-outline');
                document.getElementById('tabRegister').classList.remove('active');
            }
        });

        // Tabs
        const tabLogin = document.getElementById('tabLogin');
        const tabRegister = document.getElementById('tabRegister');

        tabLogin.addEventListener('click', () => {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            teacherForm.style.display = 'none';

            tabLogin.style.borderBottomColor = 'var(--vision-emerald)';
            tabLogin.style.color = 'var(--vision-emerald)';
            tabRegister.style.borderBottomColor = 'transparent';
            tabRegister.style.color = '#888';
        });

        tabRegister.addEventListener('click', () => {
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
            teacherForm.style.display = 'none';

            tabRegister.style.borderBottomColor = 'var(--vision-gold)';
            tabRegister.style.color = 'var(--vision-gold)';
            tabLogin.style.borderBottomColor = 'transparent';
            tabLogin.style.color = '#888';
        });

        // Grade 10 Logic (Disable Section)
        const regGrade = document.getElementById('regGrade');
        const regSection = document.getElementById('regSection');
        regGrade.addEventListener('change', (e) => {
            if (e.target.value === '10') {
                regSection.value = '';
                regSection.disabled = true;
                regSection.style.opacity = '0.5';
            } else {
                regSection.disabled = false;
                regSection.style.opacity = '1';
            }
        });

        // Submit Login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.textContent = 'جاري التحقق...';
                btn.disabled = true;

                const name = document.getElementById('loginName').value;
                const pass = document.getElementById('loginPass').value;

                const result = await this.auth.login(name, pass, 'student');

                if (result.success) {
                    window.location.hash = '#dashboard';
                } else {
                    document.getElementById('loginError').textContent = result.message;
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Login Error:", error);
                document.getElementById('loginError').textContent = 'حدث خطأ غير متوقع';
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // Submit Register
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.textContent = 'جاري الإنشاء...';
                btn.disabled = true;

                const name = document.getElementById('regName').value;
                const grade = document.getElementById('regGrade').value;
                const section = document.getElementById('regSection').value || null; // Grade 10 is null
                const pass = document.getElementById('regPass').value;

                const result = await this.auth.register(name, grade, section, pass);

                if (result.success) {
                    // Should auto login
                    window.location.hash = '#dashboard';
                } else {
                    document.getElementById('regError').textContent = result.message;
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Register Error:", error);
                document.getElementById('regError').textContent = 'حدث خطأ أثناء التسجيل';
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // Teacher Login
        teacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('tEmail').value;
            const pass = document.getElementById('tPass').value;

            try {
                const result = await this.auth.login(email, pass, 'teacher');
                if (result.success) {
                    window.location.hash = '#teacher';
                } else {
                    document.getElementById('tError').textContent = 'بيانات المعلم غير صحيحة';
                }
            } catch (error) {
                console.error("Teacher Login Error:", error);
                document.getElementById('tError').textContent = 'خطأ في النظام';
            }
        });
    }
}
