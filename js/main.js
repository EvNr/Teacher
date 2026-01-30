document.addEventListener('DOMContentLoaded', () => {
    console.log('Sabreen Math Academy Initialized');

    // Theme Management
    initTheme();

    // Animations
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        if(themeBtn) themeBtn.textContent = '☀️';
    }

    // Randomize Accent/Secondary Color on Session Start
    const colors = ['#3498db', '#e74c3c', '#9b59b6', '#2ecc71', '#f39c12'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--secondary-color', randomColor);

    // Event Listener for Toggle
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                themeBtn.textContent = '☀️';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                themeBtn.textContent = '🌓';
            }
        });
    }
}

// User Session Management
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullname').value;
        const grade = document.getElementById('grade').value;

        localStorage.setItem('userName', name);
        localStorage.setItem('userGrade', grade);

        alert('تم إنشاء الحساب بنجاح! مرحباً بك يا ' + name);
        window.location.href = 'resources.html';
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Mock Login - accepts any input for demo, but we need to know the grade
        // Since we don't have a real DB, we'll ask the user to 're-confirm' grade or just use a default if not found
        // For this demo, we'll simulate a login that sets a session.

        // Check if we have a stored user, if not, prompt or just mock it
        const email = document.getElementById('email').value;

        // For demonstration purposes, if no user is found, we assume a default grade 12 (3rd Secondary)
        // Or we can rely on what was registered.
        let grade = localStorage.getItem('userGrade');
        if (!grade) {
            grade = "12"; // Default fallback
            localStorage.setItem('userGrade', grade);
            localStorage.setItem('userName', 'Student');
        }

        window.location.href = 'resources.html';
    });
}

// Resources Page Logic
if (window.location.pathname.includes('resources.html')) {
    loadResources();
}

function loadResources() {
    const container = document.querySelector('.resources-grid');
    const header = document.querySelector('.resources-header');

    if (!container || !header) return;

    const userGrade = localStorage.getItem('userGrade');
    const userName = localStorage.getItem('userName');

    if (!userGrade) {
        container.innerHTML = '<div class="alert">يرجى تسجيل الدخول للوصول إلى المحتوى التعليمي. <a href="login.html">تسجيل الدخول</a></div>';
        return;
    }

    // Load Data from global ACADEMY_DATA
    if (typeof ACADEMY_DATA === 'undefined') {
        console.error("Data not loaded");
        return;
    }

    const data = ACADEMY_DATA[userGrade];
    if (!data) {
        container.innerHTML = '<p>عذراً، لا يوجد محتوى متاح لهذه المرحلة حالياً.</p>';
        return;
    }

    // Update Header
    header.innerHTML = `
        <h1>مرحباً ${userName || ''}</h1>
        <h2>${data.title}</h2>
        <p>محتوى مخصص لمنهج 1447</p>
    `;

    // Clear Container
    container.innerHTML = '';

    // Render Curriculum
    const curriculumSection = document.createElement('div');
    curriculumSection.className = 'section-block';
    curriculumSection.innerHTML = '<h3>📚 المنهج الدراسي</h3><div class="card-grid"></div>';
    const currGrid = curriculumSection.querySelector('.card-grid');

    data.curriculum.forEach(item => {
        const card = document.createElement('div');
        card.className = 'resource-card fade-in';
        card.innerHTML = `
            <div class="resource-icon">${item.type === 'video' ? '🎥' : '📄'}</div>
            <h4>${item.title}</h4>
            <a href="${item.link}" class="btn-text">عرض المحتوى &larr;</a>
        `;
        currGrid.appendChild(card);
    });

    // Render Question Bank
    const questionSection = document.createElement('div');
    questionSection.className = 'section-block';
    questionSection.style.marginTop = '3rem';
    questionSection.innerHTML = '<h3>📝 بنك الأسئلة</h3><div class="card-grid"></div>';
    const qGrid = questionSection.querySelector('.card-grid');

    data.questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'resource-card fade-in';
        card.innerHTML = `
            <div class="resource-icon">❓</div>
            <h4>سؤال ${index + 1}</h4>
            <p>${q.q}</p>
            <button class="btn btn-primary btn-sm show-answer">عرض الإجابة</button>
            <p class="answer hidden" style="margin-top:10px; color:var(--secondary-color); font-weight:bold;">${q.a}</p>
        `;

        card.querySelector('.show-answer').addEventListener('click', (e) => {
            const ans = e.target.nextElementSibling;
            ans.classList.toggle('hidden');
            e.target.textContent = ans.classList.contains('hidden') ? 'عرض الإجابة' : 'إخفاء الإجابة';
        });

        qGrid.appendChild(card);
    });

    // Replace the main grid with our new sections
    // We need to change the CSS of .resources-grid or replace it
    container.classList.remove('resources-grid');
    container.appendChild(curriculumSection);
    container.appendChild(questionSection);
}

// Check Login State for Nav
function updateNav() {
    const userName = localStorage.getItem('userName');
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (userName && loginLink) {
        loginLink.textContent = '👤 ' + userName;
        loginLink.href = '#';
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('userName');
                localStorage.removeItem('userGrade');
                window.location.reload();
            }
        });

        if (registerLink) {
            registerLink.style.display = 'none';
        }
    }
}

updateNav();
