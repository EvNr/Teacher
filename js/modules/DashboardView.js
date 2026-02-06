
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';

export class DashboardView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.render();
    }

    render() {
        const gradeData = DATA_STORE.CURRICULUM[this.user.grade] || { items: [], challenges: [] };

        this.container.innerHTML = `
            <!-- Navbar -->
            <nav style="background:white; padding:1rem 2rem; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
                ${BRAND.logoHorizontal}

                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="text-align:left;">
                        <div style="font-weight:bold;">${this.user.name}</div>
                        <div style="font-size:0.8rem; color:#666;">الصف ${this.user.grade} | شعبة ${this.user.section || 'A'}</div>
                    </div>
                    <div style="background:var(--moe-gold); color:white; padding:5px 10px; border-radius:20px; font-weight:bold;">
                        ${this.user.xp || 0} XP
                    </div>
                    <button id="logoutBtn" class="btn-outline" style="border-color:#d9534f; color:#d9534f; font-size:0.8rem;">خروج</button>
                </div>
            </nav>

            <main style="padding:2rem; max-width:1200px; margin:0 auto;">

                <section style="margin-bottom:3rem;" class="fade-in">
                    <h1 style="font-size:2rem; margin-bottom:0.5rem;">مرحباً بك في فضائك التعليمي</h1>
                    <p style="color:#666;">حيث يلتقي الشغف بالرياضيات مع الطموح</p>
                </section>

                <div class="grid-cols-2">

                    <!-- Right Column -->
                    <div style="display:flex; flex-direction:column; gap:2rem;" class="fade-in">

                        <div class="moe-card">
                            <h3 style="border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:15px;">📊 مركز التدريب (قياس)</h3>
                            <p style="font-size:0.9rem; color:#666; margin-bottom:1rem;">محاكاة متقدمة لاختبارات المركز الوطني للقياس.</p>

                            <div style="display:grid; gap:10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:4px;">
                                    <div>
                                        <strong>محاكاة القدرات العامة</strong>
                                        <div style="font-size:0.8rem; color:#888;">واجهة مطابقة للواقع | 25 دقيقة</div>
                                    </div>
                                    <button class="btn-moe start-test" data-test="qudrat">بدء المحاكاة</button>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:4px;">
                                    <div>
                                        <strong>محاكاة التحصيلي</strong>
                                        <div style="font-size:0.8rem; color:#888;">تدريب شامل | 40 دقيقة</div>
                                    </div>
                                    <button class="btn-moe start-test" data-test="tahsili">بدء المحاكاة</button>
                                </div>
                            </div>
                        </div>

                        <div class="moe-card">
                            <h3 style="border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:15px;">📚 مكتبة المصادر</h3>
                            <div style="display:grid; gap:15px;">
                                ${gradeData.items.map(item => `
                                    <div style="display:flex; gap:15px; align-items:center;">
                                        <div style="font-size:1.5rem;">${item.type === 'video' ? '🎥' : '📄'}</div>
                                        <div>
                                            <a href="${item.link}" target="_blank" style="font-weight:bold; color:var(--moe-green); text-decoration:none;">${item.title}</a>
                                            <div style="font-size:0.8rem; color:#888;">${item.featured ? '⭐ مميز' : ''}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                    </div>

                    <!-- Left Column -->
                    <div style="display:flex; flex-direction:column; gap:2rem;" class="fade-in">

                        <div class="moe-card" style="border-top-color:var(--danger);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                                <h3>🏆 تحديات الأكاديمية</h3>
                                <span class="security-badge" style="background:rgba(217, 83, 79, 0.1); color:var(--danger); border-color:var(--danger);">نشط الآن</span>
                            </div>

                            ${gradeData.challenges.map(c => `
                                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px;">
                                    <h4 style="margin-bottom:0.5rem;">${c.title}</h4>
                                    <p style="font-size:0.9rem; color:#555; margin-bottom:1rem;">${c.description}</p>
                                    <button class="btn-outline" style="width:100%">شارك الحل (+${c.xp} XP)</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="moe-card">
                            <h3>📈 مستواك الأكاديمي</h3>
                            <div style="margin-top:1rem;">
                                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
                                    <span>التقدم العام</span>
                                    <span>65%</span>
                                </div>
                                <div style="width:100%; background:#eee; height:8px; border-radius:4px;">
                                    <div style="width:65%; background:var(--moe-green); height:100%; border-radius:4px;"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        `;

        this.attachEvents();
    }

    attachEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            appStore.setUser(null);
            Router.navigate('login');
        });

        this.container.querySelectorAll('.start-test').forEach(btn => {
            btn.addEventListener('click', (e) => {
                sessionStorage.setItem('active_test', e.target.dataset.test);
                Router.navigate('exam');
            });
        });
    }
}
