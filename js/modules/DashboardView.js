
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';
import { BRAND } from '../core/Brand.js';
import { ChatSystem } from '../core/ChatSystem.js';

export class DashboardView {
    constructor(container) {
        this.container = container;
        this.user = appStore.state.user;
        this.chat = new ChatSystem((key) => this.handleSync(key));
        this.chatState = { mode: 'GLOBAL', activePrivateId: null };
        this.render();
        this.checkMOTD();
    }

    handleSync(key) {
        if (key === this.chat.storageKey || key === this.chat.privateKey) {
            this.updateChatUI();
        }
        if (key === this.chat.notifKey) {
            this.updateNotifications();
            this.checkInstantPopup();
        }
    }

    render() {
        const gradeData = DATA_STORE.CURRICULUM[this.user.grade] || { items: [], challenges: [] };

        this.container.innerHTML = `
            <!-- Navbar -->
            <nav style="background:white; padding:1rem 2rem; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
                ${BRAND.logoHorizontal}

                <div style="display:flex; gap:15px; align-items:center;">

                    <!-- Notification Center -->
                    <div class="notif-container" id="notifBtn">
                        <div class="notif-icon" style="color:var(--moe-dark)">🔔</div>
                        <div class="notif-badge" id="notifBadge" style="display:none">0</div>
                        <div class="notif-dropdown" id="notifDropdown">
                            <div class="notif-header">
                                <span>الإشعارات</span>
                            </div>
                            <div class="notif-list" id="notifList">
                                <!-- Items -->
                            </div>
                        </div>
                    </div>

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

            <main style="padding:2rem; max-width:1200px; margin:0 auto; padding-bottom: 100px;">

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

                <!-- Chat Widget -->
                <div class="chat-widget">
                    <div class="chat-window" id="chatWindow">
                        <div class="chat-header" id="chatHeader">
                            <span id="chatTitle">💬 المحادثة المباشرة</span>
                            <div style="display:flex; gap:10px;">
                                <span style="font-size:0.8rem; cursor:pointer; display:none;" id="backToChatList">⬅️ عودة</span>
                                <span style="font-size:0.8rem; cursor:pointer;" id="closeChat">✖</span>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div style="display:flex; background:#f1f1f1; border-bottom:1px solid #ddd;">
                            <button class="tab-btn active" id="tabGlobal" style="flex:1; border:none; padding:10px; background:white; cursor:pointer; border-bottom:2px solid var(--moe-green);">العام</button>
                            <button class="tab-btn" id="tabPrivate" style="flex:1; border:none; padding:10px; background:#f1f1f1; cursor:pointer; border-bottom:2px solid transparent;">الخاص</button>
                        </div>

                        <div class="chat-body" id="chatBody">
                            <!-- Messages or List -->
                        </div>

                        <form class="chat-footer" id="chatForm">
                            <input type="text" class="chat-input" placeholder="اكتب رسالتك..." required>
                            <button type="submit" class="btn-moe" style="border-radius:50%; width:40px; height:40px; padding:0;">➤</button>
                        </form>

                        <!-- Search Modal (Hidden inside widget) -->
                        <div id="searchView" style="display:none; position:absolute; inset:50px 0 0 0; background:white; z-index:10; flex-direction:column; padding:15px;">
                             <input type="text" id="searchUser" placeholder="ابحث عن طالبة..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; margin-bottom:10px;">
                             <div id="searchResults" style="flex:1; overflow-y:auto;"></div>
                             <button id="closeSearch" style="margin-top:10px; padding:5px; background:#eee; border:none; cursor:pointer;">إلغاء</button>
                        </div>
                    </div>
                    <div class="chat-toggle-btn" id="toggleChat">💬</div>
                </div>

            </main>
        `;

        this.attachEvents();
        this.updateChatUI(); // Initial Load
        this.updateNotifications(); // Initial Load
    }

    checkInstantPopup() {
        const notifs = this.chat.getNotifications();
        if (notifs.length > 0) {
            const latest = notifs[0];
            // Check freshness (5 seconds)
            const isFresh = (Date.now() - latest.id) < 5000;

            if (isFresh && latest.type === 'alert' && (latest.target === 'ALL' || latest.target === this.user.name)) {
                // Show Popup
                alert(`📢 تنبيه إداري:\n${latest.title}\n\n${latest.text}`);
            }
        }
    }

    updateNotifications() {
        const notifs = this.chat.getNotifications().filter(n => n.target === 'ALL' || n.target === this.user.name);
        const unreadCount = notifs.filter(n => !n.read).length; // Simplified read/unread logic (everything starts unread in this implementation)

        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        }

        const list = document.getElementById('notifList');
        if (list) {
            list.innerHTML = notifs.length ? notifs.map(n => `
                <a href="#" class="notif-item">
                    <h4>${n.title}</h4>
                    <p>${n.text}</p>
                    <span class="time">${n.time}</span>
                </a>
            `).join('') : '<div style="padding:20px; text-align:center; color:#999;">لا توجد إشعارات</div>';
        }
    }

    checkMOTD() {
        const seen = sessionStorage.getItem('motd_seen');
        const motd = this.chat.getMOTD();

        if (!seen && motd && motd.active) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="motd-box">
                    <div class="motd-header">
                        <h3 style="color:white; margin:0;">${motd.title}</h3>
                    </div>
                    <div class="motd-content">
                        <p>${motd.message}</p>
                        <small style="color:#999; margin-top:1rem; display:block;">${motd.date}</small>
                    </div>
                    <div class="motd-footer">
                        <button class="btn-moe" id="closeMotd">فهمت</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('closeMotd').addEventListener('click', () => {
                modal.remove();
                sessionStorage.setItem('motd_seen', 'true');
            });
        }
    }

    updateChatUI() {
        const body = document.getElementById('chatBody');
        const footer = document.getElementById('chatForm');
        if (!body) return;

        // 1. GLOBAL MODE
        if (this.chatState.mode === 'GLOBAL') {
            const messages = this.chat.getMessages();
            footer.style.display = 'flex';
            body.innerHTML = this.renderMessages(messages);
        }
        // 2. PRIVATE LIST MODE
        else if (this.chatState.mode === 'PRIVATE_LIST') {
            const chats = this.chat.getPrivateChats();
            // Filter chats involving me
            const myChats = Object.keys(chats).filter(id => chats[id].participants.includes(this.user.name));

            footer.style.display = 'none';
            body.innerHTML = `
                <button id="startNewChat" style="width:100%; padding:10px; background:var(--moe-green); color:white; border:none; border-radius:4px; margin-bottom:10px;">+ محادثة جديدة</button>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    ${myChats.map(id => {
                        const otherName = chats[id].participants.find(p => p !== this.user.name);
                        const lastMsg = chats[id].messages[chats[id].messages.length - 1];
                        return `
                            <div class="private-chat-item" data-id="${id}" style="padding:10px; background:white; border:1px solid #eee; border-radius:8px; cursor:pointer;">
                                <div style="font-weight:bold;">${otherName}</div>
                                <div style="font-size:0.8rem; color:#666; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${lastMsg ? lastMsg.text : '...'}</div>
                            </div>
                        `;
                    }).join('')}
                    ${myChats.length === 0 ? '<div style="text-align:center; color:#999; margin-top:20px;">لا توجد محادثات خاصة</div>' : ''}
                </div>
            `;

            // Attach Click Events for Items
            body.querySelectorAll('.private-chat-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.chatState.mode = 'PRIVATE_CHAT';
                    this.chatState.activePrivateId = item.dataset.id;
                    this.updateChatUI();
                });
            });

            // New Chat Button
            const btn = document.getElementById('startNewChat');
            if (btn) btn.addEventListener('click', () => {
                document.getElementById('searchView').style.display = 'flex';
            });
        }
        // 3. PRIVATE CHAT MODE
        else if (this.chatState.mode === 'PRIVATE_CHAT') {
            const chat = this.chat.getPrivateChats()[this.chatState.activePrivateId];
            if (chat) {
                const otherName = chat.participants.find(p => p !== this.user.name);
                document.getElementById('chatTitle').textContent = otherName;
                document.getElementById('backToChatList').style.display = 'block';

                footer.style.display = 'flex';
                body.innerHTML = this.renderMessages(chat.messages);
            }
        }

        body.scrollTop = body.scrollHeight;
    }

    renderMessages(messages) {
        return messages.map(msg => {
            const isMe = msg.sender === this.user.name;
            const cls = isMe ? 'me' : (msg.role === 'teacher' ? 'teacher' : 'student');
            return `
                <div class="chat-msg ${cls}">
                    <span class="msg-meta">${msg.sender} • ${msg.time}</span>
                    ${msg.text}
                </div>
            `;
        }).join('');
    }

    attachEvents() {
        // Notification Toggle
        const notifBtn = document.getElementById('notifBtn');
        const notifDropdown = document.getElementById('notifDropdown');

        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDropdown.classList.toggle('show');
            });
            document.addEventListener('click', () => notifDropdown.classList.remove('show'));
        }

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

        // Chat Events
        const win = document.getElementById('chatWindow');
        const toggle = document.getElementById('toggleChat');

        toggle.addEventListener('click', () => win.classList.add('open'));
        document.getElementById('closeChat').addEventListener('click', () => win.classList.remove('open'));

        // Tabs
        const tabGlobal = document.getElementById('tabGlobal');
        const tabPrivate = document.getElementById('tabPrivate');

        tabGlobal.addEventListener('click', () => {
            this.chatState.mode = 'GLOBAL';
            this.updateTabStyles(true);
            this.updateChatUI();
        });

        tabPrivate.addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            this.updateTabStyles(false);
            this.updateChatUI();
        });

        // Back Button
        document.getElementById('backToChatList').addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            document.getElementById('chatTitle').textContent = '💬 المحادثة المباشرة';
            document.getElementById('backToChatList').style.display = 'none';
            this.updateChatUI();
        });

        // Search Logic
        const searchInput = document.getElementById('searchUser');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.length < 2) { searchResults.innerHTML = ''; return; }

            // Search all students
            const matches = [];
            const roster = DATA_STORE.STUDENT_ROSTER;

            // Helper to scan roster (simplified)
            const scan = (arr) => {
                arr.forEach(name => {
                    if (name !== this.user.name && name.includes(val)) matches.push(name);
                });
            };

            if (roster["10"]) scan(roster["10"]);
            Object.values(roster["11"]).forEach(scan);
            Object.values(roster["12"]).forEach(scan);
            // Also add Teacher
            if ("الأستاذة صابرين".includes(val)) matches.push("الأستاذة صابرين");

            searchResults.innerHTML = matches.map(name => `
                <div class="search-item" style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;">${name}</div>
            `).join('');

            searchResults.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const targetName = item.textContent;
                    // Start Chat
                    this.startPrivateChat(targetName);
                    document.getElementById('searchView').style.display = 'none';
                    searchInput.value = '';
                });
            });
        });

        document.getElementById('closeSearch').addEventListener('click', () => {
            document.getElementById('searchView').style.display = 'none';
        });

        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            const text = input.value.trim();
            if (text) {
                if (this.chatState.mode === 'GLOBAL') {
                    this.chat.sendMessage(this.user, text);
                } else if (this.chatState.mode === 'PRIVATE_CHAT') {
                    // We need the recipient name. We can derive it from the ID or store it.
                    // Storing activeRecipient in state would be better, but we can parse ID.
                    const chat = this.chat.getPrivateChats()[this.chatState.activePrivateId];
                    if (chat) {
                        const recipient = chat.participants.find(p => p !== this.user.name);
                        this.chat.sendPrivateMessage(this.user, recipient, text);
                    }
                }
                input.value = '';
            }
        });
    }

    startPrivateChat(targetName) {
        // Generate ID
        const participants = [this.user.name, targetName].sort();
        const chatId = participants.join('_');

        // Ensure it exists in DB so we can render the view (even if empty)
        const db = this.chat.getPrivateChats();
        if (!db[chatId]) {
            // We need to initialize it manually in LS or add a method to ChatSystem
            // Let's use ChatSystem's privateKey directly or add a method.
            // Better: update ChatSystem to support 'initChat'.
            // For now, I'll direct write to LS via ChatSystem helper or just assume empty render logic.
            // Actually, if I update render logic to handle "no chat object" it's safer.
            // But let's just init it.
            this.chat.initPrivateChat(this.user, targetName);
        }

        this.chatState.activePrivateId = chatId;
        this.chatState.mode = 'PRIVATE_CHAT';
        this.updateChatUI();
    }

    updateTabStyles(isGlobal) {
        const tG = document.getElementById('tabGlobal');
        const tP = document.getElementById('tabPrivate');

        tG.style.background = isGlobal ? 'white' : '#f1f1f1';
        tG.style.borderBottomColor = isGlobal ? 'var(--moe-green)' : 'transparent';

        tP.style.background = !isGlobal ? 'white' : '#f1f1f1';
        tP.style.borderBottomColor = !isGlobal ? 'var(--moe-green)' : 'transparent';

        // Reset Header
        if (isGlobal) {
            document.getElementById('chatTitle').textContent = '💬 المحادثة المباشرة';
            document.getElementById('backToChatList').style.display = 'none';
        }
    }
}
