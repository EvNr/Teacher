
import { appStore } from '../core/Store.js';
import { DATA_STORE } from '../core/DataStore.js';
import { Router } from '../core/Router.js';

export class ExamView {
    constructor(container) {
        this.container = container;
        this.testId = sessionStorage.getItem('active_test');
        this.testData = DATA_STORE.TESTS[this.testId];
        this.answers = {};
        this.timer = null;
        this.render();
    }

    render() {
        if (!this.testData) {
            Router.navigate('dashboard');
            return;
        }

        this.container.innerHTML = `
            <div style="min-height:100vh; background:var(--royal-obsidian); padding:2rem;">

                <div class="expert-card" style="max-width:800px; margin:0 auto; padding:0; overflow:hidden;">

                    <!-- Header -->
                    <div style="background:linear-gradient(135deg, var(--gilded-dark), var(--gilded-gold)); padding:20px; color:white; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="font-family:var(--font-heading); margin-bottom:5px;">${this.testData.title}</h2>
                            <p style="font-size:0.9rem; opacity:0.9;">الزمن المتبقي: <span id="timerDisplay" style="font-weight:bold; font-size:1.2rem;">--:--</span></p>
                        </div>
                        <button id="submitExam" class="btn-gold" style="background:white; color:var(--gilded-dark); border:none; box-shadow:none;">تسليم الاختبار</button>
                    </div>

                    <!-- Question Area -->
                    <div id="questionContainer" style="padding:2rem;">
                        <!-- Rendered by JS -->
                    </div>

                    <!-- Navigation -->
                    <div style="padding:20px; background:rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:center; gap:10px; flex-wrap:wrap;" id="navContainer">
                        <!-- Buttons -->
                    </div>

                </div>

            </div>
        `;

        this.startExam();
    }

    startExam() {
        let timeLeft = this.testData.duration * 60;
        const display = document.getElementById('timerDisplay');

        this.timer = setInterval(() => {
            timeLeft--;
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            display.textContent = `${m}:${s < 10 ? '0'+s : s}`;

            if (timeLeft <= 0) this.finishExam();
        }, 1000);

        this.renderQuestions();
    }

    renderQuestions() {
        const container = document.getElementById('questionContainer');
        const nav = document.getElementById('navContainer');

        container.innerHTML = this.testData.questions.map((q, idx) => `
            <div class="question-block" id="q_${idx}" style="display:${idx === 0 ? 'block' : 'none'}; animation:fadeIn 0.5s;">
                <div style="margin-bottom:20px; color:var(--gilded-gold); font-weight:bold;">سؤال ${idx + 1} من ${this.testData.questions.length} <span style="font-size:0.8rem; color:var(--luxury-grey);">(${q.section})</span></div>
                <p class="text-white" style="font-size:1.1rem; line-height:1.6; margin-bottom:20px;">${q.question}</p>

                <div style="display:grid; gap:10px;">
                    ${q.options.map((opt, oIdx) => `
                        <label style="display:flex; align-items:center; gap:10px; padding:15px; background:rgba(255,255,255,0.05); border-radius:8px; cursor:pointer; transition:0.2s;" class="opt-label">
                            <input type="radio" name="q${idx}" value="${oIdx}" style="accent-color:var(--gilded-gold);">
                            <span class="text-white">${opt}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Navigation Buttons
        nav.innerHTML = this.testData.questions.map((_, idx) => `
            <button class="nav-btn" data-idx="${idx}" style="width:35px; height:35px; border-radius:50%; border:1px solid var(--luxury-grey); background:transparent; color:var(--luxury-grey); cursor:pointer;">${idx + 1}</button>
        `).join('');

        this.updateNav(0);
        this.attachQuestionEvents();
    }

    attachQuestionEvents() {
        // Radio Changes
        this.container.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const qIdx = parseInt(e.target.name.substring(1));
                this.answers[qIdx] = parseInt(e.target.value);

                // Update Nav Style
                const btn = document.querySelector(`.nav-btn[data-idx="${qIdx}"]`);
                if (btn) {
                    btn.style.background = 'var(--gilded-gold)';
                    btn.style.color = 'var(--royal-obsidian)';
                    btn.style.borderColor = 'var(--gilded-gold)';
                }
            });
        });

        // Nav Click
        this.container.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                this.showQuestion(idx);
            });
        });

        document.getElementById('submitExam').addEventListener('click', () => {
            if (confirm('هل أنت متأكد من تسليم الاختبار؟')) this.finishExam();
        });
    }

    showQuestion(idx) {
        this.container.querySelectorAll('.question-block').forEach(el => el.style.display = 'none');
        document.getElementById(`q_${idx}`).style.display = 'block';
        this.updateNav(idx);
    }

    updateNav(currentIdx) {
        this.container.querySelectorAll('.nav-btn').forEach(btn => {
            if (parseInt(btn.dataset.idx) === currentIdx) {
                btn.style.boxShadow = '0 0 10px var(--gilded-gold)';
            } else {
                btn.style.boxShadow = 'none';
            }
        });
    }

    finishExam() {
        clearInterval(this.timer);

        let score = 0;
        this.testData.questions.forEach((q, idx) => {
            if (this.answers[idx] === q.correct) score++;
        });

        const percentage = Math.round((score / this.testData.questions.length) * 100);

        // Show Result Modal
        this.container.innerHTML = `
            <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--royal-obsidian);">
                <div class="expert-card" style="text-align:center; max-width:400px; animation:slideUp 0.5s;">
                    <div style="font-size:4rem; margin-bottom:1rem;">🏆</div>
                    <h2 class="text-gold font-heading">نتيجة الاختبار</h2>
                    <div style="font-size:3rem; font-weight:bold; color:white; margin:20px 0;">${percentage}%</div>
                    <p class="text-grey" style="margin-bottom:2rem;">إجابات صحيحة: ${score} من ${this.testData.questions.length}</p>
                    <button id="backDash" class="btn-gold" style="width:100%;">العودة للرئيسية</button>
                </div>
            </div>
        `;

        document.getElementById('backDash').addEventListener('click', () => Router.navigate('dashboard'));
    }
}
