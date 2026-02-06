
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';

export class DashboardView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.render();
    }

    render() {
        // Safe access to data
        const gradeData = DATA_STORE.CURRICULUM[this.user.grade] || { items: [], challenges: [] };

        this.container.innerHTML = `
            <!-- Navbar -->
            <nav style="background:white; padding:1rem 2rem; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; color:var(--moe-green); display:flex; align-items:center; gap:10px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Emblem_of_Saudi_Arabia.svg/256px-Emblem_of_Saudi_Arabia.svg.png" width="30">
                    أكاديمية صابرين - بوابة الطالب
                </div>
                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="text-align:left;">
                        <div style="font-weight:bold;">${this.user.name}</div>
                        <div style="font-size:0.8rem; color:#666;">${this.user.grade}th Grade | Sec ${this.user.section || 'A'}</div>
                    </div>
                    <div style="background:var(--moe-gold); color:white; padding:5px 10px; border-radius:20px; font-weight:bold;">
                        ${this.user.xp || 0} XP
                    </div>
                    <button id="logoutBtn" class="btn-outline" style="border-color:#d9534f; color:#d9534f; font-size:0.8rem;">خروج</button>
                </div>
            </nav>

            <main style="padding:2rem; max-width:1200px; margin:0 auto;">

                <!-- Welcome Section -->
                <section style="margin-bottom:3rem;" class="fade-in">
                    <h1 style="font-size:2rem; margin-bottom:0.5rem;">مرحباً بك في مسارك التعليمي</h1>
                    <p style="color:#666;">الفصل الدراسي الثاني 1447هـ</p>
                </section>

                <div class="grid-cols-2">

                    <!-- Right Column: Curriculum -->
                    <div style="display:flex; flex-direction:column; gap:2rem;" class="fade-in">

                        <!-- Standardized Tests Card -->
                        <div class="moe-card">
                            <h3 style="border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:15px;">📊 اختبارات قياس (محاكاة)</h3>
                            <p style="font-size:0.9rem; color:#666; margin-bottom:1rem;">تدرب على اختبارات القدرات والتحصيلي في بيئة تحاكي الاختبار الحقيقي.</p>

                            <div style="display:grid; gap:10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:4px;">
                                    <div>
                                        <strong>قدرات عامة (تجريبي)</strong>
                                        <div style="font-size:0.8rem; color:#888;">22 سؤال | 25 دقيقة</div>
                                    </div>
                                    <button class="btn-moe start-test" data-test="qudrat">بدء الاختبار</button>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:4px;">
                                    <div>
                                        <strong>تحصيلي (شامل)</strong>
                                        <div style="font-size:0.8rem; color:#888;">40 دقيقة</div>
                                    </div>
                                    <button class="btn-moe start-test" data-test="tahsili">بدء الاختبار</button>
                                </div>
                            </div>
                        </div>

                        <!-- Curriculum Materials -->
                        <div class="moe-card">
                            <h3 style="border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:15px;">📚 المقررات الدراسية</h3>
                            <div style="display:grid; gap:15px;">
                                ${gradeData.items.map(item => `
                                    <div style="display:flex; gap:15px; align-items:center;">
                                        <div style="font-size:1.5rem;">${item.type === 'video' ? '🎥' : '📄'}</div>
                                        <div>
                                            <a href="${item.link}" target="_blank" style="font-weight:bold; color:var(--moe-green); text-decoration:none;">${item.title}</a>
                                            <div style="font-size:0.8rem; color:#888;">${item.featured ? '⭐ موصى به' : ''}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                    </div>

                    <!-- Left Column: Challenges & Progress -->
                    <div style="display:flex; flex-direction:column; gap:2rem;" class="fade-in">

                        <!-- Daily Challenge -->
                        <div class="moe-card" style="border-top-color:var(--danger);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                                <h3>🏆 تحدي الأسبوع</h3>
                                <span class="security-badge" style="background:rgba(217, 83, 79, 0.1); color:var(--danger); border-color:var(--danger);">ينتهي خلال 4 ساعات</span>
                            </div>

                            ${gradeData.challenges.map(c => `
                                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px;">
                                    <h4 style="margin-bottom:0.5rem;">${c.title}</h4>
                                    <p style="font-size:0.9rem; color:#555; margin-bottom:1rem;">${c.description}</p>
                                    <div style="background:#f0f0f0; padding:10px; font-family:'Times New Roman'; direction:ltr; text-align:left; border-radius:4px; margin-bottom:1rem;">
                                        <em>Hint: ${c.solution.substring(0, 20)}...</em>
                                    </div>
                                    <button class="btn-outline" style="width:100%">تسليم الحل (+${c.xp} XP)</button>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Progress Mock -->
                        <div class="moe-card">
                            <h3>📈 إحصائيات الأداء</h3>
                            <div style="margin-top:1rem;">
                                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
                                    <span>إكمال المنهج</span>
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
                const testKey = e.target.dataset.test;
                // Store selected test in Store or Session
                sessionStorage.setItem('active_test', testKey);
                Router.navigate('exam');
            });
        });
    }
}
