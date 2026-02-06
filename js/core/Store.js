
/**
 * Application State Container
 * Manages user session and transient UI state.
 */
export class Store {
    constructor() {
        this.state = {
            user: null, // User object or null
            theme: localStorage.getItem('theme') || 'light',
            qiyasMode: false
        };
        this.listeners = [];

        // Hydrate from Storage if valid session exists
        this.hydrate();
    }

    hydrate() {
        const storedUser = sessionStorage.getItem('moe_session');
        if (storedUser) {
            try {
                // Unicode-safe decode
                const json = decodeURIComponent(escape(atob(storedUser)));
                this.state.user = JSON.parse(json);
            } catch (e) {
                sessionStorage.removeItem('moe_session');
            }
        }
    }

    subscribe(fn) {
        this.listeners.push(fn);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.state));
    }

    setUser(user) {
        this.state.user = user;
        if (user) {
            // Unicode-safe encode
            const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(user))));
            sessionStorage.setItem('moe_session', base64);
        } else {
            sessionStorage.removeItem('moe_session');
        }
        this.notify();
    }
}

export const appStore = new Store();
