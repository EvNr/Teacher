
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
        // Teacher doesn't receive notifications from herself usually, but good to verify
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
                <div style="display:flex; align-items:center; gap:20px;">
                    <!-- Notification Center (Read Only for Teacher) -->
                    <div class="notif-container" id="notifBtn">
                        <div class="notif-icon">🔔</div>
                    </div>
                    <div>
                        أ. صابرين | <button id="logoutBtn" style="background:none; border:none; color:#f0a500; cursor:pointer; font-weight:bold;">خروج</button>
                    </div>
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

                         <!-- Global Alert System -->
                         <div class="moe-card" style="background:linear-gradient(135deg, #d32f2f, #b71c1c); color:white;">
                            <h3 style="color:white; border-bottom-color:rgba(255,255,255,0.2);">🚨 إرسال تنبيه عاجل</h3>
                            <form id="alertForm" style="margin-top:1rem;">
                                <input type="text" id="alertTitle" placeholder="عنوان التنبيه" style="width:100%; margin-bottom:10px; padding:8px; border-radius:4px; border:none;">
                                <textarea id="alertMessage" placeholder="نص التنبيه (سيظهر كإشعار فوري للجميع)..." style="width:100%; height:60px; margin-bottom:10px; padding:8px; border-radius:4px; border:none;"></textarea>
                                <button type="submit" class="btn-moe" style="background:white; color:#b71c1c; border:none; padding:5px 15px; width:100%;">إرسال للجميع</button>
                            </form>
                         </div>

                         <!-- MOTD Manager -->
                         <div class="moe-card" style="background:linear-gradient(135deg, var(--moe-dark), var(--moe-green)); color:white;">
                            <h3 style="color:white; border-bottom-color:rgba(255,255,255,0.2);">📢 رسالة اليوم (MOTD)</h3>
                            <form id="motdForm" style="margin-top:1rem;">
                                <input type="text" id="motdTitle" placeholder="العنوان" style="width:100%; margin-bottom:10px; padding:8px; border-radius:4px; border:none;">
                                <textarea id="motdMessage" placeholder="نص الرسالة..." style="width:100%; height:60px; margin-bottom:10px; padding:8px; border-radius:4px; border:none;"></textarea>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <label style="font-size:0.9rem; cursor:pointer;">
                                        <input type="checkbox" id="motdActive" checked> تفعيل
                                    </label>
                                    <button type="submit" class="btn-moe" style="background:white; color:var(--moe-dark); border:none; padding:5px 15px;">تحديث</button>
                                </div>
                            </form>
                         </div>

                         <div class="moe-card">
                             <h3>📥 التقارير والإحصاءات</h3>
                             <button class="btn-outline" style="width:100%; margin-bottom:10px;">تصدير كشف الدرجات (PDF)</button>
                             <button class="btn-outline" style="width:100%;">تحليل النتائج (Excel)</button>
                         </div>
                    </div>

                </div>

                <!-- Chat Widget (Enhanced) -->
                <div class="chat-widget">
                    <div class="chat-window" id="chatWindow">
                        <div class="chat-header" id="chatHeader" style="background:linear-gradient(135deg, var(--moe-gold), var(--moe-dark));">
                            <span id="chatTitle">💬 غرفة المعلمة</span>
                            <div style="display:flex; gap:10px;">
                                <span style="font-size:0.8rem; cursor:pointer; display:none;" id="backToChatList">⬅️ عودة</span>
                                <span style="font-size:0.8rem; cursor:pointer;" id="closeChat">✖</span>
                            </div>
                        </div>

                         <!-- Tabs -->
                        <div style="display:flex; background:#f1f1f1; border-bottom:1px solid #ddd;">
                            <button class="tab-btn active" id="tabGlobal" style="flex:1; border:none; padding:10px; background:white; cursor:pointer; border-bottom:2px solid var(--moe-gold);">العام</button>
                            <button class="tab-btn" id="tabPrivate" style="flex:1; border:none; padding:10px; background:#f1f1f1; cursor:pointer; border-bottom:2px solid transparent;">الخاص</button>
                        </div>

                        <div class="chat-body" id="chatBody"></div>

                        <form class="chat-footer" id="chatForm">
                            <input type="text" class="chat-input" placeholder="رد على الطالبات..." required>
                            <button type="submit" class="btn-moe" style="border-radius:50%; width:40px; height:40px; padding:0; background:var(--moe-gold);">➤</button>
                        </form>

                         <!-- Search Modal (Hidden inside widget) -->
                        <div id="searchView" style="display:none; position:absolute; inset:50px 0 0 0; background:white; z-index:10; flex-direction:column; padding:15px;">
                             <input type="text" id="searchUser" placeholder="ابحث عن طالبة..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; margin-bottom:10px;">
                             <div id="searchResults" style="flex:1; overflow-y:auto;"></div>
                             <button id="closeSearch" style="margin-top:10px; padding:5px; background:#eee; border:none; cursor:pointer;">إلغاء</button>
                        </div>
                    </div>
                    <div class="chat-toggle-btn" id="toggleChat" style="background:var(--moe-gold);">💬</div>
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
            body.innerHTML = this.renderMessages(messages, true); // True = Allow Delete
        }
        else if (this.chatState.mode === 'PRIVATE_LIST') {
            const chats = this.chat.getPrivateChats();
            const myChats = Object.keys(chats).filter(id => chats[id].participants.includes(this.user.name));

            footer.style.display = 'none';
            body.innerHTML = `
                <button id="startNewChat" style="width:100%; padding:10px; background:var(--moe-gold); color:white; border:none; border-radius:4px; margin-bottom:10px;">+ محادثة جديدة</button>
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
                body.innerHTML = this.renderMessages(chat.messages, false); // No delete for private yet? Or yes? Keep false for simplicity for now.
            }
        }

        body.scrollTop = body.scrollHeight;
    }

    renderMessages(messages, allowDelete) {
         return messages.map(msg => {
            const isMe = msg.sender === this.user.name;
            const cls = isMe ? 'me' : (msg.role === 'teacher' ? 'teacher' : 'student');
            return `
                <div class="chat-msg ${cls}" style="position:relative; padding-right:${allowDelete ? '25px' : '15px'};">
                    ${allowDelete ? `<span class="delete-msg" data-id="${msg.id}" style="position:absolute; top:5px; right:5px; color:red; cursor:pointer; font-weight:bold; font-size:12px;">✖</span>` : ''}
                    <span class="msg-meta">${msg.sender} • ${msg.time}</span>
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
                // Grade 10 Logic (Flat Array)
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
                // Grade 11/12 Logic (Sections)
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

        // Save MOTD
        document.getElementById('motdForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('motdTitle').value;
            const message = document.getElementById('motdMessage').value;
            const active = document.getElementById('motdActive').checked;

            this.chat.setMOTD(title, message, active);
            alert('تم تحديث رسالة اليوم بنجاح!');

            // Clear "seen" status so everyone sees the new message
            sessionStorage.removeItem('motd_seen');
        });

        // Alert Form
        document.getElementById('alertForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('alertTitle').value;
            const message = document.getElementById('alertMessage').value;

            if(title && message) {
                this.chat.sendNotification('ALL', {
                    type: 'alert',
                    title: title,
                    text: message
                });
                alert('تم إرسال التنبيه لجميع الطالبات!');
                document.getElementById('alertForm').reset();
            }
        });

        // Chat Events (Updated with Tabs/Search)
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

        document.getElementById('backToChatList').addEventListener('click', () => {
            this.chatState.mode = 'PRIVATE_LIST';
            document.getElementById('chatTitle').textContent = '💬 غرفة المعلمة';
            document.getElementById('backToChatList').style.display = 'none';
            this.updateChatUI();
        });

        // Search
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
                <div class="search-item" style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;">${name}</div>
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

        // Send Message
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

        // Delete Message Event Delegation
        document.getElementById('chatBody').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-msg')) {
                const id = parseInt(e.target.dataset.id);
                if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                    this.chat.deleteMessage(id);
                }
            }
        });
    }

    startPrivateChat(targetName) {
        // Ensure chat exists
        this.chat.initPrivateChat(this.user, targetName);

        const participants = [this.user.name, targetName].sort();
        const chatId = participants.join('_');
        this.chatState.activePrivateId = chatId;
        this.chatState.mode = 'PRIVATE_CHAT';
        this.updateChatUI();
    }

    updateTabStyles(isGlobal) {
        const tG = document.getElementById('tabGlobal');
        const tP = document.getElementById('tabPrivate');
        tG.style.background = isGlobal ? 'white' : '#f1f1f1';
        tG.style.borderBottomColor = isGlobal ? 'var(--moe-gold)' : 'transparent';
        tP.style.background = !isGlobal ? 'white' : '#f1f1f1';
        tP.style.borderBottomColor = !isGlobal ? 'var(--moe-gold)' : 'transparent';

        if (isGlobal) {
            document.getElementById('chatTitle').textContent = '💬 غرفة المعلمة';
            document.getElementById('backToChatList').style.display = 'none';
        }
    }
}
