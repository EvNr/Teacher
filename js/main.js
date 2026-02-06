
import { Router } from './core/Router.js';
import { appStore } from './core/Store.js';
import { LoginView } from './modules/LoginView.js';
import { DashboardView } from './modules/DashboardView.js';
import { TeacherView } from './modules/TeacherView.js';
import { ExamView } from './modules/ExamView.js';

// Define Routes
const routes = {
    'home': (container) => {
        // Redirect based on auth
        if (appStore.state.user) {
            if (appStore.state.user.role === 'teacher') Router.navigate('teacher');
            else Router.navigate('dashboard');
        } else {
            Router.navigate('login');
        }
    },
    'login': (container) => {
        new LoginView(container);
    },
    'dashboard': (container) => {
        if (!appStore.state.user) return Router.navigate('login');
        new DashboardView(container);
    },
    'teacher': (container) => {
        if (!appStore.state.user || appStore.state.user.role !== 'teacher') return Router.navigate('login');
        new TeacherView(container);
    },
    'exam': (container) => {
        if (!appStore.state.user) return Router.navigate('login');
        new ExamView(container);
    },
    '404': (container) => {
        container.innerHTML = '<h1>404 - Not Found</h1>';
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Simulate Initial Secure Handshake
    setTimeout(() => {
        new Router(routes);
    }, 1200);
});
