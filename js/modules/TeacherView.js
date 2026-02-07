
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';
import { ChatSystem } from '../core/ChatSystem.js';

export class TeacherView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.chat = new ChatSystem((key) => this.handleSync(key));
        this.activeTab = 'stats';
        this.render();
    }

    handleSync(key) {
        if (key === 'UPDATE' && this.activeTab === 'chat') {
            this.renderChatList();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="dashboard-layout">
                <!-- SIDEBAR -->
                <aside class="sidebar" id="sidebar">
                    <div style="margin-bottom:2rem; padding-bottom:1rem; border-bottom:1px solid rgba(0,0,0,0.05);">
                        <div style="display:flex; align-items:center; gap:10px;">
                            ${BRAND.logoSvg.replace('width="60"', 'width="40"').replace('height="60"', 'height="40"')}
                            <span style="font-family:'Cairo'; font-weight:800; color:var(--vision-emerald);">بوابة المعلم</span>
                        </div>
                    </div>

                    <nav>
                        <a class="nav-item active" data-tab="stats">
                            <span>📊</span> الإحصائيات
                        </a>
                        <a class="nav-item" data-tab="chat">
                            <span>💬</span> إدارة المحادثات
                        </a>
                        <a class="nav-item" data-tab="roster">
                            <span>👥</span> سجل الطالبات
                        </a>
                    </nav>

                    <div style="margin-top:auto; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.05);">
                        <div class="nav-item" id="logoutBtn" style="color:red;">
                            <span>🚪</span> تسجيل الخروج
                        </div>
                    </div>
                </aside>

                <!-- MAIN CONTENT -->
                <main class="main-content" id="mainContent">
                    <!-- Dynamic Content -->
                </main>
            </div>
        `;

        this.attachEvents();
        this.switchTab('stats');
    }

    attachEvents() {
        // Nav Items
        this.container.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', () => {
                this.container.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.switchTab(item.dataset.tab);
            });
        });

        // Logout
        this.container.querySelector('#logoutBtn').addEventListener('click', () => {
            appStore.setUser(null);
            Router.navigate('login');
        });
    }

    switchTab(tab) {
        this.activeTab = tab;
        const main = document.getElementById('mainContent');
        main.innerHTML = '';

        switch(tab) {
            case 'stats': this.renderStats(main); break;
            case 'chat': this.renderChatManager(main); break;
            case 'roster': this.renderRoster(main); break;
        }
    }

    // --- TAB 1: STATS ---
    renderStats(container) {
        const stats = DATA_STORE.ANALYTICS;

        container.innerHTML = `
            <h2 style="margin-bottom:2rem; color:var(--vision-emerald);">لوحة المعلومات</h2>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:2rem;">
                <div class="glass-card" style="border-right:4px solid var(--vision-emerald);">
                    <h3>إجمالي الطالبات</h3>
                    <div style="font-size:2rem; font-weight:bold; color:var(--vision-emerald);">145</div>
                </div>
                <div class="glass-card" style="border-right:4px solid var(--vision-gold);">
                    <h3>المعدل العام (12)</h3>
                    <div style="font-size:2rem; font-weight:bold; color:var(--vision-gold);">89.5%</div>
                </div>
            </div>

            <!-- Global Actions -->
            <div class="glass-card">
                <h3 style="margin-bottom:1rem;">إرسال تنبيه عام (MOTD)</h3>
                <form id="motdForm">
                    <div class="input-group">
                        <input type="text" id="motdTitle" class="input-modern" placeholder="عنوان التنبيه">
                    </div>
                    <div class="input-group">
                        <textarea id="motdMsg" class="input-modern" style="height:80px;" placeholder="نص التنبيه..."></textarea>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="checkbox" id="motdActive" checked>
                        <label>تفعيل</label>
                        <button type="submit" class="btn btn-primary" style="margin-right:auto;">تحديث</button>
                    </div>
                </form>
            </div>
        `;

        // Pre-fill
        const current = this.chat.getMOTD();
        if (current) {
            document.getElementById('motdTitle').value = current.title || '';
            document.getElementById('motdMsg').value = current.message || '';
            document.getElementById('motdActive').checked = current.active;
        }

        document.getElementById('motdForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.chat.setMOTD(
                document.getElementById('motdTitle').value,
                document.getElementById('motdMsg').value,
                document.getElementById('motdActive').checked
            );
            alert('تم تحديث التنبيه العام.');
        });
    }

    // --- TAB 2: CHAT MANAGER ---
    renderChatManager(container) {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h2>إدارة المحادثات</h2>
                <button class="btn btn-outline" id="refreshChat">تحديث</button>
            </div>
            <div class="glass-card" style="height:600px; overflow-y:auto;" id="chatList">
                <!-- Messages -->
            </div>
        `;

        this.renderChatList();
        document.getElementById('refreshChat').addEventListener('click', () => {
            this.chat.poll().then(() => this.renderChatList());
        });
    }

    renderChatList() {
        const list = document.getElementById('chatList');
        if (!list) return;

        const msgs = this.chat.getMessages();
        list.innerHTML = msgs.map((msg, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee; background:${msg.sender === 'Admin' ? '#f9f9f9' : 'white'};">
                <div>
                    <span style="font-weight:bold; color:var(--vision-emerald);">${msg.sender}</span>
                    <span style="color:#888; font-size:0.8rem; margin-right:10px;">${msg.time}</span>
                    <p style="margin-top:5px;">${msg.text}</p>
                </div>
                <button class="btn btn-outline" style="color:red; border-color:red; padding:5px 10px; font-size:0.8rem;" onclick="window.deleteMsg(${idx})">حذف</button>
            </div>
        `).join('');

        // Attach global handler for deletion (simplified for this context)
        window.deleteMsg = (idx) => {
            if (confirm('حذف هذه الرسالة؟')) {
                // In a real app, send ID. Here we mock via rewriting array
                // For this simulation, we will fetch read, slice, write back
                this.deleteMessageAtIndex(idx);
            }
        };
    }

    async deleteMessageAtIndex(index) {
        // Hacky simulation for MVP
        const res = await fetch('api/chat_read.php');
        const data = await res.json();
        data.global.splice(index, 1);

        await fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ type: 'OVERWRITE', payload: data })
        });

        this.chat.poll(); // Update UI
    }

    // --- TAB 3: ROSTER ---
    renderRoster(container) {
        container.innerHTML = `
            <h2 style="margin-bottom:1rem;">سجل الطالبات</h2>
            <div class="input-group">
                <input type="text" id="rosterSearch" class="input-modern" placeholder="بحث بالاسم...">
            </div>
            <div class="glass-card">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #eee; color:var(--vision-emerald);">
                            <th style="padding:10px; text-align:right;">الاسم</th>
                            <th style="padding:10px; text-align:right;">الصف</th>
                            <th style="padding:10px; text-align:center;">الحالة</th>
                            <th style="padding:10px; text-align:center;">XP</th>
                        </tr>
                    </thead>
                    <tbody id="rosterBody"></tbody>
                </table>
            </div>
        `;

        const renderRows = (filter = '') => {
            const tbody = document.getElementById('rosterBody');
            const all = this.getAllStudents();

            const filtered = all.filter(s => s.name.includes(filter));

            tbody.innerHTML = filtered.map(s => `
                <tr style="border-bottom:1px solid #f5f5f5;">
                    <td style="padding:10px;">${s.name}</td>
                    <td style="padding:10px;">${s.grade} ${s.section || ''}</td>
                    <td style="padding:10px; text-align:center;">
                        <span style="padding:4px 8px; border-radius:4px; font-size:0.8rem; background:${s.active ? 'rgba(0,108,53,0.1)' : '#eee'}; color:${s.active ? 'var(--vision-emerald)' : '#888'};">
                            ${s.active ? 'مفعل' : 'جديد'}
                        </span>
                    </td>
                    <td style="padding:10px; text-align:center;">${s.xp}</td>
                </tr>
            `).join('');
        };

        renderRows();
        document.getElementById('rosterSearch').addEventListener('input', (e) => renderRows(e.target.value));
    }

    getAllStudents() {
        const students = [];
        const roster = DATA_STORE.STUDENT_ROSTER;

        // Helper to check auth status
        const getStatus = (name) => {
            const rec = DATA_STORE.AUTH_DB[name];
            return { active: !!rec, xp: rec ? rec.xp : 0 };
        };

        // 10
        roster["10"].forEach(name => {
            students.push({ name, grade: "10", section: null, ...getStatus(name) });
        });

        // 11/12
        ['11', '12'].forEach(g => {
            Object.keys(roster[g]).forEach(s => {
                roster[g][s].forEach(name => {
                    students.push({ name, grade: g, section: s, ...getStatus(name) });
                });
            });
        });

        return students;
    }
}
