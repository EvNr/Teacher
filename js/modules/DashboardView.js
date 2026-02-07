
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
        this.chat = new ChatSystem((key, data) => this.onChatUpdate(key, data));
        this.chatState = { mode: 'GLOBAL', activePrivateId: null };
        this.render();
    }

    onChatUpdate(key, data) {
        if (key === 'NEW_ALERT') {
            this.showNotificationPopup(data);
            const dot = document.getElementById('bellDot');
            if (dot) dot.style.display = 'block';
        }
        else if (key === 'UPDATE') {
            if (this.activeTab === 'chat') {
                this.updateChatUI();
            }
            if (this.activeTab === 'home') {
                this.updateMOTD();
            }
        }
    }

    showNotificationPopup(alertData) {
        const div = document.createElement('div');
        div.className = 'glass-card';
        div.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            z-index: 1000; background: rgba(255,255,255,0.95); border-left: 5px solid var(--vision-gold);
            padding: 1rem 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: slideDown 0.5s ease;
            max-width: 90%; width: 400px;
        `;
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                <span style="font-size:1.5rem;">🔔</span>
                <h3 style="margin:0; color:var(--vision-emerald);">${alertData.title}</h3>
            </div>
            <p>${alertData.message}</p>
            <small style="color:#888;">الآن</small>
        `;
        document.body.appendChild(div);

        // Remove after 5 seconds
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 500);
        }, 5000);
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

                <!-- MOBILE TOGGLE -->
                <button id="menuToggle" style="position:fixed; bottom:20px; left:20px; z-index:200; width:50px; height:50px; border-radius:50%; background:var(--vision-emerald); color:white; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); font-size:1.5rem;">
                    ☰
                </button>

                <!-- FLOATING CHAT BUTTON -->
                <button id="fabChat" style="position:fixed; bottom:20px; right:20px; z-index:200; width:60px; height:60px; border-radius:50%; background:var(--grad-gold); color:white; border:none; box-shadow:0 4px 15px rgba(198,166,100,0.4); font-size:1.8rem; display:flex; justify-content:center; align-items:center; cursor:pointer;">
                    💬
                </button>
            </div>

            <!-- Notifications Modal -->
            <div id="notifModal" style="display:none; position:absolute; top:60px; left:20px; width:300px; background:white; box-shadow:0 5px 20px rgba(0,0,0,0.1); border-radius:10px; z-index:100; padding:15px;">
                <h4 style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">التنبيهات</h4>
                <div id="notifList" style="max-height:200px; overflow-y:auto; font-size:0.9rem;"></div>
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

                if (window.innerWidth < 900) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', () => this.auth.logout());

        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Floating Chat
        document.getElementById('fabChat').addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            const chatNav = document.querySelector('.nav-item[data-tab="chat"]');
            if(chatNav) chatNav.classList.add('active');
            this.switchTab('chat');
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

            <!-- Global Alert / MOTD -->
            <div id="motdArea" style="margin-bottom:2rem;"></div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                <div class="glass-card">
                    <h3 style="color:var(--vision-emerald); margin-bottom:10px;">📅 الاختبار القادم</h3>
                    <p style="font-size:0.9rem; color:#555;">اختبار القدرات التجريبي رقم 2</p>
                    <div style="margin-top:15px; width:100%; height:6px; background:#eee; border-radius:3px;">
                        <div style="width:70%; height:100%; background:var(--vision-emerald); border-radius:3px;"></div>
                    </div>
                    <small style="color:#888;">متبقي 3 أيام</small>
                </div>

                <div class="glass-card" style="background:linear-gradient(135deg, #fff 0%, #f9f9f9 100%);">
                    <h3 style="color:var(--vision-slate); margin-bottom:10px;">📖 آخر درس</h3>
                    <p>الرياضيات 2-1: المصفوفات</p>
                    <button class="btn btn-outline" style="margin-top:10px; padding:8px 16px; font-size:0.8rem;">استكمال</button>
                </div>
            </div>
        `;

        this.updateMOTD();
    }

    // --- RESOURCES TAB (Same as before) ---
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

    // --- EXAMS TAB (Same as before) ---
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

    // --- CHAT TAB (Enhanced) ---
    renderChat(container) {
        container.innerHTML = `
            <div class="glass-card" style="height:calc(100vh - 150px); padding:0; overflow:hidden; display:flex; flex-direction:column;">
                <!-- Chat Header -->
                <div class="chat-header" style="background:var(--vision-emerald); color:white; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">💬</span>
                        <div>
                            <h3 style="margin:0;" id="chatTitle">مجتمع الطلاب</h3>
                        </div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="btn btn-outline" style="border-color:white; color:white; font-size:0.8rem;" id="tabGlobalBtn">العام</button>
                        <button class="btn btn-outline" style="border-color:white; color:white; font-size:0.8rem;" id="tabPrivateBtn">الخاص</button>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="chat-messages" id="chatMessages" style="flex:1; overflow-y:auto; padding:15px; background:#f9f9f9;">
                    <!-- Dynamic -->
                </div>

                <!-- Input Area -->
                <form class="chat-input-area" id="chatForm" style="padding:15px; background:white; border-top:1px solid #eee; display:flex; gap:10px;">
                    <input type="text" class="input-modern" placeholder="اكتب رسالتك هنا..." required autocomplete="off">
                    <button type="submit" class="btn btn-primary" style="padding:0 20px;">➤</button>
                </form>
            </div>

            <!-- Private List Overlay (within container) -->
            <div id="privateListOverlay" style="display:none; position:absolute; top:120px; left:20px; right:20px; bottom:100px; background:white; z-index:10; border-radius:10px; box-shadow:0 5px 20px rgba(0,0,0,0.1); padding:20px; overflow-y:auto;"></div>
        `;

        this.updateChatUI();
        this.attachChatEvents();
    }

    updateChatUI() {
        if (!document.getElementById('chatMessages')) return;

        const msgsContainer = document.getElementById('chatMessages');
        const privateOverlay = document.getElementById('privateListOverlay');

        if (this.chatState.mode === 'GLOBAL') {
            privateOverlay.style.display = 'none';
            document.getElementById('chatTitle').textContent = 'مجتمع الطلاب (عام)';
            const messages = this.chat.getMessages();

            msgsContainer.innerHTML = messages.map(msg => {
                const isMe = msg.sender === this.user.name;
                const roleColor = msg.role === 'teacher' ? 'var(--vision-gold)' : '#666';
                return `
                    <div class="chat-bubble ${isMe ? 'mine' : 'theirs'}" style="margin-bottom:10px; max-width:75%; padding:10px 15px; border-radius:15px; align-self:${isMe ? 'flex-end' : 'flex-start'}; background:${isMe ? 'var(--vision-emerald)' : 'white'}; color:${isMe ? 'white' : '#333'}; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size:0.75rem; color:${isMe ? 'rgba(255,255,255,0.8)' : roleColor}; margin-bottom:4px;">${msg.sender} ${msg.role === 'teacher' ? '★' : ''}</div>
                        ${this.chat.escapeHtml(msg.text)}
                    </div>
                `;
            }).join('');
            msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }
        else if (this.chatState.mode === 'PRIVATE_LIST') {
            privateOverlay.style.display = 'block';
            privateOverlay.innerHTML = '<h3 style="margin-bottom:15px;">المحادثات الخاصة</h3>';

            const chats = this.chat.getPrivateChats();
            const myChats = Object.keys(chats).filter(id => chats[id].participants.includes(this.user.name));

            if (myChats.length === 0) {
                privateOverlay.innerHTML += '<p style="color:#888;">لا توجد محادثات خاصة بعد.</p>';
            } else {
                myChats.forEach(id => {
                    const other = chats[id].participants.find(p => p !== this.user.name);
                    const div = document.createElement('div');
                    div.style.cssText = "padding:15px; background:#f5f5f5; border-radius:10px; margin-bottom:10px; cursor:pointer;";
                    div.textContent = other;
                    div.onclick = () => {
                        this.chatState.mode = 'PRIVATE_CHAT';
                        this.chatState.activePrivateId = id;
                        this.updateChatUI();
                    };
                    privateOverlay.appendChild(div);
                });
            }
        }
        else if (this.chatState.mode === 'PRIVATE_CHAT') {
            privateOverlay.style.display = 'none';
            const chat = this.chat.getPrivateChats()[this.chatState.activePrivateId];
            if (!chat) return;

            const other = chat.participants.find(p => p !== this.user.name);
            document.getElementById('chatTitle').textContent = `محادثة خاصة مع ${other}`;

            msgsContainer.innerHTML = (chat.messages || []).map(msg => {
                const isMe = msg.sender === this.user.name;
                return `
                    <div class="chat-bubble ${isMe ? 'mine' : 'theirs'}" style="margin-bottom:10px; max-width:75%; padding:10px 15px; border-radius:15px; align-self:${isMe ? 'flex-end' : 'flex-start'}; background:${isMe ? 'var(--vision-emerald)' : 'white'}; color:${isMe ? 'white' : '#333'}; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size:0.75rem; opacity:0.8; margin-bottom:4px;">${msg.sender}</div>
                        ${this.chat.escapeHtml(msg.text)}
                    </div>
                `;
            }).join('');
            msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }
    }

    attachChatEvents() {
        const form = document.getElementById('chatForm');
        document.getElementById('tabGlobalBtn').addEventListener('click', () => {
            this.chatState.mode = 'GLOBAL';
            this.updateChatUI();
        });
        document.getElementById('tabPrivateBtn').addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            this.updateChatUI();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            const text = input.value.trim();
            if (text) {
                if (this.chatState.mode === 'GLOBAL') {
                    this.chat.sendMessage(this.user, text);
                } else if (this.chatState.mode === 'PRIVATE_CHAT') {
                    const chat = this.chat.getPrivateChats()[this.chatState.activePrivateId];
                    if (chat) {
                        const other = chat.participants.find(p => p !== this.user.name);
                        this.chat.sendPrivateMessage(this.user, other, text);
                    }
                }
                input.value = '';
            }
        });
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
