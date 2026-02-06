
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
    // Apply Security Layers
    initSecurity();

    // Simulate Initial Secure Handshake
    setTimeout(() => {
        new Router(routes);
    }, 1200);
});

function initSecurity() {
    // 1. Disable Right Click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Disable Copy/Cut/Paste
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());

    // 3. Disable Dragging
    document.addEventListener('dragstart', (e) => e.preventDefault());

    // 4. Disable Selection Keys (Ctrl+A, Ctrl+C, etc)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'c' || e.key === 'x' || e.key === 'u')) {
            e.preventDefault();
        }
    });

    // Console Warning (Psychological Layer)
    console.log("%c⚠️ Security Alert", "color:red; font-size:20px; font-weight:bold;");
    console.log("%cThis application is protected by intellectual property laws. Unauthorized access or copying is prohibited.", "color:black; font-size:12px;");
}
