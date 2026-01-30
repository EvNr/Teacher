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

// User Session Management & Auto-Logout
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Auto Logout Logic
let activityTimer;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 Minutes

function resetActivityTimer() {
    clearTimeout(activityTimer);
    if (localStorage.getItem('currentUser')) {
        activityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
    }
}

function logoutUser() {
    alert('⚠️ تم تسجيل الخروج تلقائياً لعدم النشاط حفاظاً على أمانك.');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

if (localStorage.getItem('currentUser')) {
    // Attach event listeners for activity
    window.onload = resetActivityTimer;
    document.onmousemove = resetActivityTimer;
    document.onkeypress = resetActivityTimer;
    document.onclick = resetActivityTimer;
}

// Authentication Logic
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullname').value;
        const grade = document.getElementById('grade').value;
        const email = document.getElementById('email').value;

        // Create simplified user key for mock persistence
        const userKey = email.split('@')[0];

        const userData = {
            name: name,
            grade: grade,
            email: email,
            id: userKey
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));

        alert('تم إنشاء الحساب بنجاح! مرحباً بك يا ' + name);
        window.location.href = 'resources.html';
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Check against MOCK_USERS
        if (typeof MOCK_USERS !== 'undefined' && MOCK_USERS[email]) {
            const user = MOCK_USERS[email];
            if (password === user.password) {
                // Login Success
                const userKey = email.split('@')[0];
                const userData = {
                    name: user.name,
                    grade: user.grade,
                    email: user.email,
                    id: userKey
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                window.location.href = 'resources.html';
                return;
            } else {
                alert('❌ كلمة المرور غير صحيحة');
                return;
            }
        }

        // Fallback for demo/registration
        alert('❌ البريد الإلكتروني غير مسجل في النظام');
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

    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) {
        container.innerHTML = '<div class="alert">يرجى تسجيل الدخول للوصول إلى المحتوى التعليمي. <a href="login.html">تسجيل الدخول</a></div>';
        return;
    }

    const userGrade = user.grade;

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
        <h1>مرحباً ${user.name || ''}</h1>
        <h2>${data.title}</h2>
        <p class="subtitle">${data.subtitle || 'محتوى مخصص لمنهج 1447'}</p>
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

    // Render Question Bank (Interactive Quiz Mode)
    const quizSection = document.createElement('div');
    quizSection.className = 'section-block';
    quizSection.style.marginTop = '3rem';
    quizSection.innerHTML = `
        <h3>🧠 الاختبار التفاعلي</h3>
        <div class="quiz-container fade-in">
            <div class="quiz-header">
                <span id="quiz-progress">السؤال 1 / ${data.quizzes.length}</span>
                <span id="quiz-score">النقاط: 0</span>
            </div>
            <div id="quiz-content">
                <!-- Dynamic Quiz Content -->
            </div>
        </div>
    `;

    // Render Challenges
    const challengeSection = document.createElement('div');
    challengeSection.className = 'section-block';
    challengeSection.style.marginTop = '3rem';
    challengeSection.innerHTML = '<h3>🏆 التحديات اليومية</h3><div class="card-grid"></div>';
    const cGrid = challengeSection.querySelector('.card-grid');

    if (data.challenges) {
        data.challenges.forEach(ch => {
            const card = document.createElement('div');
            card.className = 'resource-card challenge-card fade-in';

            // Check if solved (simple check for now)
            const isSolved = false;

            card.innerHTML = `
                <div class="challenge-badge">${ch.difficulty}</div>
                <h4>${ch.title}</h4>
                <p class="challenge-desc">${ch.description}</p>
                <div class="xp-reward">+${ch.xp} XP</div>

                <div class="challenge-actions">
                    <button class="btn btn-secondary btn-sm show-solution-btn">عرض الحل</button>
                </div>

                <div class="solution-box hidden">
                    <h5>💡 الحل النموذجي:</h5>
                    <div class="solution-content">${ch.solution}</div>
                    <button class="btn btn-primary btn-sm mark-done-btn" data-xp="${ch.xp}">تسجيل كمنجز (+XP)</button>
                </div>
            `;
            cGrid.appendChild(card);
        });

        // Bind Challenge Events
        challengeSection.querySelectorAll('.show-solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const solutionBox = e.target.parentElement.nextElementSibling;
                solutionBox.classList.toggle('hidden');
                e.target.textContent = solutionBox.classList.contains('hidden') ? 'عرض الحل' : 'إخفاء الحل';
            });
        });

        challengeSection.querySelectorAll('.mark-done-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const xp = parseInt(e.target.dataset.xp);
                addXP(xp);
                e.target.disabled = true;
                e.target.textContent = 'تم الإنجاز ✅';
                // Hide solution button as well to clean up
                e.target.parentElement.previousElementSibling.style.display = 'none';
            });
        });
    }

    // Replace the main grid
    container.classList.remove('resources-grid');
    container.innerHTML = ''; // Clear properly
    container.appendChild(curriculumSection);
    container.appendChild(challengeSection);
    container.appendChild(quizSection);

    // Initialize Quiz
    initQuiz(data.quizzes, quizSection.querySelector('#quiz-content'));
}

function initQuiz(questions, container) {
    let current = 0;
    let score = 0;

    function renderQuestion() {
        if (current >= questions.length) {
            // Calculate XP (100 per correct answer)
            const earnedXP = score * 100;
            if (earnedXP > 0) addXP(earnedXP);

            container.innerHTML = `
                <div class="quiz-result">
                    <h4>🎉 اكتمل الاختبار!</h4>
                    <p>النتيجة النهائية: ${score} / ${questions.length}</p>
                    <p style="color:#f39c12; font-weight:bold; margin:10px 0;">+${earnedXP} XP مكتسبة</p>
                    <button class="btn btn-primary" onclick="location.reload()">إعادة المحاولة</button>
                </div>
            `;
            return;
        }

        const q = questions[current];
        container.innerHTML = `
            <h4 class="quiz-question">${q.question}</h4>
            <div class="options-grid">
                ${q.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}">${opt}</button>
                `).join('')}
            </div>
            <div id="feedback" class="feedback hidden"></div>
            <button id="next-btn" class="btn btn-primary hidden" style="margin-top:1rem">التالي &larr;</button>
        `;

        // Bind Events
        const opts = container.querySelectorAll('.option-btn');
        const feedback = container.querySelector('#feedback');
        const nextBtn = container.querySelector('#next-btn');

        opts.forEach(btn => {
            btn.addEventListener('click', () => {
                // Disable all buttons
                opts.forEach(b => b.disabled = true);

                const selected = parseInt(btn.dataset.index);
                const isCorrect = selected === q.correct;

                if (isCorrect) {
                    btn.classList.add('correct');
                    feedback.innerHTML = `✅ <strong>إجابة صحيحة!</strong> <br> ${q.explanation}`;
                    feedback.className = 'feedback correct fade-in';
                    score++;
                    document.getElementById('quiz-score').textContent = `النقاط: ${score}`;
                } else {
                    btn.classList.add('wrong');
                    opts[q.correct].classList.add('correct'); // Show correct one
                    feedback.innerHTML = `❌ <strong>إجابة خاطئة!</strong> <br> ${q.explanation}`;
                    feedback.className = 'feedback wrong fade-in';
                }

                nextBtn.classList.remove('hidden');
            });
        });

        nextBtn.addEventListener('click', () => {
            current++;
            document.getElementById('quiz-progress').textContent = `السؤال ${Math.min(current + 1, questions.length)} / ${questions.length}`;
            renderQuestion();
        });
    }

    renderQuestion();
}

// User XP Management (User Specific)
function addXP(amount) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const xpKey = `xp_${user.id}`;
    let currentXP = parseInt(localStorage.getItem(xpKey) || '0');
    currentXP += amount;

    localStorage.setItem(xpKey, currentXP);
    updateNav();

    // Custom non-intrusive notification instead of alert
    showToast(`🎉 أحسنت! كسبت ${amount} نقطة XP!`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Check Login State for Nav
function updateNav() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');

    if (user && loginLink) {
        const xpKey = `xp_${user.id}`;
        const userXP = localStorage.getItem(xpKey) || '0';

        // Display Name and XP
        loginLink.innerHTML = `
            <span style="color:var(--secondary-color); font-weight:bold; margin-left:10px;">⭐ ${userXP} XP</span>
            👤 ${user.name}
        `;

        loginLink.href = '#';
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });

        if (registerLink) {
            registerLink.style.display = 'none';
        }
    }
}

updateNav();
