// --- SINTETIZADOR DE SONIDO (Web Audio API) ---
class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playJump() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playCollect() {
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.06 + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.06);
            osc.stop(this.ctx.currentTime + idx * 0.06 + 0.12);
        });
    }

    playExtraLife() {
        if (!this.ctx) return;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
        });
    }

    playHit() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playGameOver() {
        if (!this.ctx) return;
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.15);
            osc.stop(this.ctx.currentTime + idx * 0.15 + 0.25);
        });
    }

    playVictory() {
        if (!this.ctx) return;
        const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.12);
            osc.stop(this.ctx.currentTime + idx * 0.12 + 0.2);
        });
    }
}

const audio = new SoundEngine();

const sendaImg = new Image();
sendaImg.src = 'images/senda.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const clockCanvas = document.getElementById('clockCanvas');
const clockCtx = clockCanvas.getContext('2d');

const hudScore = document.getElementById('hud-score');
const hudCoins = document.getElementById('hud-coins');
const hudMode = document.getElementById('hud-mode');
const hudLives = document.getElementById('hud-lives');

const screenOverlay = document.getElementById('screen-overlay');
const mathOverlay = document.getElementById('math-overlay');
const mathTopic = document.getElementById('math-topic');
const mathQuestionText = document.getElementById('math-question-text');
const optionsContainer = document.getElementById('options-container');

const btnStartGame = document.getElementById('btn-start-game');
const categoryButtons = document.querySelectorAll('.btn-category');

let isPlaying = false;
let score = 0;
let coins = 0;
let lives = 3;
let lastLifeMilestone = 0;
let gameSpeed = 4.5;
let currentScrollSpeed = 0;
let selectedCategory = "ALL";
let animationFrameId = null;
let messagePauseTimer = 0;
let airJumps = 0;
const maxAirJumps = 3;

let activeBrick = null;
let sessionUsedQuestions = []; 
let questionsAnsweredInRun = 0;
let targetQuestionsPerRun = 15;

const keys = { left: false, right: false, down: false };

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// --- GENERACIÓN DE 50 PREGUNTAS POR CATEGORÍA (350 EN TOTAL) ---
function generateQuestionBank() {
    let bank = [];

    // 1. SUMA (50 preguntas)
    for (let i = 1; i <= 50; i++) {
        let a = Math.floor(Math.random() * 700) + 100;
        let b = Math.floor(Math.random() * 700) + 100;
        let correct = a + b;
        let options = shuffleArray([
            String(correct),
            String(correct + 10),
            String(correct - 10),
            String(correct + 25),
            String(correct - 15)
        ]);
        bank.push({ cat: "SUMA", topic: "Adición Avanzada", q: `¿Cuánto es ${a} + ${b}?`, options: options, correct: String(correct) });
    }

    // 2. RESTA (50 preguntas)
    for (let i = 1; i <= 50; i++) {
        let a = Math.floor(Math.random() * 500) + 400;
        let b = Math.floor(Math.random() * 300) + 50;
        if (a < b) [a, b] = [b, a];
        let correct = a - b;
        let options = shuffleArray([
            String(correct),
            String(correct + 10),
            String(correct - 10),
            String(correct + 5),
            String(correct - 25)
        ]);
        bank.push({ cat: "RESTA", topic: "Sustracción", q: `¿Cuánto es ${a} - ${b}?`, options: options, correct: String(correct) });
    }

    // 3. MULTIPLICACIÓN (50 preguntas)
    for (let i = 1; i <= 50; i++) {
        let a = Math.floor(Math.random() * 9) + 2;
        let b = Math.floor(Math.random() * 9) + 2;
        let correct = a * b;
        let options = shuffleArray([
            String(correct),
            String(correct + a),
            String(correct - b),
            String(correct + 6),
            String(correct - 4)
        ]);
        bank.push({ cat: "MULT", topic: "Multiplicación", q: `¿Cuánto es ${a} × ${b}?`, options: options, correct: String(correct) });
    }

    // 4. DIVISIÓN (50 preguntas)
    for (let i = 1; i <= 50; i++) {
        let b = Math.floor(Math.random() * 8) + 2;
        let multiplier = Math.floor(Math.random() * 9) + 2;
        let a = b * multiplier;
        let correct = multiplier;
        let options = shuffleArray([
            String(correct),
            String(correct + 1),
            String(Math.max(1, correct - 1)),
            String(correct + 2),
            String(Math.max(1, correct - 2))
        ]);
        bank.push({ cat: "DIV", topic: "División", q: `¿Cuánto es ${a} dividido en ${b}?`, options: options, correct: String(correct) });
    }

    // 5. PROBLEMAS COTIDIANOS (50 preguntas)
    const itemsList = [
        { item: "un cuaderno", price: 650 },
        { item: "un lápiz", price: 300 },
        { item: "una regla", price: 400 },
        { item: "un estuche", price: 1200 },
        { item: "un jugo", price: 500 },
        { item: "un pan", price: 350 },
        { item: "una manzana", price: 250 },
        { item: "un libro", price: 2500 }
    ];
    for (let i = 1; i <= 50; i++) {
        let item1 = itemsList[Math.floor(Math.random() * itemsList.length)];
        let item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        while (item1.item === item2.item) {
            item2 = itemsList[Math.floor(Math.random() * itemsList.length)];
        }
        let qty1 = Math.floor(Math.random() * 3) + 1;
        let qty2 = Math.floor(Math.random() * 3) + 1;
        let total = (item1.price * qty1) + (item2.price * qty2);
        let correctStr = `$${total}`;
        let options = shuffleArray([
            correctStr,
            `$${total + 100}`,
            `$${Math.max(100, total - 100)}`,
            `$${total + 250}`,
            `$${Math.max(100, total - 200)}`
        ]);
        bank.push({
            cat: "PROBLEMAS",
            topic: "Problema Cotidiano",
            q: `Compraste ${qty1} ${item1.item}(s) a $${item1.price} c/u y ${qty2} ${item2.item}(s) a $${item2.price} c/u. ¿Cuánto gastaste en total?`,
            options: options,
            correct: correctStr
        });
    }

    // 6. PATRONES Y SECUENCIAS (50 preguntas)
    for (let i = 1; i <= 50; i++) {
        let start = Math.floor(Math.random() * 50) + 10;
        let step = Math.floor(Math.random() * 8) + 3;
        let seq = [start, start + step, start + step * 2, start + step * 3];
        let correct = start + step * 4;
        let options = shuffleArray([
            String(correct),
            String(correct + step),
            String(correct - step),
            String(correct + 2),
            String(correct - 2)
        ]);
        bank.push({
            cat: "PATRON",
            topic: "Patrón Numérico",
            q: `¿Qué número continúa la secuencia? ${seq.join(", ")}, ___`,
            options: options,
            correct: String(correct)
        });
    }

    // 7. RELOJ ANÁLOGO (50 preguntas)
    const clockTimes = [];
    for (let h = 1; h <= 12; h++) {
        clockTimes.push({ h: h, m: 0 });
        clockTimes.push({ h: h, m: 30 });
    }
    for (let i = 1; i <= 50; i++) {
        let timeObj = clockTimes[(i - 1) % clockTimes.length];
        let hourStr = String(timeObj.h).padStart(2, '0');
        let minStr = String(timeObj.m).padStart(2, '0');
        let correctStr = `${hourStr}:${minStr}`;
        
        let d1h = (timeObj.h % 12) + 1;
        let d2h = ((timeObj.h + 2) % 12) + 1;
        let distractor1 = `${String(d1h).padStart(2, '0')}:${minStr}`;
        let distractor2 = `${hourStr}:${minStr === '00' ? '30' : '00'}`;
        let distractor3 = `${String(d2h).padStart(2, '0')}:${minStr === '00' ? '30' : '00'}`;
        let distractor4 = `${String((timeObj.h + 4) % 12 + 1).padStart(2, '0')}:00`;

        let options = shuffleArray([correctStr, distractor1, distractor2, distractor3, distractor4]);
        bank.push({
            cat: "RELOJ",
            topic: "Reloj Análogo",
            q: `¿Qué hora marca el reloj análogo?`,
            options: options,
            correct: correctStr,
            hour: timeObj.h,
            minute: timeObj.m
        });
    }

    return bank;
}

const questionBank = generateQuestionBank();

// --- DIBUJO DEL RELOJ ANÁLOGO ---
function drawClock(hour, minute) {
    const w = clockCanvas.width;
    const h = clockCanvas.height;
    const radius = w / 2 - 8;

    clockCtx.clearRect(0, 0, w, h);
    
    clockCtx.save();
    clockCtx.translate(w / 2, h / 2);

    clockCtx.beginPath();
    clockCtx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    clockCtx.fillStyle = '#5c3317';
    clockCtx.fill();

    clockCtx.beginPath();
    clockCtx.arc(0, 0, radius + 1, 0, Math.PI * 2);
    clockCtx.fillStyle = '#0284c7';
    clockCtx.fill();

    clockCtx.beginPath();
    clockCtx.arc(0, 0, radius - 5, 0, Math.PI * 2);
    clockCtx.fillStyle = '#f0f9ff';
    clockCtx.fill();

    clockCtx.fillStyle = '#dc2626';
    clockCtx.font = 'bold 15px Arial';
    clockCtx.textAlign = 'center';
    clockCtx.textBaseline = 'middle';

    for (let num = 1; num <= 12; num++) {
        let angle = (num * Math.PI) / 6 - Math.PI / 2;
        let x = (radius - 17) * Math.cos(angle);
        let y = (radius - 17) * Math.sin(angle);
        clockCtx.fillText(num.toString(), x, y);
    }

    let hourAngle = ((hour % 12) + minute / 60) * (Math.PI / 6);
    clockCtx.save();
    clockCtx.rotate(hourAngle);
    clockCtx.beginPath();
    clockCtx.rect(-3, -28, 6, 28);
    clockCtx.fillStyle = '#84cc16';
    clockCtx.fill();
    clockCtx.lineWidth = 2;
    clockCtx.strokeStyle = '#3f6212';
    clockCtx.stroke();
    clockCtx.restore();

    let minuteAngle = (minute / 60) * (Math.PI * 2);
    clockCtx.save();
    clockCtx.rotate(minuteAngle);
    clockCtx.beginPath();
    clockCtx.rect(-2.5, -38, 5, 38);
    clockCtx.fillStyle = '#eab308';
    clockCtx.fill();
    clockCtx.lineWidth = 2;
    clockCtx.strokeStyle = '#854d0e';
    clockCtx.stroke();
    clockCtx.restore();

    clockCtx.beginPath();
    clockCtx.arc(0, 0, 7, 0, Math.PI * 2);
    clockCtx.fillStyle = '#dc2626';
    clockCtx.fill();
    clockCtx.lineWidth = 2;
    clockCtx.strokeStyle = '#450a0a';
    clockCtx.stroke();

    clockCtx.restore();
}

function drawBrickPlatform(x, y, width, height) {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();

    for (let bx = x + 22; bx < x + width; bx += 28) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + height / 2);
        ctx.stroke();
    }
    for (let bx = x + 12; bx < x + width; bx += 28) {
        ctx.beginPath();
        ctx.moveTo(bx, y + height / 2);
        ctx.lineTo(bx, y + height);
        ctx.stroke();
    }
}

// --- CONFIGURACIÓN DEL PERSONAJE ---
const hero = {
    x: 100,
    y: 0,
    normalWidth: 48,
    normalHeight: 56,
    width: 48,
    height: 56,
    vx: 0,
    vy: 0,
    speed: 4.5,
    gravity: 0.6,
    jumpForce: -13,
    groundY: 0,
    isGrounded: false,
    isCrouching: false,
    facing: 'right',
    isInvulnerable: false,
    invulnerableTimer: 0,

    reset() {
        this.x = 100;
        this.groundY = canvas.height - 70;
        this.width = this.normalWidth;
        this.height = this.normalHeight;
        this.y = this.groundY - this.height;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = true;
        this.isCrouching = false;
        this.facing = 'right';
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        airJumps = 0;
    },

    jump() {
        if (this.isCrouching) return;

        if (this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            airJumps = 0;
            audio.playJump();
        } else if (airJumps < maxAirJumps) {
            this.vy = this.jumpForce * 0.85;
            airJumps++;
            audio.playJump();
        }
    },

    update() {
        if (keys.down && this.isGrounded) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.height = this.normalHeight / 2;
                this.y = this.groundY - this.height;
            }
        } else {
            if (this.isCrouching) {
                this.isCrouching = false;
                this.height = this.normalHeight;
                this.y = this.groundY - this.height;
            }
        }

        if (keys.left) {
            this.facing = 'left';
            if (this.x > 80) {
                this.x -= this.speed;
                currentScrollSpeed = 0;
            } else {
                currentScrollSpeed = -gameSpeed;
            }
        } else if (keys.right) {
            this.facing = 'right';
            if (this.x < canvas.width * 0.45) {
                this.x += this.speed;
                currentScrollSpeed = 0;
            } else {
                currentScrollSpeed = gameSpeed;
            }
        } else {
            currentScrollSpeed = 0;
        }

        this.vy += this.gravity;
        this.y += this.vy;

        if (this.y >= this.groundY - this.height) {
            this.y = this.groundY - this.height;
            this.vy = 0;
            this.isGrounded = true;
            airJumps = 0;
        }

        if (this.isInvulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.isInvulnerable = false;
            }
        }
    },

    draw() {
        if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
        }

        const w = this.width;
        const h = this.height;

        if (this.isCrouching) {
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(-w/3, -h/4, w/1.5, h/1.5);
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(w/6, -h/3, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-w/3, -h/2, w/1.5, 6);
        } else {
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(-w/4, -h/6, w/2, h/2.2);

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/8, -h/12, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, h/12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#78350f';
            ctx.font = 'bold 7px sans-serif';
            ctx.fillText('K', -2, h/9);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-w/3, -h/4, w/2.5, h/3);

            ctx.beginPath();
            ctx.arc(w/3, -h/5, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(w/6, -h/2.5, 13, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(w/3, -h/2.8, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.ellipse(w/4.5, -h/3.2, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.fillRect(w/12, -h/2.2, 4, 5);

            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-w/4, -h/4.5, w/2, 5);

            ctx.beginPath();
            ctx.arc(w/6, -h/1.8, 12, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-w/6, -h/1.7, w/1.5, 5);

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/8, -h/1.6, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#78350f';
            ctx.fillRect(-w/3, h/3, w/2.5, h/4);
        }

        ctx.restore();
    }
};

let clouds = Array.from({ length: 4 }, (_, i) => ({
    x: i * 280 + Math.random() * 50,
    y: 40 + Math.random() * 80,
    speed: 0.8
}));

let platforms = [];
let floatingBricks = [];
let coinsList = [];
let cannonballs = [];

function spawnElements() {
    if (Math.random() < 0.01 && platforms.length < 2) {
        platforms.push({
            x: canvas.width + 50,
            y: hero.groundY - 110 - Math.random() * 50,
            width: 130,
            height: 22
        });
    }

    if (Math.random() < 0.015 && floatingBricks.length < 3) {
        const variableHeights = [
            hero.groundY - 100, 
            hero.groundY - 150, 
            hero.groundY - 210
        ];
        const randomY = variableHeights[Math.floor(Math.random() * variableHeights.length)];
        
        floatingBricks.push({
            x: canvas.width + 50,
            y: randomY,
            width: 44,
            height: 44,
            hit: false,
            solved: false
        });
    }

    if (Math.random() < 0.02 && coinsList.length < 4) {
        coinsList.push({
            x: canvas.width + 50,
            y: hero.groundY - 60 - Math.random() * 110,
            radius: 12
        });
    }

    if (Math.random() < 0.015 && cannonballs.length < 2) {
        const levels = [
            hero.groundY - 25, 
            hero.groundY - 48, 
            hero.groundY - 85  
        ];
        const selectedY = levels[Math.floor(Math.random() * levels.length)];

        cannonballs.push({
            x: canvas.width + 50,
            y: selectedY, 
            width: 50,
            height: 22,
            speed: gameSpeed * 1.4
        });
    }
}

// --- GESTIÓN DE PREGUNTAS (15 POR CATEGORÍA O 25 EN ALL, SIN REPETIR) ---
function getNextQuestion() {
    let filtered = selectedCategory === "ALL" 
        ? questionBank 
        : questionBank.filter(item => item.cat === selectedCategory);

    if (filtered.length === 0) filtered = questionBank;

    let unasked = filtered.filter(q => !sessionUsedQuestions.includes(q));
    if (unasked.length === 0) {
        unasked = filtered;
    }

    const q = unasked[Math.floor(Math.random() * unasked.length)];
    sessionUsedQuestions.push(q);
    return q;
}

function openMathQuiz(brick) {
    activeBrick = brick;
    isPlaying = false;
    mathOverlay.classList.add('active');

    const currentQ = getNextQuestion();

    mathTopic.textContent = `⚡ ${currentQ.topic.toUpperCase()} (${questionsAnsweredInRun + 1}/${targetQuestionsPerRun}) ⚡`;
    mathQuestionText.textContent = currentQ.q;
    optionsContainer.innerHTML = '';

    if (currentQ.cat === "RELOJ" && currentQ.hour !== undefined) {
        clockCanvas.style.display = 'block';
        drawClock(currentQ.hour, currentQ.minute || 0);
    } else {
        clockCanvas.style.display = 'none';
    }

    currentQ.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.textContent = opt;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (opt === currentQ.correct) {
                audio.playCollect();
                score += 200;
                hudScore.textContent = String(score).padStart(6, '0');
                if (activeBrick) activeBrick.solved = true;
                
                questionsAnsweredInRun++;
                checkWinCondition();
            } else {
                audio.playHit();
                lives = Math.max(0, lives - 1);
                hudLives.textContent = lives;
                if (activeBrick) activeBrick.hit = true;
                if (lives === 0) {
                    triggerGameOver();
                } else {
                    closeMathQuiz();
                }
            }
        });
        optionsContainer.appendChild(btn);
    });
}

function checkWinCondition() {
    if (questionsAnsweredInRun >= targetQuestionsPerRun) {
        triggerVictory();
    } else {
        closeMathQuiz();
    }
}

function triggerVictory() {
    isPlaying = false;
    audio.playVictory();
    screenOverlay.classList.add('visible');
    document.getElementById('screen-title').textContent = "¡EXCELENTE TRABAJO!";
    document.getElementById('screen-subtitle').textContent = `¡Nivel Superado! Puntaje: ${score} - Colegio Senda del Saber`;
    btnStartGame.textContent = "JUGAR NUEVAMENTE";
}

function closeMathQuiz() {
    mathOverlay.classList.remove('active');
    messagePauseTimer = 40;
    isPlaying = true;
    requestAnimationFrame(updateAndRender);
}

function checkLifeMilestones() {
    const milestone = Math.floor(score / 1600);
    if (milestone > lastLifeMilestone) {
        lastLifeMilestone = milestone;
        if (lives < 3) {
            lives += 1;
            hudLives.textContent = lives;
            audio.playExtraLife();
        }
    }
}

function triggerGameOver() {
    isPlaying = false;
    audio.playGameOver();
    screenOverlay.classList.add('visible');
    document.getElementById('screen-title').textContent = "¡FIN DEL JUEGO!";
    document.getElementById('screen-subtitle').textContent = `Puntaje Final: ${score}`;
    btnStartGame.textContent = "VOLVER A INTENTAR";
}

// --- BUCLE PRINCIPAL ---
function updateAndRender() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3a86ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(cloud => {
        if (messagePauseTimer <= 0 && currentScrollSpeed !== 0) {
            cloud.x -= (currentScrollSpeed > 0 ? cloud.speed : -cloud.speed * 0.5);
            if (cloud.x < -100) cloud.x = canvas.width + 50;
            if (cloud.x > canvas.width + 50) cloud.x = -100;
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 22, 0, Math.PI * 2);
        ctx.arc(cloud.x + 18, cloud.y - 8, 16, 0, Math.PI * 2);
        ctx.arc(cloud.x + 35, cloud.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#2b9348';
    ctx.fillRect(0, hero.groundY, canvas.width, canvas.height - hero.groundY);
    ctx.fillStyle = '#55a630';
    ctx.fillRect(0, hero.groundY, canvas.width, 12);

    if (messagePauseTimer > 0) {
        messagePauseTimer--;
    } else {
        hero.update();
        if (currentScrollSpeed > 0) {
            spawnElements();
        }
    }

    hero.draw();

    platforms.forEach(p => {
        if (messagePauseTimer <= 0) p.x -= currentScrollSpeed;

        drawBrickPlatform(p.x, p.y, p.width, p.height);

        if (
            hero.x + hero.width > p.x &&
            hero.x < p.x + p.width &&
            hero.y + hero.height >= p.y &&
            hero.y + hero.height - hero.vy <= p.y + 12 &&
            hero.vy >= 0
        ) {
            hero.y = p.y - hero.height;
            hero.vy = 0;
            hero.isGrounded = true;
            airJumps = 0;
        }
    });

    platforms = platforms.filter(p => p.x > -200 && p.x < canvas.width + 200);

    for (let i = coinsList.length - 1; i >= 0; i--) {
        const c = coinsList[i];
        if (messagePauseTimer <= 0) c.x -= currentScrollSpeed;

        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('$', c.x - 4, c.y + 4);
        ctx.restore();

        const distCoin = Math.hypot((hero.x + hero.width / 2) - c.x, (hero.y + hero.height / 2) - c.y);
        if (distCoin < hero.width / 2 + c.radius) {
            audio.playCollect();
            coins += 1;
            score += 50;
            hudCoins.textContent = String(coins).padStart(2, '0');
            hudScore.textContent = String(score).padStart(6, '0');
            coinsList.splice(i, 1);
        } else if (c.x < -50 || c.x > canvas.width + 50) {
            coinsList.splice(i, 1);
        }
    }

    for (let i = floatingBricks.length - 1; i >= 0; i--) {
        const brick = floatingBricks[i];
        if (messagePauseTimer <= 0) brick.x -= currentScrollSpeed;

        if (brick.solved) {
            ctx.fillStyle = '#10b981';
            ctx.strokeStyle = '#047857';
            ctx.lineWidth = 2;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('✓', brick.x + 11, brick.y + 31);
        } else if (brick.hit) {
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        } else {
            ctx.fillStyle = '#d97706';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

            if (sendaImg.complete) {
                ctx.drawImage(sendaImg, brick.x + 6, brick.y + 6, brick.width - 12, brick.height - 12);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText('?', brick.x + 13, brick.y + 29);
            }
        }

        if (
            !brick.hit && !brick.solved &&
            hero.x < brick.x + brick.width &&
            hero.x + hero.width > brick.x &&
            hero.y < brick.y + brick.height &&
            hero.y + hero.height > brick.y
        ) {
            openMathQuiz(brick);
            return;
        }

        if (brick.x < -50 || brick.x > canvas.width + 50) floatingBricks.splice(i, 1);
    }

    for (let i = cannonballs.length - 1; i >= 0; i--) {
        const cb = cannonballs[i];
        if (messagePauseTimer <= 0) {
            let rocketSpeed = cb.speed + (currentScrollSpeed > 0 ? currentScrollSpeed : 0);
            cb.x -= rocketSpeed;
        }

        ctx.save();
        ctx.translate(cb.x, cb.y);

        ctx.fillStyle = '#1f2937';
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, cb.width, cb.height, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(cb.width, 0);
        ctx.lineTo(cb.width + 14, cb.height / 2);
        ctx.lineTo(cb.width, cb.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(-12, cb.height / 2);
        ctx.lineTo(0, cb.height - 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        const isColliding = 
            hero.x < cb.x + cb.width &&
            hero.x + hero.width > cb.x &&
            hero.y < cb.y + cb.height &&
            hero.y + hero.height > cb.y;

        if (isColliding && !hero.isInvulnerable) {
            audio.playHit();
            lives = Math.max(0, lives - 1);
            hudLives.textContent = lives;
            hero.isInvulnerable = true;
            hero.invulnerableTimer = 60;
            hero.vy = -8;

            cannonballs.splice(i, 1);

            if (lives === 0) {
                triggerGameOver();
                return;
            }
        }

        if (cb.x < -100 || cb.x > canvas.width + 100) cannonballs.splice(i, 1);
    }

    checkLifeMilestones();

    if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateAndRender);
    }
}

// --- EVENTOS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (isPlaying && messagePauseTimer <= 0) {
            hero.jump();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
});

categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.cat;
        hudMode.textContent = btn.textContent.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "").trim().toUpperCase();
    });
});

btnStartGame.addEventListener('click', () => {
    audio.init();
    score = 0;
    coins = 0;
    lives = 3;
    lastLifeMilestone = 0;
    messagePauseTimer = 0;
    sessionUsedQuestions = [];
    questionsAnsweredInRun = 0;

    // Configurar meta según la categoría seleccionada
    targetQuestionsPerRun = (selectedCategory === "ALL") ? 25 : 15;

    hudScore.textContent = "000000";
    hudCoins.textContent = "00";
    hudLives.textContent = lives;

    platforms = [];
    floatingBricks = [];
    coinsList = [];
    cannonballs = [];
    hero.reset();

    screenOverlay.classList.remove('visible');
    isPlaying = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    updateAndRender();
});

hero.reset();
