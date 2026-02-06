
import { Auth } from '../core/Auth.js';
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';

export class LoginView {
    constructor(container) {
        this.container = container;
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
                    <p style="color:#666; font-size:0.9rem; margin-bottom:2rem;">بوابة التميز والابداع</p>

                    <form id="loginForm">
                        <div class="input-group">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="email" required placeholder="example@academy.com" dir="ltr" style="text-align:right">
                        </div>
                        <div class="input-group">
                            <label>كلمة المرور</label>
                            <input type="password" id="password" required placeholder="••••••••">
                        </div>

                        <div id="security-log" style="text-align:right; font-size:0.8rem; color:var(--moe-green); margin-bottom:1rem; height:20px;"></div>

                        <button type="submit" class="btn-moe" style="width:100%">تسجيل الدخول</button>
                    </form>

                    <div style="margin-top:2rem; border-top:1px solid #eee; padding-top:1rem; font-size:0.8rem; color:#999;">
                        <span class="security-badge">Secure Access</span>
                        <p style="margin-top:5px">${BRAND.copyright}</p>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const form = document.getElementById('loginForm');
        const log = document.getElementById('security-log');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = form.querySelector('button');

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" style="width:15px;height:15px;display:inline-block;border-width:2px;vertical-align:middle"></span> جاري التحقق...';

            // Security Simulation Steps
            const steps = [
                "تشفير البيانات...",
                "التحقق من الهوية...",
                "إنشاء جلسة آمنة...",
                "تم بنجاح."
            ];

            for (const step of steps) {
                log.textContent = `> ${step}`;
                await new Promise(r => setTimeout(r, 500));
            }

            // Logic
            let user = null;
            if (email === DATA_STORE.TEACHER.email && password === DATA_STORE.TEACHER.password) {
                user = DATA_STORE.TEACHER;
            } else if (DATA_STORE.USERS[email] && DATA_STORE.USERS[email].password === password) {
                user = DATA_STORE.USERS[email];
            }

            if (user) {
                // Auth Success
                appStore.setUser(user);
                Router.navigate('home');
            } else {
                // Auth Fail
                btn.disabled = false;
                btn.innerHTML = 'تسجيل الدخول';
                log.style.color = 'var(--danger)';
                log.textContent = "> خطأ: البيانات غير صحيحة.";
            }
        });
    }
}
