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

        // 1. Check Teacher Login
        if (typeof TEACHER_USER !== 'undefined' && email === TEACHER_USER.email) {
            if (password === TEACHER_USER.password) {
                localStorage.setItem('teacherSession', 'true');
                window.location.href = 'teacher.html';
                return;
            } else {
                alert('❌ كلمة المرور غير صحيحة');
                return;
            }
        }

        // 2. Check Student Login
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

    // Render Standardized Tests (Qudrat & Tahsili)
    const standardizedSection = document.createElement('div');
    standardizedSection.className = 'section-block';
    standardizedSection.innerHTML = '<h3>🎓 اختبارات القدرات والتحصيلي</h3><div class="card-grid"></div>';
    const stdGrid = standardizedSection.querySelector('.card-grid');

    if (typeof STANDARDIZED_TESTS !== 'undefined') {
        Object.keys(STANDARDIZED_TESTS).forEach(key => {
            const test = STANDARDIZED_TESTS[key];
            const card = document.createElement('div');
            card.className = 'resource-card fade-in';
            // Only show Tahsili for Grade 11 & 12, Qudrat for everyone (or specifically 11/12 too, but let's show for all as practice)
            // Or just show all for everyone as requested "mock tests"

            card.innerHTML = `
                <div class="resource-icon">⏱️</div>
                <h4>${test.title}</h4>
                <p>${test.description}</p>
                <div class="xp-reward">مدة الاختبار: ${test.duration} دقيقة</div>
                <button class="btn btn-primary btn-sm start-test-btn" data-test="${key}">بدء الاختبار التجريبي</button>
            `;
            stdGrid.appendChild(card);
        });

        // Bind Start Test Buttons
        standardizedSection.querySelectorAll('.start-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testKey = e.target.dataset.test;
                const testData = STANDARDIZED_TESTS[testKey];
                startStandardizedTest(testData);
            });
        });
    }

    // Render Curriculum
    const curriculumSection = document.createElement('div');
    curriculumSection.className = 'section-block';
    curriculumSection.style.marginTop = '3rem';
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

            // Random time remaining for "Temporary" feel (1-24 hours)
            const hoursLeft = Math.floor(Math.random() * 12) + 1;

            card.innerHTML = `
                <div class="challenge-badge">${ch.difficulty}</div>
                <div class="time-badge">⏳ متبقي ${hoursLeft} ساعة</div>
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
    container.appendChild(standardizedSection); // Add Standardized Tests first
    container.appendChild(curriculumSection);
    container.appendChild(challengeSection);
    container.appendChild(quizSection);

    // Initialize Quiz
    initQuiz(data.quizzes, quizSection.querySelector('#quiz-content'));
}

// --- Qiyas Simulation Engine (Mock Qudrat/Tahsili) ---
function startStandardizedTest(testData) {
    const container = document.getElementById('app');
    if (!container) return;

    // Apply Qiyas Mode Styling to Body
    document.body.classList.add('qiyas-mode-body');
    // Hide Standard Header/Footer
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Initialize State
    let current = 0;
    let answers = new Array(testData.questions.length).fill(null);
    let flagged = new Array(testData.questions.length).fill(false);
    let timeLeft = testData.duration * 60; // seconds
    let timerInterval;

    // Render Layout
    container.innerHTML = `
        <div class="qiyas-container fade-in">
            <!-- Sidebar: Navigation Grid -->
            <aside class="qiyas-sidebar">
                <h4>قائمة الأسئلة (${testData.questions.length})</h4>
                <div class="question-nav-grid" id="nav-grid">
                    ${testData.questions.map((_, i) => `
                        <div class="nav-dot" data-index="${i}">${i + 1}</div>
                    `).join('')}
                </div>
                <div style="margin-top:auto;">
                    <div style="display:flex; align-items:center; gap:5px; margin-bottom:5px;"><span style="width:10px; height:10px; background:#2ecc71; display:inline-block; border-radius:50%;"></span> مجاب</div>
                    <div style="display:flex; align-items:center; gap:5px; margin-bottom:5px;"><span style="width:10px; height:10px; background:#f1c40f; display:inline-block; border-radius:50%;"></span> مراجع</div>
                    <div style="display:flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; background:#eee; display:inline-block; border-radius:50%;"></span> غير مجاب</div>
                </div>
            </aside>

            <!-- Main: Question Area -->
            <main class="qiyas-main">
                <div class="qiyas-header">
                    <h2>${testData.title}</h2>
                    <div class="timer-box" id="qiyas-timer">⏳ --:--</div>
                </div>

                <div class="question-area" id="question-area">
                    <!-- Dynamic Question Render -->
                </div>

                <div class="qiyas-footer">
                    <div>
                        <button class="control-btn btn-prev" id="btn-prev">السابق</button>
                        <button class="control-btn btn-flag" id="btn-flag">⚑ مراجعة</button>
                    </div>
                    <div>
                        <button class="control-btn btn-next" id="btn-next">التالي</button>
                        <button class="control-btn btn-submit" id="btn-submit" style="display:none; margin-right:10px;">إنهاء الاختبار</button>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Timer Logic
    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('qiyas-timer');
        if (timerEl) timerEl.textContent = `⏳ ${m}:${s}`;

        if (timeLeft <= 0) {
            finishExam(true);
        }
    }, 1000);

    // Render Function
    function renderQuestion(idx) {
        current = idx;
        const q = testData.questions[current];
        const area = document.getElementById('question-area');

        area.innerHTML = `
            <div class="q-number">سؤال ${current + 1}</div>
            <div class="q-text">${q.question}</div>
            <div class="qiyas-options">
                ${q.options.map((opt, i) => `
                    <div class="qiyas-option ${answers[current] === i ? 'selected' : ''}" data-val="${i}">
                        <div class="radio-circle"></div>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Update Nav Grid
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === current) dot.classList.add('active');

            dot.classList.remove('answered');
            if (answers[i] !== null) dot.classList.add('answered');

            dot.classList.remove('flagged');
            if (flagged[i]) dot.classList.add('flagged');
        });

        // Update Buttons
        document.getElementById('btn-prev').disabled = current === 0;
        document.getElementById('btn-next').style.display = current === testData.questions.length - 1 ? 'none' : 'inline-block';
        document.getElementById('btn-submit').style.display = current === testData.questions.length - 1 ? 'inline-block' : 'none';

        // Update Flag Button Text
        const flagBtn = document.getElementById('btn-flag');
        flagBtn.innerHTML = flagged[current] ? '⚑ إلغاء المراجعة' : '⚑ مراجعة';

        // Bind Option Clicks
        area.querySelectorAll('.qiyas-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = parseInt(opt.dataset.val);
                answers[current] = val;
                renderQuestion(current); // Re-render to show selection
            });
        });
    }

    // Event Listeners
    document.getElementById('btn-next').addEventListener('click', () => {
        if (current < testData.questions.length - 1) renderQuestion(current + 1);
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (current > 0) renderQuestion(current - 1);
    });

    document.getElementById('btn-flag').addEventListener('click', () => {
        flagged[current] = !flagged[current];
        renderQuestion(current);
    });

    document.getElementById('btn-submit').addEventListener('click', () => {
        if(confirm('هل أنت متأكد من إنهاء الاختبار وتسليم الإجابة؟')) {
            finishExam(false);
        }
    });

    document.getElementById('nav-grid').addEventListener('click', (e) => {
        if(e.target.classList.contains('nav-dot')) {
            renderQuestion(parseInt(e.target.dataset.index));
        }
    });

    function finishExam(forced) {
        clearInterval(timerInterval);

        // Calculate Score
        let score = 0;
        testData.questions.forEach((q, i) => {
            if (answers[i] === q.correct) score++;
        });

        // Calculate XP
        const xpEarned = score * 50; // 50 XP per question in standardized test
        addXP(xpEarned);

        // Restore UI
        document.body.classList.remove('qiyas-mode-body');
        if (header) header.style.display = 'block';
        if (footer) footer.style.display = 'block';

        container.innerHTML = `
            <div class="auth-container fade-in">
                <div class="auth-box" style="max-width:600px;">
                    <h2>${forced ? '⏰ انتهى الوقت!' : '✅ تم تسليم الاختبار'}</h2>
                    <h3>النتيجة: ${score} / ${testData.questions.length}</h3>
                    <p style="font-size:1.2rem; color:var(--secondary-color); margin:1rem 0;">+${xpEarned} XP</p>
                    <div style="text-align:right; margin-top:2rem;">
                        <h4>تحليل الإجابات:</h4>
                        <ul style="list-style:none; padding:0;">
                            ${testData.questions.map((q, i) => `
                                <li style="margin-bottom:10px; padding:10px; border-bottom:1px solid #eee; background:${answers[i] === q.correct ? '#d4edda' : '#f8d7da'}">
                                    <strong>س${i+1}:</strong> ${answers[i] === q.correct ? 'صحيحة' : 'خاطئة'}
                                    <br><small>${q.explanation}</small>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary full-width" onclick="location.reload()">العودة للرئيسية</button>
                </div>
            </div>
        `;
    }

    // Start
    renderQuestion(0);
}

function initQuiz(questions, container, timeLimitSeconds = 0) {
    let current = 0;
    let score = 0;
    let timerInterval;

    // Timer Logic for regular quizzes (keep existing logic but minimal)
    if (timeLimitSeconds > 0) {
        let timeLeft = timeLimitSeconds;
        // ... (existing simplified timer logic if needed, but standardize tests use above engine)
    }

    function renderQuestion() {
        if (current >= questions.length) {
            // Simple result logic
            container.innerHTML = `<div class="quiz-result"><h4>انتهى!</h4><p>النتيجة: ${score}/${questions.length}</p><button onclick="location.reload()">عودة</button></div>`;
            return;
        }

        // Render simple quiz...
        const q = questions[current];
        container.innerHTML = `
             <h4 class="quiz-question">${q.question}</h4>
             <div class="options-grid">
                ${q.options.map((opt, i) => `<button class="option-btn" data-index="${i}">${opt}</button>`).join('')}
             </div>
             <div id="feedback" class="feedback hidden"></div>
             <button id="next-btn" class="btn btn-primary hidden" style="margin-top:1rem">التالي</button>
        `;

        // Re-bind simple quiz logic (abbreviated for patch size, ensuring previous logic works)
        const opts = container.querySelectorAll('.option-btn');
        const feedback = container.querySelector('#feedback');
        const nextBtn = container.querySelector('#next-btn');

        opts.forEach(btn => {
            btn.addEventListener('click', () => {
                 const selected = parseInt(btn.dataset.index);
                 if (selected === q.correct) {
                     btn.classList.add('correct');
                     feedback.innerHTML = '✅ صحيح!';
                     feedback.className = 'feedback correct';
                     score++;
                 } else {
                     btn.classList.add('wrong');
                     feedback.innerHTML = `❌ خطأ. ${q.explanation}`;
                     feedback.className = 'feedback wrong';
                 }
                 feedback.classList.remove('hidden');
                 nextBtn.classList.remove('hidden');
            });
        });

        nextBtn.addEventListener('click', () => {
            current++;
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
