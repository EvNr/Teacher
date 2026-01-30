// Sabreen Math Academy Data Store
// Curriculum: 1447 Edition

// 1. Mock Users Database
const MOCK_USERS = {
    "user1@user.com": { name: "طالبة أول ثانوي", grade: "10", password: "password", email: "user1@user.com" },
    "user2@user.com": { name: "طالبة ثاني ثانوي", grade: "11", password: "password", email: "user2@user.com" },
    "user3@user.com": { name: "طالبة ثالث ثانوي", grade: "12", password: "password", email: "user3@user.com" }
};

// 2. Academy Content Data
const ACADEMY_DATA = {
    "10": {
        title: "الصف الأول ثانوي (مسارات)",
        subtitle: "الرياضيات 1-1 | السنة الأولى المشتركة",
        curriculum: [
            {
                title: "كتاب الرياضيات 1-1 (المنهج كاملاً 1447)",
                type: "pdf",
                link: "https://www.wajibati.net/wp-content/uploads/2025/08/ki-ry1sf3_1_8affgfja4d.pdf",
                featured: true
            },
            { title: "الفصل 1: التبرير والبرهان", type: "video", link: "#" },
            { title: "الفصل 2: التوازي والتعامد", type: "video", link: "#" },
            { title: "الفصل 3: المثلثات المتطابقة", type: "pdf", link: "#" }
        ],
        quizzes: [
            {
                id: 1,
                question: "أي العبارات التالية تعتبر عبارة شرطية؟",
                options: ["إذا كان الجو ممطراً فسآخذ مظلة", "الجو جميل", "5 + 3 = 8", "المثلث له 4 أضلاع"],
                correct: 0,
                explanation: "العبارة الشرطية تكون على صورة (إذا كان ... فإن ...)."
            },
            {
                id: 2,
                question: "التخمين التالي: 'حاصل ضرب عددين فرديين هو عدد فردي' يعتبر:",
                options: ["صحيح دائماً", "خاطئ دائماً", "صحيح أحياناً", "لا يمكن الحكم عليه"],
                correct: 0,
                explanation: "مثال: 3 × 5 = 15 (فردي)، 7 × 9 = 63 (فردي)."
            },
            {
                id: 3,
                question: "في العبارة الشرطية p ➝ q، ماذا تسمى p؟",
                options: ["النتيجة", "الفرض", "التبرير", "المسلمة"],
                correct: 1,
                explanation: "في العبارة الشرطية، الجزء الذي يلي 'إذا' هو الفرض (p)."
            }
        ],
        challenges: [
            {
                id: "c10_1",
                title: "تحدي الأسبوع",
                description: "أثبت أن مجموع قياسات زوايا المثلث يساوي 180° باستخدام مسلمة التوازي.",
                difficulty: "Hard",
                xp: 500,
                solution: "برسم مستقيم يوازي القاعدة ويمر بالرأس الثالث، وباستخدام نظرية الزوايا المتبادلة داخلياً، نجد أن مجموع الزوايا المستقيمة 180 درجة، وهي تطابق مجموع زوايا المثلث."
            }
        ]
    },
    "11": {
        title: "الصف الثاني ثانوي (مسارات)",
        subtitle: "الرياضيات 2-1 | السنة الثانية",
        curriculum: [
            {
                title: "كتاب الرياضيات 2-1 (المنهج كاملاً 1447)",
                type: "pdf",
                link: "https://www.wajibati.net/wp-content/uploads/2025/08/ki-ry2sf1_1_c5zd2b66xy.pdf",
                featured: true
            },
            { title: "الفصل 1: الدوال والمتباينات", type: "video", link: "#" },
            { title: "الفصل 2: المصفوفات", type: "video", link: "#" }
        ],
        quizzes: [
            {
                id: 1,
                question: "ما رتبة المصفوفة الناتجة من ضرب مصفوفة 2×3 في مصفوفة 3×4؟",
                options: ["2×4", "3×3", "2×3", "لا يمكن الضرب"],
                correct: 0,
                explanation: "رتبة الناتج تكون: (عدد صفوف الأولى) × (عدد أعمدة الثانية)."
            },
            {
                id: 2,
                question: "بسط المقدار: i¹⁵ (حيث i هو العدد التخيلي)",
                options: ["i", "-i", "1", "-1"],
                correct: 1,
                explanation: "i¹⁵ = i¹² × i³ = 1 × -i = -i"
            }
        ],
        challenges: [
            {
                id: "c11_1",
                title: "تحدي المصفوفات",
                description: "حل نظام معادلات خطية مكون من 3 متغيرات باستخدام قاعدة كرامر.",
                difficulty: "Hard",
                xp: 600,
                solution: "نوجد المحدد العام للمصفوفة (D). إذا كان D ≠ 0، نوجد محددات المتغيرات (Dx, Dy, Dz). الحل يكون x=Dx/D, y=Dy/D, z=Dz/D."
            }
        ]
    },
    "12": {
        title: "الصف الثالث ثانوي (مسارات)",
        subtitle: "الرياضيات 3-1 | السنة الثالثة",
        curriculum: [
            {
                title: "كتاب الرياضيات 3-1 (المنهج كاملاً 1447)",
                type: "pdf",
                link: "https://www.wajibati.net/wp-content/uploads/2025/08/kp-ry3sf1_1_wm99k40zrh.pdf",
                featured: true
            },
            { title: "الفصل 1: التحليل الرسومي", type: "video", link: "#" },
            { title: "الفصل 2: النهايات والاشتقاق", type: "video", link: "#" }
        ],
        quizzes: [
            {
                id: 1,
                question: "أي من الدوال التالية تعتبر دالة زوجية؟",
                options: ["f(x) = x²", "f(x) = x³", "f(x) = x + 1", "f(x) = sin(x)"],
                correct: 0,
                explanation: "الدالة الزوجية تحقق f(-x) = f(x)، و x² تحقق ذلك."
            },
            {
                id: 2,
                question: "أوجد قيمة: lim (x→∞) (1/x)",
                options: ["0", "1", "∞", "غير معرفة"],
                correct: 0,
                explanation: "كلما كبر المقام، اقتربت قيمة الكسر من الصفر."
            }
        ],
        challenges: [
            {
                id: "c12_1",
                title: "تحدي التفاضل",
                description: "أوجد معادلة المماس لمنحنى الدالة <span class='math'>f(x) = x³ - 3x</span> عند النقطة <span class='math'>(2, 2)</span>.",
                difficulty: "Medium",
                xp: 450,
                solution: "1. نشتق الدالة: <span class='math'>f'(x) = 3x² - 3</span>.<br>2. نعوض بـ x=2 لإيجاد الميل: <span class='math'>m = 3(2)² - 3 = 9</span>.<br>3. معادلة المستقيم: <span class='math'>y - y₁ = m(x - x₁)</span>.<br>4. <span class='math'>y - 2 = 9(x - 2)</span> ➝ <span class='math'>y = 9x - 16</span>."
            }
        ]
    }
};

window.MOCK_USERS = MOCK_USERS;
window.ACADEMY_DATA = ACADEMY_DATA;
