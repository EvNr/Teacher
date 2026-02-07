
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';
import { ChatSystem } from '../core/ChatSystem.js';

export class TeacherView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.chat = new ChatSystem((key, data) => this.handleSync(key, data));
        this.activeTab = 'stats';
        this.render();
    }

    handleSync(key, data) {
        if (key === 'NEW_ALERT') {
            const dot = document.getElementById('bellDot');
            if (dot) dot.style.display = 'block';
        }
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
                    <!-- Header with Bell -->
                    <div style="display:flex; justify-content:flex-end; padding-bottom:1rem; align-items:center; gap:15px;">
                         <div id="bellIcon" style="position:relative; cursor:pointer; font-size:1.4rem;">
                            🔔
                            <span id="bellDot" style="display:none; position:absolute; top:0; right:0; width:10px; height:10px; background:red; border-radius:50%;"></span>
                         </div>
                         <div style="font-weight:bold; color:var(--vision-emerald);">${this.user.name}</div>
                    </div>
                    <div id="tabContent"></div>
                </main>
            </div>

            <!-- Notifications Modal -->
            <div id="notifModal" style="display:none; position:absolute; top:60px; left:20px; width:300px; background:white; box-shadow:0 5px 20px rgba(0,0,0,0.1); border-radius:10px; z-index:100; padding:15px;">
                <h4 style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">التنبيهات</h4>
                <div id="notifList" style="max-height:200px; overflow-y:auto; font-size:0.9rem;"></div>
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

        // Bell
        const bell = document.getElementById('bellIcon');
        const modal = document.getElementById('notifModal');
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            const alerts = this.chat.getRecentAlerts();
            const list = document.getElementById('notifList');

            if (alerts.length === 0) {
                list.innerHTML = '<div style="padding:10px; text-align:center; color:#999;">لا توجد تنبيهات</div>';
            } else {
                list.innerHTML = alerts.map(a => `
                    <div style="padding:10px; border-bottom:1px solid #f5f5f5;">
                        <div style="font-weight:bold; color:var(--vision-emerald);">${a.title}</div>
                        <div>${a.message}</div>
                        <div style="font-size:0.7rem; color:#aaa; margin-top:2px;">${new Date(a.date).toLocaleTimeString('ar-SA')}</div>
                    </div>
                `).join('');
            }

            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
            document.getElementById('bellDot').style.display = 'none'; // Clear dot
        });

        document.addEventListener('click', (e) => {
            if (!modal.contains(e.target) && e.target !== bell) {
                modal.style.display = 'none';
            }
        });
    }

    switchTab(tab) {
        this.activeTab = tab;
        const main = document.getElementById('tabContent');
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
                <h3 style="margin-bottom:1rem;">إرسال تنبيه عاجل (Pop-up)</h3>
                <form id="alertForm">
                    <div class="input-group">
                        <input type="text" id="alertTitle" class="input-modern" placeholder="عنوان التنبيه" required>
                    </div>
                    <div class="input-group">
                        <textarea id="alertMsg" class="input-modern" style="height:80px;" placeholder="نص التنبيه..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">إرسال للجميع</button>
                </form>
            </div>
        `;

        document.getElementById('alertForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('alertTitle').value;
            const msg = document.getElementById('alertMsg').value;
            this.chat.sendAlert(title, msg);
            alert('تم إرسال التنبيه العاجل للطالبات.');
            document.getElementById('alertForm').reset();
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
                    <p style="margin-top:5px;">${this.chat.escapeHtml(msg.text)}</p>
                </div>
                <button class="btn btn-outline" style="color:red; border-color:red; padding:5px 10px; font-size:0.8rem;" onclick="window.deleteMsg(${idx})">حذف</button>
            </div>
        `).join('');

        window.deleteMsg = (idx) => {
            if (confirm('حذف هذه الرسالة؟')) {
                this.chat.deleteMessage(idx);
            }
        };
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
                            <th style="padding:10px; text-align:center;">خيارات</th>
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
                    <td style="padding:10px; text-align:center;">
                        <button class="btn btn-outline" style="padding:5px 10px; font-size:0.8rem;" onclick="window.startTeacherChat('${s.name}')">💬</button>
                    </td>
                </tr>
            `).join('');
        };

        window.startTeacherChat = (studentName) => {
            // Initiate chat
            const chatId = this.chat.initPrivateChat(this.user, studentName);
            // Switch to Chat Tab
            this.container.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.container.querySelector('.nav-item[data-tab="chat"]').classList.add('active');
            this.switchTab('chat');
            // Wait for poll then filter? For MVP, we just switch and let them find it or we force logic
            // Ideally: this.chatState.mode = 'PRIVATE_CHAT'; this.chatState.activePrivateId = chatId;
            // But TeacherView needs to implement Private Chat UI first (currently only Global Manager is implemented in renderChatManager)
            alert(`تم بدء المحادثة مع ${studentName}. انتقل إلى تبويب المحادثات.`);
        };

        renderRows();
        document.getElementById('rosterSearch').addEventListener('input', (e) => renderRows(e.target.value));
    }

    getAllStudents() {
        const students = [];
        const roster = DATA_STORE.STUDENT_ROSTER;

        const getStatus = (name) => {
            const rec = DATA_STORE.AUTH_DB[name];
            return { active: !!rec, xp: rec ? rec.xp : 0 };
        };

        roster["10"].forEach(name => {
            students.push({ name, grade: "10", section: null, ...getStatus(name) });
        });

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
