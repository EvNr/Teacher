
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';

export class ExamView {
    constructor(container) {
        this.container = container;
        this.testId = sessionStorage.getItem('active_test') || 'qudrat';
        this.testData = DATA_STORE.TESTS[this.testId];
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.testData.questions.length).fill(null);
        this.flagged = new Array(this.testData.questions.length).fill(false);
        this.timeLeft = this.testData.duration * 60;
        this.timerInterval = null;

        if (!this.testData) {
            alert("Error loading test data");
            Router.navigate('dashboard');
            return;
        }

        this.mount();
    }

    mount() {
        this.injectStyles();
        this.renderLayout();
        this.startTimer();
        this.renderQuestion(0);
    }

    injectStyles() {
        if (document.getElementById('qiyas-style')) return;
        const style = document.createElement('style');
        style.id = 'qiyas-style';
        style.textContent = `
            body { background: #f5f7fa !important; overflow: hidden; }
            #app { padding: 0 !important; margin: 0 !important; height: 100vh; display: flex; flex-direction: column; }

            .q-header {
                height: 60px; flex: 0 0 60px; background: #0056b3; color: white; display: flex;
                justify-content: space-between; align-items: center; padding: 0 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                direction: rtl; font-family: 'Cairo', sans-serif;
            }
            .q-body {
                flex: 1; display: grid; grid-template-columns: 300px 1fr; overflow: hidden;
            }
            .q-sidebar {
                background: #e9ecef; border-left: 1px solid #dee2e6; padding: 1rem; overflow-y: auto;
                display: flex; flex-direction: column;
            }
            .q-main {
                background: white; padding: 3rem; overflow-y: auto; position: relative;
            }
            .q-footer {
                height: 60px; flex: 0 0 60px; background: #e9ecef; border-top: 1px solid #ccc;
                display: flex; justify-content: space-between; align-items: center; padding: 0 2rem;
            }

            /* Grid */
            .nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 1rem; }
            .nav-dot {
                width: 35px; height: 35px; border-radius: 50%; background: #bdc3c7; color: white;
                display: flex; justify-content: center; align-items: center; cursor: pointer; font-weight: bold;
            }
            .nav-dot.active { border: 2px solid #0056b3; transform: scale(1.1); }
            .nav-dot.answered { background: #27ae60; }
            .nav-dot.flagged { background: #f1c40f; color: black; }

            /* Question */
            .option-box {
                border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 4px; cursor: pointer;
                display: flex; align-items: center; transition: background 0.2s;
            }
            .option-box:hover { background: #f8f9fa; }
            .option-box.selected { background: #e3f2fd; border-color: #0056b3; }
            .radio-circle {
                width: 20px; height: 20px; border: 2px solid #666; border-radius: 50%; margin-left: 15px;
                position: relative;
            }
            .option-box.selected .radio-circle { border-color: #0056b3; }
            .option-box.selected .radio-circle::after {
                content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 10px; height: 10px; background: #0056b3; border-radius: 50%;
            }

            .btn-q {
                padding: 8px 25px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-weight: bold;
            }
            .btn-next { background: #0056b3; color: white; border: none; }
        `;
        document.head.appendChild(style);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="q-header">
                <div class="timer" id="timerDisplay" style="background:rgba(0,0,0,0.2); padding:5px 15px; border-radius:4px; font-family:monospace; font-size:1.2rem;">00:00</div>
                <div style="font-weight:bold;">مركز قياس | ${this.testData.title}</div>
                <div>${appStore.state.user.name}</div>
            </div>

            <div class="q-body">
                <aside class="q-sidebar">
                    <div style="background:white; padding:15px; border:1px solid #ccc; border-radius:4px; text-align:center; margin-bottom:1rem;">
                        <strong>رقم المشترك:</strong> 1059483<br>
                        <small>المملكة العربية السعودية</small>
                    </div>
                    <h4>مستكشف الأسئلة</h4>
                    <div class="nav-grid" id="navGrid"></div>
                    <div style="margin-top:auto; font-size:0.8rem; color:#666; text-align:center;">
                        Secure Browser v2.4<br>Sync: <span style="color:green">Connected</span>
                    </div>
                </aside>

                <main class="q-main" id="questionArea">
                    <!-- Question Content -->
                </main>
            </div>

            <footer class="q-footer">
                <div>
                    <button class="btn-q" id="prevBtn">السابق</button>
                    <button class="btn-q" id="flagBtn" style="background:#f1c40f; border:none; margin-right:10px;">⚑ مراجعة</button>
                </div>
                <div>
                    <button class="btn-q btn-next" id="nextBtn">التالي</button>
                    <button class="btn-q" id="submitBtn" style="background:#27ae60; color:white; border:none; display:none;">إنهاء الاختبار</button>
                </div>
            </footer>
        `;

        this.attachEvents();
    }

    renderQuestion(index) {
        this.currentQuestionIndex = index;
        const q = this.testData.questions[index];
        const area = document.getElementById('questionArea');

        area.innerHTML = `
            <div style="margin-bottom:2rem; font-size:1.4rem; font-weight:bold; color:#333; line-height:1.6;">
                <span style="background:#0056b3; color:white; padding:2px 10px; border-radius:4px; font-size:1rem; vertical-align:middle; margin-left:10px;">سؤال ${index + 1}</span>
                ${q.question}
            </div>
            <div class="options-list">
                ${q.options.map((opt, i) => `
                    <div class="option-box ${this.answers[index] === i ? 'selected' : ''}" data-val="${i}">
                        <div class="radio-circle"></div>
                        ${opt}
                    </div>
                `).join('')}
            </div>
        `;

        // Update UI State
        this.updateNavGrid();

        document.getElementById('prevBtn').disabled = index === 0;
        document.getElementById('nextBtn').style.display = index === this.testData.questions.length - 1 ? 'none' : 'inline-block';
        document.getElementById('submitBtn').style.display = index === this.testData.questions.length - 1 ? 'inline-block' : 'none';

        const flagBtn = document.getElementById('flagBtn');
        flagBtn.innerHTML = this.flagged[index] ? '⚑ إلغاء' : '⚑ مراجعة';

        // Bind Options
        area.querySelectorAll('.option-box').forEach(box => {
            box.addEventListener('click', () => {
                this.answers[index] = parseInt(box.dataset.val);
                this.renderQuestion(index);
            });
        });
    }

    updateNavGrid() {
        const grid = document.getElementById('navGrid');
        grid.innerHTML = this.testData.questions.map((_, i) => {
            let classes = 'nav-dot';
            if (i === this.currentQuestionIndex) classes += ' active';
            if (this.answers[i] !== null) classes += ' answered';
            if (this.flagged[i]) classes += ' flagged';
            return `<div class="${classes}" data-index="${i}">${i + 1}</div>`;
        }).join('');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
            const s = (this.timeLeft % 60).toString().padStart(2, '0');
            const el = document.getElementById('timerDisplay');
            if(el) el.textContent = `⏳ ${m}:${s}`;

            if (this.timeLeft <= 0) this.finish(true);
        }, 1000);
    }

    finish(forced = false) {
        clearInterval(this.timerInterval);

        // Calculate Score
        let score = 0;
        this.testData.questions.forEach((q, i) => {
            if (this.answers[i] === q.correct) score++;
        });

        // Award XP
        let currentXP = appStore.state.user.xp || 0;
        currentXP += (score * 50);
        const updatedUser = { ...appStore.state.user, xp: currentXP };
        appStore.setUser(updatedUser);

        // Remove Styles
        const style = document.getElementById('qiyas-style');
        if (style) style.remove();

        // Show Result Modal via Router or custom HTML replacement
        this.container.innerHTML = `
            <div class="moe-card" style="max-width:600px; margin:2rem auto; text-align:center;">
                <h1 style="color:var(--moe-green)">تم إرسال الإجابات بنجاح</h1>
                <div style="font-size:3rem; font-weight:bold; margin:2rem 0;">${score} / ${this.testData.questions.length}</div>
                <p>تم اعتماد نتيجتك في نظام "نور" للمحاكاة.</p>
                <div style="margin-top:2rem;">
                    <button id="returnBtn" class="btn-moe">العودة للرئيسية</button>
                </div>
            </div>
        `;

        document.getElementById('returnBtn').addEventListener('click', () => Router.navigate('dashboard'));
    }

    attachEvents() {
        document.getElementById('navGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-dot')) {
                this.renderQuestion(parseInt(e.target.dataset.index));
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex < this.testData.questions.length - 1) {
                this.renderQuestion(this.currentQuestionIndex + 1);
            }
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex > 0) {
                this.renderQuestion(this.currentQuestionIndex - 1);
            }
        });

        document.getElementById('flagBtn').addEventListener('click', () => {
            this.flagged[this.currentQuestionIndex] = !this.flagged[this.currentQuestionIndex];
            this.renderQuestion(this.currentQuestionIndex);
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            if (confirm("هل أنت متأكد من إنهاء الاختبار؟")) this.finish();
        });
    }
}
