
/**
 * Chat System Core
 * Vision 2030 Edition: Real-time Communication & Notification Bridge.
 */
export class ChatSystem {
    constructor(callback) {
        this.callback = callback; // Function to update UI
        this.cache = {
            global: [],
            private: {},
            motd: { active: false },
            alerts: []
        };
        this.lastAlertTime = Date.now(); // Ignore alerts from before session start
        this.lastSeenPrivateCount = 0;

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

                // Detect New Alerts
                if (data.alerts && data.alerts.length > 0) {
                    const latestAlert = data.alerts[data.alerts.length - 1];
                    const alertTime = new Date(latestAlert.date).getTime();

                    if (alertTime > this.lastAlertTime) {
                        this.lastAlertTime = alertTime;
                        if (this.callback) this.callback('NEW_ALERT', latestAlert);
                    }
                }

                // Check for changes to trigger update
                const hashStart = JSON.stringify(this.cache);
                const hashEnd = JSON.stringify(data);

                this.cache = data;

                if (hashStart !== hashEnd) {
                    if (this.callback) this.callback('UPDATE', data);
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

    getMOTD() {
        return this.cache.motd || {};
    }

    getRecentAlerts() {
        return (this.cache.alerts || []).slice(-5).reverse();
    }

    // --- Actions ---

    initPrivateChat(sender, recipientName) {
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

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

    sendPrivateMessage(sender, recipientName, text) {
        const cleanText = this.filterProfanity(text);
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

        const msg = {
            sender: sender.name,
            text: cleanText,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'PRIVATE',
                action: 'SEND',
                chatId: chatId,
                payload: msg
            })
        }).then(() => this.poll());

        return msg;
    }

    sendMessage(user, text) {
        const cleanText = this.filterProfanity(text);
        const msg = {
            sender: user.name,
            role: user.role || 'student',
            text: cleanText,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

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

    sendAlert(title, message) {
        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'ALERT',
                payload: {
                    title,
                    message,
                    date: new Date().toISOString()
                }
            })
        });
    }

    setMOTD(title, message, active) {
        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'MOTD',
                payload: { title, message, active, date: new Date().toISOString() }
            })
        });
    }

    deleteMessage(index) {
        this.cache.global.splice(index, 1);
        fetch('api/chat_write.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                type: 'OVERWRITE',
                payload: { global: this.cache.global }
            })
        });
    }

    filterProfanity(text) {
        const badWords = ['badword', 'stupid', 'ghabi', 'kalb', 'hmar', 'كلب', 'حمار', 'غبي'];
        let cleanText = text;
        badWords.forEach(word => {
            const reg = new RegExp(word, 'gi');
            cleanText = cleanText.replace(reg, '***');
        });
        return cleanText;
    }

    /**
     * Security Helper: Escape HTML
     * Prevents Stored XSS in chat messages.
     */
    escapeHtml(unsafe) {
        if (!unsafe) return "";
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
}
