
import { DATA_STORE } from './DataStore.js';

/**
 * Chat System Core
 * Refactored to use PHP Backend for real cross-device communication.
 */
export class ChatSystem {
    constructor(callback) {
        this.callback = callback; // Function to update UI
        this.storageKey = 'SABREEN_CHAT_DB';
        this.privateKey = 'SABREEN_PRIVATE_DB';
        this.cache = {
            global: [],
            private: {},
            motd: { active: false },
            alerts: []
        };

        // Initial Fetch
        this.poll();

        // Start Polling (every 3 seconds)
        this.poller = setInterval(() => this.poll(), 3000);
    }

    async poll() {
        try {
            const res = await fetch('api/chat_read.php?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();

                // Check for changes to trigger update
                const hashStart = JSON.stringify(this.cache);
                const hashEnd = JSON.stringify(data);

                this.cache = data;

                if (hashStart !== hashEnd) {
                    this.notify(this.storageKey);
                    this.notify(this.privateKey);
                }
            }
        } catch (e) {
            console.error('Chat Poll Error:', e);
        }
    }

    getMessages() {
        return this.cache.global || [];
    }

    getPrivateChats() {
        return this.cache.private || {};
    }

    initPrivateChat(sender, recipientName) {
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

        // We notify server to init if needed, but mostly we just need the local ID
        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'PRIVATE',
                action: 'INIT',
                chatId: chatId,
                participants: participants
            })
        });

        return chatId;
    }

    getNotifications() {
        // Return global alerts
        return this.cache.alerts || [];
    }

    sendMessage(user, text) {
        const cleanText = this.filterProfanity(text);
        const msg = {
            sender: user.name,
            role: user.role || 'student',
            text: cleanText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic UI Update
        // this.cache.global.push(msg); // Optional: wait for server is safer for consistency
        // this.notify(this.storageKey);

        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'GLOBAL',
                payload: msg
            })
        }).then(() => this.poll());

        return msg;
    }

    sendPrivateMessage(sender, recipientName, text) {
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

        const cleanText = this.filterProfanity(text);
        const msg = {
            sender: sender.name,
            text: cleanText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };

        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'PRIVATE',
                chatId: chatId,
                participants: participants,
                payload: msg
            })
        }).then(() => this.poll());
    }

    sendNotification(targetUser, data) {
        if (targetUser === 'ALL') {
            fetch('api/announcements_write.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: 'ALERT',
                    payload: {
                        target: 'ALL',
                        title: data.title,
                        text: data.text,
                        time: new Date().toLocaleString()
                    }
                })
            }).then(() => this.poll());
        }
        // Private notifications are handled implicitly by chat updates
    }

    deleteMessage(id) {
        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'GLOBAL',
                action: 'DELETE',
                id: id
            })
        }).then(() => this.poll());
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
        return this.cache.motd || {};
    }

    setMOTD(title, message, active = true) {
        const motd = {
            title,
            message,
            active,
            date: new Date().toISOString().split('T')[0]
        };

        fetch('api/announcements_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'MOTD',
                payload: motd
            })
        }).then(() => this.poll());
    }
}
