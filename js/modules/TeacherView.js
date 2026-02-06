
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';

export class TeacherView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.render();
    }

    render() {
        const stats11A = DATA_STORE.ANALYTICS["11"].A;
        const stats11B = DATA_STORE.ANALYTICS["11"].B;

        this.container.innerHTML = `
            <nav style="background:var(--moe-dark); color:white; padding:1rem 2rem; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:bold; display:flex; align-items:center; gap:10px;">
                    ${BRAND.logoSvg.replace('width="50"', 'width="30"').replace('height="50"', 'height="30"').replace(/var\(--moe-green\)/g, 'white').replace(/var\(--moe-gold\)/g, '#f0a500')}
                    أكاديمية صابرين - مركز التحكم
                </div>
                <div>
                    أ. صابرين | <button id="logoutBtn" style="background:none; border:none; color:#f0a500; cursor:pointer; font-weight:bold;">خروج</button>
                </div>
            </nav>

            <main style="padding:2rem; max-width:1400px; margin:0 auto;">

                <div style="display:grid; grid-template-columns: 3fr 1fr; gap:2rem;">

                    <!-- Analytics Panel -->
                    <div style="display:flex; flex-direction:column; gap:2rem;">

                        <!-- Section Comparison Chart -->
                        <div class="moe-card">
                            <h3>📊 تحليل أداء الشعب الدراسية</h3>
                            <div style="margin-top:2rem; height:300px; position:relative; border-left:1px solid #ccc; border-bottom:1px solid #ccc; padding:20px;">
                                <div style="position:absolute; left:-30px; top:0;">100</div>
                                <div style="position:absolute; left:-30px; bottom:0;">0</div>

                                <div style="position:absolute; bottom:0; left:20%; width:15%; height:${stats11A.avg}%; background:var(--moe-green); transition:height 1s; display:flex; align-items:flex-end; justify-content:center; color:white; font-weight:bold; border-radius:4px 4px 0 0;">
                                    ${stats11A.avg}%
                                </div>
                                <div style="position:absolute; bottom:-30px; left:20%; width:15%; text-align:center;">11-A</div>

                                <div style="position:absolute; bottom:0; left:60%; width:15%; height:${stats11B.avg}%; background:var(--moe-gold); transition:height 1s; display:flex; align-items:flex-end; justify-content:center; color:white; font-weight:bold; border-radius:4px 4px 0 0;">
                                    ${stats11B.avg}%
                                </div>
                                <div style="position:absolute; bottom:-30px; left:60%; width:15%; text-align:center;">11-B</div>
                            </div>
                        </div>

                        <!-- Student List Table -->
                        <div class="moe-card">
                            <h3>📋 متابعة الطالبات</h3>
                            <table style="width:100%; border-collapse:collapse; margin-top:1rem;">
                                <thead>
                                    <tr style="background:#f5f5f5; color:var(--moe-dark);">
                                        <th style="padding:10px; text-align:right;">الاسم</th>
                                        <th style="padding:10px; text-align:right;">الصف/الشعبة</th>
                                        <th style="padding:10px; text-align:center;">النقاط (XP)</th>
                                        <th style="padding:10px; text-align:center;">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.getAllStudents().map(u => `
                                        <tr style="border-bottom:1px solid #eee;">
                                            <td style="padding:10px;">${u.name}</td>
                                            <td style="padding:10px;">${u.grade} - ${u.section}</td>
                                            <td style="padding:10px; text-align:center; font-weight:bold; color:var(--moe-gold);">${u.xp || 0}</td>
                                            <td style="padding:10px; text-align:center;">
                                                <span class="security-badge" style="background:${u.registered ? '#e8f5e9' : '#fff3cd'}; color:${u.registered ? '#2e7d32' : '#856404'}; border:none;">
                                                    ${u.registered ? 'مسجل' : 'غير مسجل'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    <!-- Side Panel -->
                    <div style="display:flex; flex-direction:column; gap:2rem;">
                         <div class="moe-card" style="background:linear-gradient(135deg, var(--moe-dark), var(--moe-green)); color:white;">
                            <h3 style="color:white; border-bottom-color:rgba(255,255,255,0.2);">💡 مهام الأسبوع</h3>
                            <ul style="margin-top:1rem; list-style:none; font-size:0.9rem;">
                                <li style="margin-bottom:10px; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.1);">
                                    <strong>إعداد اختبار الفصل الثالث</strong>
                                </li>
                                <li style="margin-bottom:10px;">
                                    <strong>مراجعة تقارير التحصيلي</strong>
                                </li>
                            </ul>
                         </div>

                         <div class="moe-card">
                             <h3>📥 التقارير والإحصاءات</h3>
                             <button class="btn-outline" style="width:100%; margin-bottom:10px;">تصدير كشف الدرجات (PDF)</button>
                             <button class="btn-outline" style="width:100%;">تحليل النتائج (Excel)</button>
                         </div>
                    </div>

                </div>
            </main>
        `;

        this.attachEvents();
    }

    getAllStudents() {
        const students = [];
        const roster = DATA_STORE.STUDENT_ROSTER;

        // Flatten the roster structure (Grade -> Section -> Array)
        Object.keys(roster).forEach(grade => {
            Object.keys(roster[grade]).forEach(section => {
                roster[grade][section].forEach(name => {
                    // Reconstruct ID to fetch status
                    const id = `${grade}_${section}_${name.replace(/\s+/g, '_')}`;
                    const authData = DATA_STORE.AUTH_DB[id] || {};

                    students.push({
                        name: name,
                        grade: grade,
                        section: section,
                        xp: authData.xp || 0,
                        registered: !!authData.contactValue
                    });
                });
            });
        });
        return students;
    }

    attachEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            appStore.setUser(null);
            Router.navigate('login');
        });
    }
}
