
import { DATA_STORE } from '../core/DataStore.js';
import { Auth } from '../core/Auth.js';
import { ChatSystem } from '../core/ChatSystem.js';
import { BRAND } from '../core/Brand.js';

export class DashboardView {
    constructor() {
        this.app = document.getElementById('app');
        this.auth = new Auth();
        this.user = this.auth.checkSession();
        this.activeTab = 'home';

        // Chat
        this.chat = new ChatSystem((key) => this.onChatUpdate(key));
        this.render();
    }

    render() {
        if (!this.user) { window.location.hash = '#login'; return; }

        this.app.innerHTML = `
            <div class="dashboard-layout">
                <!-- SIDEBAR -->
                <aside class="sidebar" id="sidebar">
                    <div style="margin-bottom:2rem; padding-bottom:1rem; border-bottom:1px solid rgba(0,0,0,0.05);">
                        <div style="display:flex; align-items:center; gap:10px;">
                            ${BRAND.logoSvg.replace('width="60"', 'width="40"').replace('height="60"', 'height="40"')}
                            <span style="font-family:'Cairo'; font-weight:800; color:var(--vision-emerald);">أكاديمية صابرين</span>
                        </div>
                    </div>

                    <nav>
                        <a class="nav-item active" data-tab="home">
                            <span>🏠</span> الرئيسية
                        </a>
                        <a class="nav-item" data-tab="resources">
                            <span>📚</span> المصادر التعليمية
                        </a>
                        <a class="nav-item" data-tab="exams">
                            <span>📝</span> اختبارات المحاكاة
                        </a>
                        <a class="nav-item" data-tab="chat">
                            <span>💬</span> مجتمع الطلاب
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
                    <!-- Content Injected Here -->
                </main>

                <!-- MOBILE TOGGLE -->
                <button id="menuToggle" style="position:fixed; bottom:20px; left:20px; z-index:200; width:50px; height:50px; border-radius:50%; background:var(--vision-emerald); color:white; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); font-size:1.5rem;">
                    ☰
                </button>
            </div>
        `;

        this.attachEvents();
        this.switchTab('home');
    }

    attachEvents() {
        // Navigation
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.switchTab(item.dataset.tab);

                // Close mobile menu
                if (window.innerWidth < 900) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.auth.logout();
        });

        // Mobile Toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    switchTab(tab) {
        this.activeTab = tab;
        const main = document.getElementById('mainContent');
        main.innerHTML = ''; // Clear

        switch(tab) {
            case 'home': this.renderHome(main); break;
            case 'resources': this.renderResources(main); break;
            case 'exams': this.renderExams(main); break;
            case 'chat': this.renderChat(main); break;
        }
    }

    // --- HOME TAB ---
    renderHome(container) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';

        container.innerHTML = `
            <header style="margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1 style="font-family:'Cairo'; font-weight:800; color:var(--vision-emerald); font-size:2rem;">
                        ${greeting}، ${this.user.name.split(' ')[0]}
                    </h1>
                    <p style="color:#666;">مرحباً بك في لوحة التحكم الخاصة بك.</p>
                </div>
                <div class="glass-card" style="padding:10px 20px; background:var(--grad-gold); color:white;">
                    <span style="font-weight:bold; font-size:1.2rem;">${this.user.xp || 0} XP</span>
                </div>
            </header>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                <!-- Card 1: Next Exam -->
                <div class="glass-card">
                    <h3 style="color:var(--vision-emerald); margin-bottom:10px;">📅 الاختبار القادم</h3>
                    <p style="font-size:0.9rem; color:#555;">اختبار القدرات التجريبي رقم 2</p>
                    <div style="margin-top:15px; width:100%; height:6px; background:#eee; border-radius:3px;">
                        <div style="width:70%; height:100%; background:var(--vision-emerald); border-radius:3px;"></div>
                    </div>
                    <small style="color:#888;">متبقي 3 أيام</small>
                </div>

                <!-- Card 2: Recent Resource -->
                <div class="glass-card" style="background:linear-gradient(135deg, #fff 0%, #f9f9f9 100%);">
                    <h3 style="color:var(--vision-slate); margin-bottom:10px;">📖 آخر درس</h3>
                    <p>الرياضيات 2-1: المصفوفات</p>
                    <button class="btn btn-outline" style="margin-top:10px; padding:8px 16px; font-size:0.8rem;">استكمال</button>
                </div>
            </div>

            <!-- Global Alert / MOTD -->
            <div id="motdArea" style="margin-top:2rem;"></div>
        `;

        this.updateMOTD();
    }

    // --- RESOURCES TAB ---
    renderResources(container) {
        const grade = this.user.grade || "10";
        const curriculum = DATA_STORE.CURRICULUM[grade];

        if (!curriculum) {
            container.innerHTML = `<div class="glass-card">لا توجد مصادر متاحة لصفك الدراسي حالياً.</div>`;
            return;
        }

        let itemsHtml = curriculum.items.map(item => `
            <div class="glass-card" style="display:flex; flex-direction:column; gap:10px;">
                <div style="font-size:2rem;">${item.type === 'pdf' ? '📄' : '🎥'}</div>
                <h4 style="font-weight:700;">${item.title}</h4>
                <a href="${item.link}" target="_blank" class="btn btn-primary" style="margin-top:auto;">
                    ${item.type === 'pdf' ? 'تحميل PDF' : 'مشاهدة'}
                </a>
            </div>
        `).join('');

        container.innerHTML = `
            <h2 style="margin-bottom:1rem; font-family:'Cairo';">${curriculum.title}</h2>
            <p style="margin-bottom:2rem; color:#666;">${curriculum.subtitle}</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:20px;">
                ${itemsHtml}
            </div>
        `;
    }

    // --- EXAMS TAB ---
    renderExams(container) {
        container.innerHTML = `
            <h2 style="margin-bottom:2rem;">اختبارات المحاكاة (قياس)</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">

                <div class="glass-card" style="border-top:5px solid var(--vision-emerald);">
                    <h3>القدرات العامة</h3>
                    <p style="margin:10px 0; color:#666;">اختبار تجريبي يحاكي الاختبار الحقيقي (كمي/لفظي).</p>
                    <button class="btn btn-primary" onclick="window.location.hash='#exam/qudrat'">بدء الاختبار</button>
                </div>

                <div class="glass-card" style="border-top:5px solid var(--vision-gold);">
                    <h3>التحصيلي</h3>
                    <p style="margin:10px 0; color:#666;">اختبار شامل للمقررات (رياضيات 1، 2، 3).</p>
                    <button class="btn btn-gold" onclick="window.location.hash='#exam/tahsili'">بدء الاختبار</button>
                </div>

            </div>
        `;
    }

    // --- CHAT TAB ---
    renderChat(container) {
        container.innerHTML = `
            <div class="glass-card" style="height:calc(100vh - 100px); padding:0; overflow:hidden; display:flex; flex-direction:column;">
                <!-- Chat Header -->
                <div class="chat-header" style="background:var(--vision-emerald); color:white;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">💬</span>
                        <div>
                            <h3 style="margin:0;">مجتمع الطلاب</h3>
                            <small id="chatStatus" style="opacity:0.8;">متصل</small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-outline" style="border-color:white; color:white; font-size:0.8rem;" id="toggleChatMode">
                            الخاص / العام
                        </button>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="chat-messages" id="chatMessages">
                    <!-- Dynamic -->
                </div>

                <!-- Input Area -->
                <form class="chat-input-area" id="chatForm">
                    <input type="text" class="input-modern" placeholder="اكتب رسالتك هنا..." required autocomplete="off">
                    <button type="submit" class="btn btn-primary" style="padding:0 20px;">➤</button>
                </form>
            </div>

            <!-- Search Modal (Hidden by default) -->
            <div id="searchModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:999; justify-content:center; align-items:center;">
                <div class="glass-card" style="width:90%; max-width:400px; max-height:80vh; overflow-y:auto;">
                    <h3>بحث عن طالبة</h3>
                    <input type="text" id="searchUser" class="input-modern" placeholder="الاسم...">
                    <div id="searchResults" style="margin-top:10px;"></div>
                    <button class="btn btn-outline" style="margin-top:10px; width:100%;" onclick="document.getElementById('searchModal').style.display='none'">إغلاق</button>
                </div>
            </div>
        `;

        this.attachChatEvents();
        this.chat.poll(); // Force update
    }

    attachChatEvents() {
        const form = document.getElementById('chatForm');
        const msgs = document.getElementById('chatMessages');
        const toggle = document.getElementById('toggleChatMode');
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchUser');

        // Mode Switch
        toggle.addEventListener('click', () => {
            searchModal.style.display = 'flex';
        });

        // Search Logic
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const res = document.getElementById('searchResults');
            if (val.length < 2) { res.innerHTML = ''; return; }

            // Flatten Roster
            const allStudents = [];
            // Grade 10
            DATA_STORE.STUDENT_ROSTER["10"].forEach(n => allStudents.push(n));
            // 11/12
            ['11','12'].forEach(g => {
                Object.values(DATA_STORE.STUDENT_ROSTER[g]).forEach(arr => arr.forEach(n => allStudents.push(n)));
            });
            // Teacher
            allStudents.push(DATA_STORE.TEACHER.name);

            const matches = allStudents.filter(n => n.includes(val) && n !== this.user.name);

            res.innerHTML = matches.map(n => `
                <div class="search-item" style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;">${n}</div>
            `).join('');

            res.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const target = item.textContent;
                    // Init Private Chat
                    this.chat.initPrivateChat(this.user, target);
                    searchModal.style.display = 'none';
                    // Need to handle private chat state in View...
                    // For simplicity in this plan, let's just alert
                    alert(`تم بدء محادثة خاصة مع ${target}. (النسخة التجريبية)`);
                });
            });
        });

        // Send Message
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            const text = input.value.trim();
            if (text) {
                this.chat.sendMessage(this.user, text);
                input.value = '';
            }
        });
    }

    onChatUpdate(key) {
        // Called when poll finds new data
        if (this.activeTab === 'chat') {
            const msgs = document.getElementById('chatMessages');
            if (!msgs) return;

            const messages = this.chat.getMessages(); // Global only for now
            msgs.innerHTML = messages.map(msg => {
                const isMe = msg.sender === this.user.name;
                const roleColor = msg.role === 'teacher' ? 'var(--vision-gold)' : '#666';

                return `
                    <div class="chat-bubble ${isMe ? 'mine' : 'theirs'}">
                        <div style="font-size:0.75rem; color:${isMe ? 'rgba(255,255,255,0.8)' : roleColor}; margin-bottom:4px;">
                            ${msg.sender} ${msg.role === 'teacher' ? '★' : ''}
                        </div>
                        ${msg.text}
                        <div style="font-size:0.6rem; text-align:left; opacity:0.6; margin-top:5px;">${msg.time}</div>
                    </div>
                `;
            }).join('');

            msgs.scrollTop = msgs.scrollHeight;
        }

        // MOTD Update
        if (this.activeTab === 'home') this.updateMOTD();
    }

    updateMOTD() {
        const area = document.getElementById('motdArea');
        if (!area) return;

        const motd = this.chat.getMOTD();
        if (motd && motd.active) {
            area.innerHTML = `
                <div class="glass-card" style="background:rgba(255,0,0,0.05); border-right:4px solid red;">
                    <h4 style="color:red;">🔔 تنبيه هام: ${motd.title}</h4>
                    <p>${motd.message}</p>
                </div>
            `;
        } else {
            area.innerHTML = '';
        }
    }
}
