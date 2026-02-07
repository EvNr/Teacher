
/**
 * Chat System Core
 * Vision 2030 Edition: Real-time Communication Bridge.
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
                    if (this.callback) this.callback('UPDATE');
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

    initPrivateChat(sender, recipientName) {
        const participants = [sender.name, recipientName].sort();
        const chatId = participants.join('_');

        // We notify server to init if needed
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

    sendMessage(user, text) {
        const cleanText = this.filterProfanity(text);
        const msg = {
            sender: user.name,
            role: user.role || 'student',
            text: cleanText,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        // Send to Server
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

    filterProfanity(text) {
        const badWords = ['badword', 'stupid', 'ghabi', 'kalb', 'hmar', 'كلب', 'حمار', 'غبي'];
        let cleanText = text;
        badWords.forEach(word => {
            const reg = new RegExp(word, 'gi');
            cleanText = cleanText.replace(reg, '***');
        });
        return cleanText;
    }
}
