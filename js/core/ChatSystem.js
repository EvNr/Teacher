
import { DATA_STORE } from './DataStore.js';

/**
 * Chat System Core
 * Handles message persistence and cross-tab synchronization via LocalStorage.
 */
export class ChatSystem {
    constructor(callback) {
        this.callback = callback; // Function to update UI
        this.storageKey = 'SABREEN_CHAT_DB';
        this.motdKey = 'SABREEN_MOTD_DB';
        this.privateKey = 'SABREEN_PRIVATE_DB';
        this.notifKey = 'SABREEN_NOTIF_DB';

        // Initialize if empty
        if (!localStorage.getItem(this.storageKey)) localStorage.setItem(this.storageKey, JSON.stringify(DATA_STORE.CHAT_MESSAGES));
        if (!localStorage.getItem(this.motdKey)) localStorage.setItem(this.motdKey, JSON.stringify(DATA_STORE.MOTD));
        if (!localStorage.getItem(this.privateKey)) localStorage.setItem(this.privateKey, JSON.stringify({}));
        if (!localStorage.getItem(this.notifKey)) localStorage.setItem(this.notifKey, JSON.stringify([]));

        // Listen for cross-tab updates
        window.addEventListener('storage', (e) => {
            if ([this.storageKey, this.privateKey, this.notifKey].includes(e.key)) {
                this.notify(e.key);
            }
        });
    }

    getMessages() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    getPrivateChats() {
        return JSON.parse(localStorage.getItem(this.privateKey) || '{}');
    }

    initPrivateChat(sender, recipientName) {
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');
        const db = this.getPrivateChats();

        if (!db[chatId]) {
            db[chatId] = { participants, messages: [] };
            localStorage.setItem(this.privateKey, JSON.stringify(db));
            this.notify(this.privateKey);
        }
        return chatId;
    }

    getNotifications() {
        return JSON.parse(localStorage.getItem(this.notifKey) || '[]');
    }

    sendMessage(user, text) {
        const msgs = this.getMessages();

        // Basic Profanity Filter (Arabic & English)
        const badWords = ['badword', 'stupid', 'ghabi', 'kalb', 'hmar']; // Placeholder list
        let cleanText = text;
        badWords.forEach(word => {
            const reg = new RegExp(word, 'gi');
            cleanText = cleanText.replace(reg, '***');
        });

        const newMsg = {
            id: Date.now(),
            sender: user.name,
            role: user.role || 'student', // 'teacher' or 'student'
            text: cleanText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        msgs.push(newMsg);
        localStorage.setItem(this.storageKey, JSON.stringify(msgs));

        // Direct notify for current tab
        this.notify(this.storageKey);
        return newMsg;
    }

    sendPrivateMessage(sender, recipientName, text) {
        // Generate Chat ID: Alphabetically sorted names ensure unique ID for the pair
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

        const db = this.getPrivateChats();
        if (!db[chatId]) {
            db[chatId] = { participants, messages: [] };
        }

        const newMsg = {
            id: Date.now(),
            sender: sender.name,
            text: this.filterProfanity(text),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };

        db[chatId].messages.push(newMsg);
        localStorage.setItem(this.privateKey, JSON.stringify(db));

        // Send Notification to Recipient
        this.sendNotification(recipientName, {
            type: 'message',
            title: `رسالة من ${sender.name}`,
            text: text,
            link: 'chat',
            chatId: chatId
        });

        this.notify(this.privateKey);
    }

    sendNotification(targetUser, data) {
        // targetUser 'ALL' means global
        const notifs = this.getNotifications();
        const newNotif = {
            id: Date.now(),
            target: targetUser, // 'ALL' or Username
            type: data.type, // 'message', 'alert'
            title: data.title,
            text: data.text,
            chatId: data.chatId || null,
            time: new Date().toLocaleString(),
            read: false
        };

        notifs.unshift(newNotif); // Add to top
        // Limit history to 50
        if (notifs.length > 50) notifs.pop();

        localStorage.setItem(this.notifKey, JSON.stringify(notifs));
        this.notify(this.notifKey);
    }

    deleteMessage(id) {
        let msgs = this.getMessages();
        msgs = msgs.filter(m => m.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(msgs));
        this.notify(this.storageKey);
    }

    filterProfanity(text) {
        const badWords = ['badword', 'stupid', 'ghabi', 'kalb', 'hmar'];
        let cleanText = text;
        badWords.forEach(word => {
            const reg = new RegExp(word, 'gi');
            cleanText = cleanText.replace(reg, '***');
        });
        return cleanText;
    }

    notify(key) {
        if (this.callback) this.callback(key);
    }

    // --- MOTD Logic ---

    getMOTD() {
        return JSON.parse(localStorage.getItem(this.motdKey));
    }

    setMOTD(title, message, active = true) {
        const motd = {
            title,
            message,
            active,
            date: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem(this.motdKey, JSON.stringify(motd));
    }
}
