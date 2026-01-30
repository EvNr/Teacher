// Sabreen Math Academy Data Store (Professional)
// Curriculum: 1447 Edition

/* --- Mock Database & Security --- */
const TEACHER_USER = {
    email: "sabreen@academy.com",
    password: "123", // Will be hashed in runtime
    name: "الأستاذة صابرين",
    role: "teacher"
};

const MOCK_USERS = {
    "user1@user.com": { name: "طالبة أول ثانوي", grade: "10", section: "10-A", password: "password", email: "user1@user.com", xp: 1500 },
    "user2@user.com": { name: "طالبة ثاني ثانوي", grade: "11", section: "11-A", password: "password", email: "user2@user.com", xp: 2200 },
    "user3@user.com": { name: "طالبة ثالث ثانوي", grade: "12", section: "12-B", password: "password", email: "user3@user.com", xp: 3050 },
    "test_11b@user.com": { name: "نورة (ثاني ب)", grade: "11", section: "11-B", password: "password", email: "test_11b@user.com", xp: 1800 },
    "test_12a@user.com": { name: "سارة (ثالث أ)", grade: "12", section: "12-A", password: "password", email: "test_12a@user.com", xp: 2600 }
};

// Mock Performance Data for Teacher Dashboard Analysis (Qiyas Scores out of 100)
const MOCK_CLASS_RESULTS = {
    "11": {
        "A": { avg: 85, high: 98, low: 72, total_students: 25 },
        "B": { avg: 79, high: 94, low: 65, total_students: 22 }
    },
    "12": {
        "A": { avg: 88, high: 99, low: 75, total_students: 28 },
        "B": { avg: 91, high: 100, low: 80, total_students: 26 }
    }
};

/* --- Content Data --- */
const ACADEMY_DATA = {
    "10": {
        title: "الصف الأول ثانوي (مسارات)",
        subtitle: "الرياضيات 1-1 | السنة الأولى المشتركة",
        curriculum: [
            { title: "كتاب الرياضيات 1-1 (المنهج كاملاً 1447)", type: "pdf", link: "https://www.wajibati.net/wp-content/uploads/2025/08/ki-ry1sf3_1_8affgfja4d.pdf", featured: true },
            { title: "الفصل 1: التبرير والبرهان", type: "video", link: "#" }
        ],
        quizzes: [
            { id: 1, question: "أي العبارات التالية تعتبر عبارة شرطية؟", options: ["إذا كان الجو ممطراً فسآخذ مظلة", "الجو جميل", "5+3=8", "مثلث"], correct: 0, explanation: "العبارة الشرطية تكون على صورة (إذا...فإن)." }
        ],
        challenges: [
            { id: "c10_1", title: "تحدي الأسبوع", description: "أثبت أن مجموع زوايا المثلث 180 درجة.", difficulty: "Hard", xp: 500, solution: "برسم مستقيم موازٍ للقاعدة..." }
        ]
    },
    "11": {
        title: "الصف الثاني ثانوي (مسارات)",
        subtitle: "الرياضيات 2-1 | السنة الثانية",
        curriculum: [
            { title: "كتاب الرياضيات 2-1 (المنهج كاملاً 1447)", type: "pdf", link: "https://www.wajibati.net/wp-content/uploads/2025/08/ki-ry2sf1_1_c5zd2b66xy.pdf", featured: true }
        ],
        quizzes: [{ id: 1, question: "بسط i^15", options: ["i", "-i", "1", "-1"], correct: 1, explanation: "i^15 = i^3 = -i" }],
        challenges: [{ id: "c11_1", title: "تحدي المصفوفات", description: "حل معادلة بمجهولين بقاعدة كرامر.", difficulty: "Hard", xp: 600, solution: "نوجد D, Dx, Dy..." }]
    },
    "12": {
        title: "الصف الثالث ثانوي (مسارات)",
        subtitle: "الرياضيات 3-1 | السنة الثالثة",
        curriculum: [
            { title: "كتاب الرياضيات 3-1 (المنهج كاملاً 1447)", type: "pdf", link: "https://www.wajibati.net/wp-content/uploads/2025/08/kp-ry3sf1_1_wm99k40zrh.pdf", featured: true }
        ],
        quizzes: [{ id: 1, question: "مشتقة x^2", options: ["2x", "x", "2", "0"], correct: 0, explanation: "قاعدة القوة: nx^(n-1)" }],
        challenges: [{ id: "c12_1", title: "تحدي التفاضل", description: "معادلة المماس للمنحنى...", difficulty: "Medium", xp: 450, solution: "y - y1 = m(x - x1)" }]
    }
};

/* --- Standardized Tests (Qiyas Simulation) --- */
const STANDARDIZED_TESTS = {
    "qudrat": {
        title: "اختبار القدرات العامة (تجريبي)",
        description: "اختبار يحاكي اختبار قياس للقدرات العامة (الكمي واللفظي).",
        duration: 40, // 40 Minutes as requested
        questions: [
            // Quant (1-5)
            { id: "q1", section: "كمي", question: "قارن بين: القيمة الأولى (0.40)، القيمة الثانية (2/5)", options: ["القيمة الأولى أكبر", "القيمة الثانية أكبر", "القيمتان متساويتان", "المعطيات غير كافية"], correct: 2, explanation: "2/5 = 0.4، إذاً 0.40 = 0.4." },
            { id: "q2", section: "كمي", question: "إذا كان س عدد زوجي و ص عدد فردي، فأي مما يلي يجب أن يكون زوجياً؟", options: ["س + ص", "س × ص", "س - ص", "ص + 1"], correct: 1, explanation: "ضرب أي عدد في عدد زوجي يعطي عدداً زوجياً." },
            { id: "q3", section: "كمي", question: "صنبور يملأ خزان في ساعتين، وآخر يملأه في 3 ساعات، وآخر يفرغه في 6 ساعات. إذا فتحت الثلاثة معاً فكم ساعة يلزم لملء الخزان؟", options: ["1.5", "2", "2.5", "3"], correct: 0, explanation: "1/2 + 1/3 - 1/6 = 3/6 + 2/6 - 1/6 = 4/6 = 2/3 خزان في الساعة. الزمن = 3/2 = 1.5 ساعة." },
            { id: "q4", section: "كمي", question: "أكمل المتتابعة: 1، 4، 9، 16، ...", options: ["20", "24", "25", "36"], correct: 2, explanation: "مربعات الأعداد الطبيعية: 1²، 2²، 3²، 4²، 5² = 25." },
            { id: "q5", section: "كمي", question: "ما هو العدد الذي 20% منه يساوي 50؟", options: ["200", "250", "300", "100"], correct: 1, explanation: "20% = 1/5. إذاً 1/5 س = 50، س = 250." },
            // Verbal (6-10)
            { id: "q6", section: "لفظي", question: "العلاقة المماثلة: (طائر : ريش)", options: ["جمل : وبر", "سمكة : خياشيم", "إنسان : جلد", "أسد : عرين"], correct: 0, explanation: "علاقة تغطية الجسم. الطائر يغطيه الريش، والجمل يغطيه الوبر." },
            { id: "q7", section: "لفظي", question: "معنى كلمة 'أرخبيل':", options: ["جبل شاهق", "مجموعة جزر", "وادٍ سحيق", "سهل منبسط"], correct: 1, explanation: "الأرخبيل هو مجموعة من الجزر المتقاربة." },
            { id: "q8", section: "لفظي", question: "إكمال الجمل: لا تكن ... فتعصر، ولا تكن ... فتكسر.", options: ["ليناً - قاسياً", "رطباً - يابساً", "كريماً - بخيلاً", "شديداً - ضعيفاً"], correct: 1, explanation: "لا تكن رطباً فتعصر، ولا يابساً فتكسر." },
            { id: "q9", section: "لفظي", question: "استيعاب المقروء: الضجيج يؤثر سلباً على ...", options: ["التركيز", "الشهية", "المشي", "النمو"], correct: 0, explanation: "الضجيج يشتت الانتباه ويضعف التركيز." },
            { id: "q10", section: "لفظي", question: "الخطأ السياقي: العواصف الرخوة تحطم الأشجار الضخمة.", options: ["العواصف", "الرخوة", "تحطم", "الضخمة"], correct: 1, explanation: "الخطأ هو 'الرخوة'، والصواب 'الشديدة' أو 'الهوجاء'." }
        ]
    },
    "tahsili": {
        title: "الاختبار التحصيلي (محاكاة)",
        description: "أسئلة تحصيلية شاملة في الرياضيات (1، 2، 3).",
        duration: 40, // 40 Minutes
        questions: [
            { id: "t1", section: "رياضيات 1", question: "ما معادلة المستقيم المار بالنقطة (0, 2) وميله 3؟", options: ["y = 3x + 2", "y = 2x + 3", "y = 3x", "y = x + 2"], correct: 0, explanation: "معادلة المستقيم y = mx + b. الميل m=3 والمقطع الصادي b=2." },
            { id: "t2", section: "رياضيات 2", question: "قيمة i^14 تساوي:", options: ["1", "-1", "i", "-i"], correct: 1, explanation: "i^14 = (i^2)^7 = (-1)^7 = -1." },
            { id: "t3", section: "رياضيات 3", question: "نهاية الدالة (x² - 1)/(x - 1) عندما x تؤول لـ 1:", options: ["0", "1", "2", "غير موجودة"], correct: 2, explanation: "بالتحليل: (x-1)(x+1)/(x-1) = x+1. عند x=1 الناتج 2." },
            { id: "t4", section: "رياضيات 1", question: "صورة النقطة (2, 3) بالانعكاس حول محور x هي:", options: ["(-2, 3)", "(2, -3)", "(-2, -3)", "(3, 2)"], correct: 1, explanation: "الانعكاس حول x يغير إشارة y." },
            { id: "t5", section: "رياضيات 2", question: "ما قيمة المحدد | 1  2 |\n               | 3  4 |", options: ["-2", "2", "10", "-10"], correct: 0, explanation: "(1)(4) - (2)(3) = 4 - 6 = -2." },
            { id: "t6", section: "رياضيات 3", question: "ميل المماس لمنحنى y = x² عند x = 3 هو:", options: ["3", "6", "9", "2"], correct: 1, explanation: "المشتقة y' = 2x. عند x=3 الميل = 2(3) = 6." },
            { id: "t7", section: "رياضيات 2", question: "مجال الدالة f(x) = √(x - 5) هو:", options: ["x ≥ 5", "x > 5", "x ≤ 5", "R"], correct: 0, explanation: "ما تحت الجذر يجب أن يكون أكبر من أو يساوي صفر. x - 5 ≥ 0 -> x ≥ 5." },
            { id: "t8", section: "رياضيات 1", question: "مجموع قياسات الزوايا الداخلية لمضلع سداسي:", options: ["180", "360", "540", "720"], correct: 3, explanation: "(n-2) × 180 = (6-2) × 180 = 4 × 180 = 720." }
        ]
    }
};

window.MOCK_USERS = MOCK_USERS;
window.TEACHER_USER = TEACHER_USER;
window.ACADEMY_DATA = ACADEMY_DATA;
window.STANDARDIZED_TESTS = STANDARDIZED_TESTS;
window.MOCK_CLASS_RESULTS = MOCK_CLASS_RESULTS;
