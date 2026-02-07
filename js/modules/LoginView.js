
import { BRAND } from '../core/Brand.js';
import { Auth } from '../core/Auth.js';

export class LoginView {
    constructor() {
        this.auth = new Auth();
        this.app = document.getElementById('app');
        this.clicks = 0; // Teacher secret
        this.tempStudent = null; // Store student data between steps
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

                        <!-- STEP 1: IDENTIFICATION -->
                        <form id="step1Form" class="auth-form">
                            <h2 style="margin-bottom:1.5rem; color:var(--vision-emerald);">تسجيل الدخول</h2>

                            <div class="input-group">
                                <input type="text" id="inputName" class="input-modern" placeholder=" " required>
                                <label class="input-label">الاسم الثلاثي</label>
                            </div>

                            <div class="input-group" style="display:flex; gap:10px;">
                                <select id="inputGrade" class="input-modern" style="flex:1;" required>
                                    <option value="" disabled selected>الصف</option>
                                    <option value="10">أول ثانوي (10)</option>
                                    <option value="11">ثاني ثانوي (11)</option>
                                    <option value="12">ثالث ثانوي (12)</option>
                                </select>
                                <select id="inputSection" class="input-modern" style="flex:1;">
                                    <option value="" disabled selected>الشعبة</option>
                                    <option value="A">أ (A)</option>
                                    <option value="B">ب (B)</option>
                                </select>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width:100%;">
                                متابعة
                            </button>

                            <div id="step1Error" style="color:red; margin-top:10px; font-size:0.9rem; text-align:center;"></div>
                        </form>

                        <!-- STEP 2A: SETUP (NEW USER) -->
                        <form id="setupForm" class="auth-form" style="display:none; animation:fadeIn 0.5s;">
                            <h2 style="margin-bottom:1rem; color:var(--vision-gold);">تفعيل الحساب</h2>
                            <p style="color:#666; font-size:0.9rem; margin-bottom:1.5rem;">
                                أهلاً بك! بما أن هذه أول زيارة لك، يرجى تعيين سؤال سري لحماية حسابك.
                            </p>

                            <div class="input-group">
                                <select id="setupQuestionSelect" class="input-modern" required>
                                    <option value="" disabled selected>اختر سؤالاً سرياً...</option>
                                    <option value="friend">ما هو اسم أعز صديقة لك؟</option>
                                    <option value="color">ما هو لونك المفضل؟</option>
                                    <option value="hobby">ما هي هوايتك المفضلة؟</option>
                                    <option value="custom">سؤال خاص...</option>
                                </select>
                            </div>

                            <div class="input-group" id="customQuestionGroup" style="display:none;">
                                <input type="text" id="setupCustomQuestion" class="input-modern" placeholder=" " >
                                <label class="input-label">اكتب سؤالك الخاص</label>
                            </div>

                            <div class="input-group">
                                <input type="text" id="setupAnswer" class="input-modern" placeholder=" " required>
                                <label class="input-label">الإجابة</label>
                            </div>

                            <button type="submit" class="btn btn-gold" style="width:100%;">
                                حفظ ودخول
                            </button>
                            <button type="button" class="btn btn-outline" id="backToStep1_A" style="width:100%; margin-top:10px;">عودة</button>
                        </form>

                        <!-- STEP 2B: CHALLENGE (EXISTING USER) -->
                        <form id="challengeForm" class="auth-form" style="display:none; animation:fadeIn 0.5s;">
                            <h2 style="margin-bottom:1rem; color:var(--vision-emerald);">أهلاً بك مجدداً</h2>

                            <div style="background:rgba(0,108,53,0.05); padding:15px; border-radius:10px; margin-bottom:1.5rem; text-align:center;">
                                <p style="font-size:0.85rem; color:#666; margin-bottom:5px;">السؤال السري:</p>
                                <h4 id="displayQuestion" style="color:var(--vision-emerald);">...</h4>
                            </div>

                            <div class="input-group">
                                <input type="text" id="challengeAnswer" class="input-modern" placeholder=" " required autocomplete="off">
                                <label class="input-label">الإجابة</label>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width:100%;">
                                تسجيل الدخول
                            </button>
                            <button type="button" class="btn btn-outline" id="backToStep1_B" style="width:100%; margin-top:10px;">عودة</button>
                            <div id="challengeError" style="color:red; margin-top:10px; font-size:0.9rem; text-align:center;"></div>
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
                            <button type="button" class="btn btn-outline" id="cancelTeacher" style="width:100%; margin-top:10px;">إلغاء</button>
                            <div id="tError" style="color:red; margin-top:5px; text-align:center;"></div>
                        </form>

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
        // Elements
        const step1Form = document.getElementById('step1Form');
        const setupForm = document.getElementById('setupForm');
        const challengeForm = document.getElementById('challengeForm');
        const teacherForm = document.getElementById('teacherForm');

        // --- Teacher Trigger ---
        const logo = document.querySelector('.logo-trigger');
        logo.addEventListener('click', () => {
            this.clicks++;
            if (this.clicks === 5) {
                [step1Form, setupForm, challengeForm].forEach(f => f.style.display = 'none');
                teacherForm.style.display = 'block';
            }
        });

        document.getElementById('cancelTeacher').addEventListener('click', () => {
            teacherForm.style.display = 'none';
            step1Form.style.display = 'block';
            this.clicks = 0;
        });

        // --- Step 1: Identification ---
        const inputGrade = document.getElementById('inputGrade');
        const inputSection = document.getElementById('inputSection');

        inputGrade.addEventListener('change', (e) => {
            if (e.target.value === '10') {
                inputSection.value = '';
                inputSection.disabled = true;
                inputSection.style.opacity = '0.5';
            } else {
                inputSection.disabled = false;
                inputSection.style.opacity = '1';
            }
        });

        step1Form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = step1Form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'جاري التحقق...';
            btn.disabled = true;

            const name = document.getElementById('inputName').value;
            const grade = document.getElementById('inputGrade').value;
            const section = document.getElementById('inputSection').value || null;

            try {
                const result = await this.auth.checkUserStatus(name, grade, section);

                if (result.status === 'NOT_FOUND' || result.status === 'ERROR') {
                    document.getElementById('step1Error').textContent = result.message;
                }
                else if (result.status === 'NEW_USER') {
                    this.tempStudent = result.student;
                    step1Form.style.display = 'none';
                    setupForm.style.display = 'block';
                }
                else if (result.status === 'EXISTING_USER') {
                    this.tempStudent = result.student;
                    // Handle stored question ID vs text
                    let qText = result.question;
                    const map = { 'friend': 'ما هو اسم أعز صديقة لك؟', 'color': 'ما هو لونك المفضل؟', 'hobby': 'ما هي هوايتك المفضلة؟' };
                    if (map[qText]) qText = map[qText];

                    document.getElementById('displayQuestion').textContent = qText;
                    step1Form.style.display = 'none';
                    challengeForm.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                document.getElementById('step1Error').textContent = 'حدث خطأ في النظام';
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // --- Step 2A: Setup ---
        const qSelect = document.getElementById('setupQuestionSelect');
        const qCustomGroup = document.getElementById('customQuestionGroup');
        const qCustomInput = document.getElementById('setupCustomQuestion');

        qSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                qCustomGroup.style.display = 'block';
                qCustomInput.required = true;
            } else {
                qCustomGroup.style.display = 'none';
                qCustomInput.required = false;
            }
        });

        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const qVal = qSelect.value;
            const question = qVal === 'custom' ? qCustomInput.value : qVal;
            const answer = document.getElementById('setupAnswer').value;

            const result = await this.auth.setupAccount(this.tempStudent, question, answer);
            if (result.success) {
                window.location.hash = '#dashboard';
            } else {
                alert(result.message);
            }
        });

        document.getElementById('backToStep1_A').addEventListener('click', () => {
            setupForm.style.display = 'none';
            step1Form.style.display = 'block';
        });

        // --- Step 2B: Challenge ---
        challengeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const answer = document.getElementById('challengeAnswer').value;

            const result = await this.auth.loginWithAnswer(this.tempStudent, answer);
            if (result.success) {
                window.location.hash = '#dashboard';
            } else {
                document.getElementById('challengeError').textContent = result.message;
            }
        });

        document.getElementById('backToStep1_B').addEventListener('click', () => {
            challengeForm.style.display = 'none';
            step1Form.style.display = 'block';
        });

        // --- Teacher Login ---
        teacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('tEmail').value;
            const pass = document.getElementById('tPass').value;

            const result = await this.auth.loginTeacher(email, pass);
            if (result.success) {
                window.location.hash = '#teacher';
            } else {
                document.getElementById('tError').textContent = 'بيانات المعلم غير صحيحة';
            }
        });
    }
}
