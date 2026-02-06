
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
        this.chatState = { mode: 'GLOBAL', activePrivateId: null };
        this.render();
    }

    handleSync(key) {
        if (key === this.chat.storageKey || key === this.chat.privateKey) this.updateChatUI();
    }

    render() {
        const stats11A = DATA_STORE.ANALYTICS["11"].A;
        const stats11B = DATA_STORE.ANALYTICS["11"].B;

        this.container.innerHTML = `
            <nav class="expert-nav">
                <div style="font-weight:bold; font-size:1.2rem; color:var(--gilded-gold); display:flex; align-items:center; gap:10px;">
                    <svg width="30" height="30" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" stroke="#c5a059" stroke-width="5" fill="none" />
                           <text x="50" y="65" font-family="Tajawal" font-size="50" text-anchor="middle" fill="#c5a059" font-weight="bold">ص</text>
                    </svg>
                    مركز القيادة
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div class="text-white">أ. صابرين</div>
                    <button id="logoutBtn" class="btn-outline-gold" style="padding:5px 15px; font-size:0.8rem;">خروج</button>
                </div>
            </nav>

            <main class="dashboard-grid fade-in">

                <div style="display:flex; flex-direction:column; gap:2rem;">

                    <div class="expert-card">
                        <h3 class="text-gold font-heading" style="margin-bottom:2rem;">تحليل الأداء الأكاديمي</h3>
                        <div style="height:300px; position:relative; background:rgba(0,0,0,0.2); border-radius:12px; padding:20px; display:flex; justify-content:space-around; align-items:flex-end;">

                            <div style="width:15%; text-align:center;">
                                <div style="height:${stats11A.avg}%; background:var(--gilded-gold); border-radius:8px 8px 0 0; position:relative; animation:slideUp 1s;">
                                    <span style="position:absolute; top:-25px; left:0; right:0; color:white; font-weight:bold;">${stats11A.avg}%</span>
                                </div>
                                <div style="margin-top:10px; color:var(--luxury-grey);">11-A</div>
                            </div>

                            <div style="width:15%; text-align:center;">
                                <div style="height:${stats11B.avg}%; background:var(--gilded-dark); border-radius:8px 8px 0 0; position:relative; animation:slideUp 1.2s;">
                                     <span style="position:absolute; top:-25px; left:0; right:0; color:white; font-weight:bold;">${stats11B.avg}%</span>
                                </div>
                                <div style="margin-top:10px; color:var(--luxury-grey);">11-B</div>
                            </div>

                        </div>
                    </div>

                    <div class="expert-card">
                        <h3 class="text-white font-heading" style="margin-bottom:1rem;">سجل الطالبات</h3>
                        <table style="width:100%; border-collapse:collapse; color:var(--luxury-grey);">
                            <thead>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--gilded-gold);">
                                    <th style="padding:15px; text-align:right;">الاسم</th>
                                    <th style="padding:15px; text-align:right;">الصف</th>
                                    <th style="padding:15px; text-align:center;">XP</th>
                                    <th style="padding:15px; text-align:center;">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.getAllStudents().slice(0, 10).map(u => `
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                        <td style="padding:15px; color:white;">${u.name}</td>
                                        <td style="padding:15px;">${u.grade}-${u.section}</td>
                                        <td style="padding:15px; text-align:center; color:var(--gilded-light); font-weight:bold;">${u.xp || 0}</td>
                                        <td style="padding:15px; text-align:center;">
                                            <span style="padding:3px 8px; border-radius:4px; background:${u.registered ? 'rgba(47, 133, 90, 0.2)' : 'rgba(197, 160, 89, 0.2)'}; color:${u.registered ? 'var(--success-emerald)' : 'var(--gilded-gold)'};">
                                                ${u.registered ? 'مسجل' : 'معلق'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="text-align:center; margin-top:15px; color:var(--luxury-grey);">... عرض المزيد</div>
                    </div>

                </div>

                <div style="display:flex; flex-direction:column; gap:2rem;">

                     <div class="expert-card" style="border:1px solid var(--danger-ruby);">
                        <h3 class="text-white font-heading" style="color:var(--danger-ruby);">إرسال تنبيه عاجل</h3>
                        <form id="alertForm" style="margin-top:1rem;">
                            <div class="expert-input-group">
                                <input type="text" id="alertTitle" class="expert-input" placeholder="العنوان" style="border-color:var(--danger-ruby);">
                            </div>
                            <div class="expert-input-group">
                                <textarea id="alertMessage" class="expert-input" placeholder="النص..." style="height:80px; border-color:var(--danger-ruby);"></textarea>
                            </div>
                            <button type="submit" class="btn-gold" style="width:100%; background:var(--danger-ruby); border:none; box-shadow:none;">إرسال للجميع</button>
                        </form>
                     </div>

                     <div class="expert-card">
                        <h3 class="text-gold font-heading">رسالة اليوم (MOTD)</h3>
                        <form id="motdForm" style="margin-top:1rem;">
                            <div class="expert-input-group">
                                <input type="text" id="motdTitle" class="expert-input" placeholder="العنوان">
                            </div>
                            <div class="expert-input-group">
                                <textarea id="motdMessage" class="expert-input" placeholder="النص..." style="height:80px;"></textarea>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label style="cursor:pointer; color:white;">
                                    <input type="checkbox" id="motdActive"> تفعيل
                                </label>
                                <button type="submit" class="btn-outline-gold">تحديث</button>
                            </div>
                        </form>
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
                            <input type="text" class="expert-input" placeholder="رد على الطالبات..." required style="padding:10px;">
                            <button type="submit" class="btn-gold" style="border-radius:50%; width:45px; height:45px; padding:0; display:flex; align-items:center; justify-content:center;">➤</button>
                        </form>

                        <!-- Search Overlay -->
                        <div id="searchView" style="display:none; position:absolute; inset:0; background:var(--royal-obsidian); z-index:10; flex-direction:column; padding:20px;">
                             <h4 class="text-gold" style="margin-bottom:15px;">بحث عن طالبة</h4>
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
    }

    updateChatUI() {
        const body = document.getElementById('chatBody');
        const footer = document.getElementById('chatForm');
        if (!body) return;

        if (this.chatState.mode === 'GLOBAL') {
            const messages = this.chat.getMessages();
            footer.style.display = 'flex';
            body.innerHTML = this.renderMessages(messages, true);
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
                body.innerHTML = this.renderMessages(chat.messages, false);
            }
        }

        body.scrollTop = body.scrollHeight;
    }

    renderMessages(messages, allowDelete) {
         return messages.map(msg => {
            const isMe = msg.sender === this.user.name;
            const type = isMe ? 'outgoing' : 'incoming';
            return `
                <div class="msg-bubble ${type}" style="position:relative; padding-right:${allowDelete ? '30px' : '18px'};">
                    ${allowDelete ? `<span class="delete-msg" data-id="${msg.id}" style="position:absolute; top:5px; right:8px; color:var(--danger-ruby); cursor:pointer; font-weight:bold; font-size:14px;">✖</span>` : ''}
                    <div style="font-size:0.7rem; opacity:0.7; margin-bottom:5px;">${msg.sender}</div>
                    ${msg.text}
                </div>
            `;
        }).join('');
    }

    getAllStudents() {
        const students = [];
        const roster = DATA_STORE.STUDENT_ROSTER;

        Object.keys(roster).forEach(grade => {
            const gradeData = roster[grade];

            if (Array.isArray(gradeData)) {
                gradeData.forEach(name => {
                    const id = `${grade}_General_${name.replace(/\s+/g, '_')}`;
                    const authData = DATA_STORE.AUTH_DB[id] || {};
                    students.push({
                        name: name,
                        grade: grade,
                        section: 'General',
                        xp: authData.xp || 0,
                        registered: !!authData.contactValue
                    });
                });
            } else {
                Object.keys(gradeData).forEach(section => {
                    gradeData[section].forEach(name => {
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
            }
        });
        return students;
    }

    attachEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            appStore.setUser(null);
            Router.navigate('login');
        });

        // Load current MOTD
        const currentMotd = this.chat.getMOTD();
        if (currentMotd) {
            document.getElementById('motdTitle').value = currentMotd.title || '';
            document.getElementById('motdMessage').value = currentMotd.message || '';
            document.getElementById('motdActive').checked = currentMotd.active;
        }

        document.getElementById('motdForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.chat.setMOTD(
                document.getElementById('motdTitle').value,
                document.getElementById('motdMessage').value,
                document.getElementById('motdActive').checked
            );
            alert('تم التحديث.');
            sessionStorage.removeItem('motd_seen');
        });

        document.getElementById('alertForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('alertTitle').value;
            const message = document.getElementById('alertMessage').value;
            if(title && message) {
                this.chat.sendNotification('ALL', { type: 'alert', title, text: message });
                alert('تم الإرسال.');
                document.getElementById('alertForm').reset();
            }
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
                    if (name.includes(val)) matches.push(name);
                });
            };
            if (roster["10"]) scan(roster["10"]);
            Object.values(roster["11"]).forEach(scan);
            Object.values(roster["12"]).forEach(scan);

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

        document.getElementById('chatBody').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-msg')) {
                const id = parseInt(e.target.dataset.id);
                if (confirm('هل تريد الحذف؟')) {
                    this.chat.deleteMessage(id);
                }
            }
        });
    }

    startPrivateChat(targetName) {
        this.chat.initPrivateChat(this.user, targetName);
        const participants = [this.user.name, targetName].sort();
        const chatId = participants.join('_');
        this.chatState.activePrivateId = chatId;
        this.chatState.mode = 'PRIVATE_CHAT';
        this.updateChatUI();
    }
}
