
/**
 * SPA Router for MoE Portal
 * Handles navigation without page reloads.
 */
export class Router {
    constructor(routes) {
        this.routes = routes; // Map of 'path' -> Callback
        this.root = document.getElementById('app');
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Init
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const route = this.routes[hash] || this.routes['404'];

        if (route) {
            // Visual Transition
            this.root.classList.add('fade-out');
            setTimeout(() => {
                this.root.innerHTML = '';
                route(this.root);
                this.root.classList.remove('fade-out');
                this.root.classList.add('fade-in');
            }, 300);
        }
    }

    static navigate(path) {
        window.location.hash = path;
    }
}
