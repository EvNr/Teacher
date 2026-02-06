
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
        if (key === this.chat.storageKey || key === this.chat.privateKey) this.updateChatUI();
        if (key === this.chat.notifKey) {
            this.updateNotifications();
            this.checkInstantPopup();
        }
    }

    render() {
        const gradeData = DATA_STORE.CURRICULUM[this.user.grade] || { items: [], challenges: [] };

        this.container.innerHTML = `
            <!-- Navbar -->
            <nav class="expert-nav">
                <div style="font-weight:bold; font-size:1.2rem; color:var(--gilded-gold); display:flex; align-items:center; gap:10px;">
                    <svg width="30" height="30" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" stroke="#c5a059" stroke-width="5" fill="none" />
                           <text x="50" y="65" font-family="Tajawal" font-size="50" text-anchor="middle" fill="#c5a059" font-weight="bold">ص</text>
                    </svg>
                    أكاديمية صابرين
                </div>

                <div style="display:flex; gap:20px; align-items:center;">
                    <div class="notif-container" id="notifBtn" style="position:relative; cursor:pointer;">
                        <span style="font-size:1.5rem;">🔔</span>
                        <span class="notif-badge" id="notifBadge" style="display:none; position:absolute; top:-5px; right:-5px; background:var(--danger-ruby); color:white; border-radius:50%; width:18px; height:18px; font-size:0.7rem; justify-content:center; align-items:center;">0</span>
                    </div>

                    <div style="text-align:left;">
                        <div style="font-weight:bold; color:white;">${this.user.name}</div>
                        <div style="font-size:0.8rem; color:var(--luxury-grey);">الصف ${this.user.grade}</div>
                    </div>
                    <div style="background:var(--gilded-gold); color:var(--royal-obsidian); padding:5px 15px; border-radius:20px; font-weight:bold;">
                        ${this.user.xp || 0} XP
                    </div>
                    <button id="logoutBtn" class="btn-outline-gold" style="padding:5px 15px; font-size:0.8rem;">خروج</button>
                </div>
            </nav>

            <main class="dashboard-grid fade-in">

                <!-- Main Content -->
                <div style="display:flex; flex-direction:column; gap:2rem;">

                    <div class="expert-card">
                        <h2 class="text-gold font-heading" style="margin-bottom:1rem;">مركز القياس والتدريب</h2>
                        <p class="text-grey" style="margin-bottom:2rem;">محاكاة احترافية لاختبارات المركز الوطني.</p>

                        <div style="display:grid; gap:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px;">
                                <div>
                                    <h4 class="text-white">القدرات العامة</h4>
                                    <span class="text-grey" style="font-size:0.8rem;">كمي ولفظي | 25 دقيقة</span>
                                </div>
                                <button class="btn-gold start-test" data-test="qudrat">بدء المحاكاة</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px;">
                                <div>
                                    <h4 class="text-white">التحصيلي</h4>
                                    <span class="text-grey" style="font-size:0.8rem;">رياضيات شامل | 40 دقيقة</span>
                                </div>
                                <button class="btn-gold start-test" data-test="tahsili">بدء المحاكاة</button>
                            </div>
                        </div>
                    </div>

                    <div class="expert-card">
                        <h3 class="text-white font-heading" style="margin-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">المكتبة الرقمية</h3>
                        <div style="display:grid; gap:15px;">
                            ${gradeData.items.map(item => `
                                <a href="${item.link}" target="_blank" style="display:flex; gap:15px; align-items:center; padding:10px; border-radius:8px; transition:background 0.2s; hover:background:rgba(255,255,255,0.05);">
                                    <div style="font-size:1.8rem;">${item.type === 'video' ? '📺' : '📚'}</div>
                                    <div>
                                        <div class="text-gold" style="font-weight:bold;">${item.title}</div>
                                        <div class="text-grey" style="font-size:0.8rem;">${item.featured ? '⭐ محتوى مميز' : ''}</div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div style="display:flex; flex-direction:column; gap:2rem;">
                    <div class="expert-card" style="border-top: 3px solid var(--danger-ruby);">
                        <h3 class="text-white font-heading" style="margin-bottom:1rem;">التحديات الأسبوعية</h3>
                        ${gradeData.challenges.map(c => `
                            <div style="background:rgba(197, 48, 48, 0.1); padding:15px; border-radius:8px; margin-bottom:10px;">
                                <h4 class="text-white">${c.title}</h4>
                                <p class="text-grey" style="font-size:0.9rem; margin:5px 0;">${c.description}</p>
                                <button class="btn-outline-gold" style="width:100%; font-size:0.8rem; margin-top:10px;">قبول التحدي (+${c.xp} XP)</button>
                            </div>
                        `).join('')}
                    </div>

                    <div class="expert-card">
                        <h3 class="text-white font-heading">تحليل الأداء</h3>
                        <div style="margin-top:1.5rem;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <span class="text-grey">الإتقان العام</span>
                                <span class="text-gold">65%</span>
                            </div>
                            <div style="width:100%; background:rgba(255,255,255,0.1); height:6px; border-radius:3px;">
                                <div style="width:65%; background:var(--gilded-gold); height:100%; border-radius:3px;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Widget -->
                <div class="chat-widget">
                    <div class="chat-interface" id="chatWindow">
                        <div class="chat-header-lux" id="chatHeader">
                            <span class="text-gold font-heading" id="chatTitle">الغرفة العامة</span>
                            <div style="display:flex; gap:10px;">
                                <span class="text-grey" style="cursor:pointer; display:none;" id="backToChatList">عودة</span>
                                <span class="text-grey" style="cursor:pointer;" id="closeChat">✖</span>
                            </div>
                        </div>

                        <div class="chat-tabs">
                            <div class="chat-tab active" id="tabGlobal">عام</div>
                            <div class="chat-tab" id="tabPrivate">خاص</div>
                        </div>

                        <div class="chat-area" id="chatBody"></div>

                        <form class="chat-controls" id="chatForm">
                            <input type="text" class="expert-input" placeholder="اكتب رسالتك..." required style="padding:10px;">
                            <button type="submit" class="btn-gold" style="border-radius:50%; width:45px; height:45px; padding:0; display:flex; align-items:center; justify-content:center;">➤</button>
                        </form>

                        <!-- Search Overlay -->
                        <div id="searchView" style="display:none; position:absolute; inset:0; background:var(--royal-obsidian); z-index:10; flex-direction:column; padding:20px;">
                             <h4 class="text-gold" style="margin-bottom:15px;">بحث عن زميلة</h4>
                             <input type="text" id="searchUser" class="expert-input" placeholder="الاسم..." style="margin-bottom:15px;">
                             <div id="searchResults" style="flex:1; overflow-y:auto;"></div>
                             <button id="closeSearch" class="btn-outline-gold" style="margin-top:10px;">إغلاق</button>
                        </div>
                    </div>
                    <div class="chat-toggle" id="toggleChat">💬</div>
                </div>

            </main>
        `;

        this.attachEvents();
        this.updateChatUI();
        this.updateNotifications();
    }

    checkInstantPopup() {
        const notifs = this.chat.getNotifications();
        if (notifs.length > 0) {
            const latest = notifs[0];
            const isFresh = (Date.now() - latest.id) < 5000;

            if (isFresh && latest.type === 'alert' && (latest.target === 'ALL' || latest.target === this.user.name)) {
                alert(`🔴 تنبيه هام:\n${latest.title}\n\n${latest.text}`);
            }
        }
    }

    updateNotifications() {
        const notifs = this.chat.getNotifications().filter(n => n.target === 'ALL' || n.target === this.user.name);
        const unreadCount = notifs.length;

        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        }
    }

    checkMOTD() {
        const seen = sessionStorage.getItem('motd_seen');
        const motd = this.chat.getMOTD();

        if (!seen && motd && motd.active) {
            alert(`📢 رسالة اليوم:\n\n${motd.title}\n${motd.message}`);
            sessionStorage.setItem('motd_seen', 'true');
        }
    }

    updateChatUI() {
        const body = document.getElementById('chatBody');
        const footer = document.getElementById('chatForm');
        if (!body) return;

        if (this.chatState.mode === 'GLOBAL') {
            const messages = this.chat.getMessages();
            footer.style.display = 'flex';
            body.innerHTML = this.renderMessages(messages);
        }
        else if (this.chatState.mode === 'PRIVATE_LIST') {
            const chats = this.chat.getPrivateChats();
            const myChats = Object.keys(chats).filter(id => chats[id].participants.includes(this.user.name));

            footer.style.display = 'none';
            body.innerHTML = `
                <button id="startNewChat" class="btn-gold" style="width:100%; margin-bottom:15px; border-radius:10px;">+ محادثة جديدة</button>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${myChats.map(id => {
                        const otherName = chats[id].participants.find(p => p !== this.user.name);
                        const lastMsg = chats[id].messages[chats[id].messages.length - 1];
                        return `
                            <div class="private-chat-item" data-id="${id}" style="padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; cursor:pointer;">
                                <div class="text-gold" style="font-weight:bold;">${otherName}</div>
                                <div class="text-grey" style="font-size:0.8rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${lastMsg ? lastMsg.text : '...'}</div>
                            </div>
                        `;
                    }).join('')}
                    ${myChats.length === 0 ? '<div class="text-grey" style="text-align:center;">لا توجد محادثات</div>' : ''}
                </div>
            `;

            body.querySelectorAll('.private-chat-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.chatState.mode = 'PRIVATE_CHAT';
                    this.chatState.activePrivateId = item.dataset.id;
                    this.updateChatUI();
                });
            });

            const btn = document.getElementById('startNewChat');
            if (btn) btn.addEventListener('click', () => {
                document.getElementById('searchView').style.display = 'flex';
            });
        }
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
            const type = isMe ? 'outgoing' : 'incoming';
            return `
                <div class="msg-bubble ${type}">
                    <div style="font-size:0.7rem; opacity:0.7; margin-bottom:5px;">${msg.sender}</div>
                    ${msg.text}
                </div>
            `;
        }).join('');
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

        const win = document.getElementById('chatWindow');
        const toggle = document.getElementById('toggleChat');
        toggle.addEventListener('click', () => win.classList.add('active'));
        document.getElementById('closeChat').addEventListener('click', () => win.classList.remove('active'));

        const tabGlobal = document.getElementById('tabGlobal');
        const tabPrivate = document.getElementById('tabPrivate');

        tabGlobal.addEventListener('click', () => {
            this.chatState.mode = 'GLOBAL';
            tabGlobal.classList.add('active'); tabPrivate.classList.remove('active');
            this.updateChatUI();
        });

        tabPrivate.addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            tabPrivate.classList.add('active'); tabGlobal.classList.remove('active');
            this.updateChatUI();
        });

        document.getElementById('backToChatList').addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            document.getElementById('chatTitle').textContent = 'الغرفة العامة';
            document.getElementById('backToChatList').style.display = 'none';
            this.updateChatUI();
        });

        const searchInput = document.getElementById('searchUser');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.length < 2) { searchResults.innerHTML = ''; return; }

            const matches = [];
            const roster = DATA_STORE.STUDENT_ROSTER;
            const scan = (arr) => {
                arr.forEach(name => {
                    if (name !== this.user.name && name.toLowerCase().includes(val)) matches.push(name);
                });
            };

            if (roster["10"]) scan(roster["10"]);
            Object.values(roster["11"]).forEach(scan);
            Object.values(roster["12"]).forEach(scan);
            if ("الأستاذة صابرين".includes(val)) matches.push("الأستاذة صابرين");

            searchResults.innerHTML = matches.map(name => `
                <div class="search-item text-white" style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); cursor:pointer;">${name}</div>
            `).join('');

            searchResults.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const targetName = item.textContent;
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
        const participants = [this.user.name, targetName].sort();
        const chatId = participants.join('_');

        // Ensure Init
        this.chat.initPrivateChat(this.user, targetName);

        this.chatState.activePrivateId = chatId;
        this.chatState.mode = 'PRIVATE_CHAT';
        this.updateChatUI();
    }
}
