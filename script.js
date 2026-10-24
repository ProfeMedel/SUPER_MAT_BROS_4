/**
 * Super Math Bros - 4° Nivel
 * Basado en el Currículum Nacional MINEDUC
 */

// =========================================================================
// CONFIGURACIÓN DE RECURSOS E IMAGEN DEL BLOQUE ❓
// =========================================================================
const QUESTION_BLOCK_IMAGE_URL = 'logo.png';

const blockImg = new Image();
let isBlockImageLoaded = false;

blockImg.onload = () => { isBlockImageLoaded = true; };
blockImg.onerror = () => { isBlockImageLoaded = false; };
blockImg.src = QUESTION_BLOCK_IMAGE_URL;

// --- 1. SINTETIZADOR DE SONIDO (Web Audio API) ---
class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn("Audio no soportado en este navegador.");
            }
        }
    }

    playJump() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playCoin() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playCorrect() {
        if (!this.ctx) return;
        let notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            let startTime = this.ctx.currentTime + idx * 0.08;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.linearRampToValueAtTime(0.01, startTime + 0.15);
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    playWrong() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

const audio = new SoundEngine();

// --- 2. BANCO DE PREGUNTAS BASE ---
const questionBank = {
    PROBLEMAS: [
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Camila tenía $850. Compró un jugo de $300 y un alfajor de $250. ¿Cuánto dinero le quedó después de ambas compras?", options: ["$300", "$550", "$250", "$350", "$400"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "En una biblioteca hay 3 repisas. Cada repisa tiene 8 libros. Si regalan 5 libros, ¿cuántos quedan en las repisas?", options: ["19 libros", "24 libros", "18 libros", "29 libros", "15 libros"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Tomás compra 4 paquetes con 5 láminas cada uno. Su amigo le regala 8 láminas más. ¿Cuántas tiene en total?", options: ["28 láminas", "20 láminas", "17 láminas", "32 láminas", "25 láminas"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Un furgón escolar lleva 18 niños. En la 1° parada bajan 6 niños y en la 2° suben 4. ¿Cuántos van en el furgón ahora?", options: ["16 niños", "12 niños", "20 niños", "14 niños", "18 niños"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Don Pedro cosechó 40 naranjas y las repartió por igual en 5 bolsas. Si regala una bolsa completa, ¿cuántas naranjas le quedan?", options: ["32 naranjas", "35 naranjas", "8 naranjas", "24 naranjas", "30 naranjas"], answer: 0 }
    ],
    SUMA: [
        { topic: "SUMA HASTA 1.000", question: "¿Cuánto es 354 + 215?", options: ["569", "559", "579", "669", "469"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "En 3°A juntaron $450 y en 3°B $320. ¿Cuánto reunieron en total?", options: ["$770", "$750", "$670", "$870", "$720"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Suma 612 + 283:", options: ["895", "885", "893", "995", "795"], answer: 0 }
    ],
    RESTA: [
        { topic: "RESTA HASTA 1.000", question: "¿Cuál es el resultado de 685 - 243?", options: ["442", "448", "342", "422", "542"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Tenías $900 y gastaste $350. ¿Cuánto dinero te queda?", options: ["$550", "$650", "$500", "$450", "$600"], answer: 0 }
    ],
    MULT: [
        { topic: "MULTIPLICACIÓN", question: "Un paquete tiene 5 galletas. Si compro 6 paquetes, ¿cuántas galletas tengo?", options: ["30", "25", "35", "20", "40"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "¿Cuánto es 8 × 3?", options: ["24", "21", "27", "18", "30"], answer: 0 }
    ],
    DIV: [
        { topic: "DIVISIÓN EQUITATIVA", question: "Repartes 20 lápices en partes iguales entre 4 niños. ¿Cuántos recibe cada uno?", options: ["5", "4", "6", "10", "2"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Si distribuyes 15 galletas entre 3 amigos por igual, ¿cuántas tiene cada uno?", options: ["5", "3", "4", "6", "15"], answer: 0 }
    ],
    PATRON: [
        { topic: "PATRONES Y SECUENCIAS", question: "Descubre el número faltante: 120, 125, 130, ___, 140", options: ["135", "131", "134", "145", "138"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "¿Cuál es la regla de la secuencia? 500, 450, 400, 350...", options: ["Restar 50", "Sumar 50", "Restar 10", "Restar 100", "Sumar 100"], answer: 0 }
    ],
    RELOJ: [
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora marca el reloj?", type: "clock", hours: 3, minutes: 30, options: ["03:30 hrs", "04:30 hrs", "03:06 hrs", "06:15 hrs", "02:30 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "Indica la hora exacta que señalan las manecillas:", type: "clock", hours: 8, minutes: 15, options: ["08:15 hrs", "08:03 hrs", "03:40 hrs", "09:15 hrs", "07:15 hrs"], answer: 0 }
    ]
};

// Generador auxiliar de preguntas y opciones
function addQuestion(category, item) { questionBank[category].push(item); }
function makeOptions(answer, distractors, suffix = '') {
    return [...new Set([answer, ...distractors].map(v => `${v}${suffix}`))].slice(0, 5);
}
function numericQuestion(topic, question, answer, distractors) {
    return { topic, question, options: makeOptions(answer, distractors), answer: 0 };
}

// Generación dinámica de 40 preguntas por categoría
for (let i = 0; i < 40; i++) {
    const a = 101 + ((i * 37 + 23) % 650), b = 20 + ((i * 19 + 41) % 200), ans = a + b;
    addQuestion('SUMA', numericQuestion('SUMA HASTA 1.000', `Calcula: ${a} + ${b}`, ans, [ans - 10, ans + 10, ans - 100, ans + 100]));
    addQuestion('RESTA', numericQuestion('RESTA HASTA 1.000', `Calcula: ${a + 200} - ${b}`, a + 200 - b, [a + 210 - b, a + 190 - b, a + 300 - b, a - b]));
    addQuestion('MULT', numericQuestion('MULTIPLICACIÓN', `¿Cuánto es ${(i%8)+2} × ${(i%9)+2}?`, ((i%8)+2)*((i%9)+2), [((i%8)+2)*((i%9)+2)+2, ((i%8)+2)*((i%9)+2)-2, 10, 20]));
    addQuestion('DIV', numericQuestion('DIVISIÓN EQUITATIVA', `Reparte ${((i%5)+2)*(i+2)} objetos en ${(i%5)+2} grupos iguales.`, i+2, [i+3, Math.max(1, i+1), i+4, i+5]));

    // Patrones y Secuencias Variables (+2, +3, +4, +6, +8, +10, +15, +20, +25, +50, +100 y patrones decrecientes)
    const patternSteps = [2, 3, 4, 6, 8, 10, 15, 20, 25, 50, 100];
    const step = patternSteps[i % patternSteps.length];
    const isDecreasing = i % 3 === 0;
    let startVal = 40 + ((i * 37) % 700);
    if (isDecreasing) startVal += step * 5;

    let s1 = startVal;
    let s2 = isDecreasing ? startVal - step : startVal + step;
    let s3 = isDecreasing ? startVal - (step * 2) : startVal + (step * 2);
    let ansPatron = isDecreasing ? startVal - (step * 3) : startVal + (step * 3);

    addQuestion('PATRON', {
        topic: 'PATRONES Y SECUENCIAS',
        question: `Completa la secuencia: ${s1}, ${s2}, ${s3}, ___`,
        options: makeOptions(ansPatron, [
            ansPatron + step, 
            ansPatron - step, 
            ansPatron + (step * 2), 
            Math.max(1, ansPatron - 5)
        ]),
        answer: 0
    });

    // Reloj Análogo
    addQuestion('RELOJ', { 
        topic: 'USO DEL RELOJ ANÁLOGO', 
        question: '¿Qué hora marca el reloj?', 
        type: 'clock', 
        hours: (i % 12) + 1, 
        minutes: (i % 4) * 15, 
        options: makeOptions(
            `${String((i % 12) + 1).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')} hrs`,
            ["01:00 hrs", "04:30 hrs", "08:15 hrs", "12:00 hrs", "06:45 hrs"]
        ), 
        answer: 0 
    });

    // Problemas
    addQuestion('PROBLEMAS', { 
        topic: 'RESOLUCIÓN DE PROBLEMAS', 
        question: `Diego junta $${100 + i * 10} y le regalan $${50 + i * 5}. ¿Cuánto dinero junta en total?`, 
        options: [`$${150 + i * 15}`, `$${100 + i * 10}`, `$${200 + i * 15}`, `$${120 + i * 10}`, `$${140 + i * 15}`], 
        answer: 0 
    });
}

function shuffledSample(items, count) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

// --- 3. ESTADO GLOBAL Y PARTÍCULAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    score: 0,
    coins: 0,
    lives: 3,
    active: false,
    cameraX: 0,
    selectedCategory: 'ALL',
    animFrame: 0
};

let particles = [];

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 2,
            size: Math.random() * 4 + 2,
            color: color,
            life: 30
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

const keys = { right: false, left: false, up: false };

const player = {
    x: 50,
    y: 280,
    width: 32,
    height: 44,
    vx: 0,
    vy: 0,
    speed: 4.5,
    jumpPower: -11.5,
    grounded: false,
    direction: 'right'
};

const gravity = 0.55;

let blocks = [];
let coinsList = [];
let flagPole = { x: 7700, y: 180, width: 24, height: 260 };
let currentActiveBlock = null;

function getActiveQuestions() {
    const category = gameState.selectedCategory;
    if (category !== 'ALL' && questionBank[category]) {
        return shuffledSample(questionBank[category], 10);
    }
    return shuffledSample(Object.values(questionBank).flat(), 30);
}

// --- 4. GENERACIÓN DEL NIVEL EXTENDIDO ---
function initLevel() {
    blocks = [];
    coinsList = [];

    let isAllMode = gameState.selectedCategory === 'ALL';
    let questionCount = isAllMode ? 30 : 10;
    let levelLength = isAllMode ? 8000 : 2500;

    flagPole.x = levelLength - 300;

    // Suelo continuo ajustado a la altura de 440px
    for (let x = 0; x < levelLength; x += 40) {
        if ((x > 600 && x < 720) || (x > 1400 && x < 1520) || (x > 3200 && x < 3320) || (x > 5000 && x < 5120)) continue;
        blocks.push({ x: x, y: 440, width: 40, height: 40, type: 'ground' });
    }

    let questionsPool = getActiveQuestions();
    let spacing = isAllMode ? 230 : 200;

    for (let i = 0; i < questionCount; i++) {
        let bx = 220 + (i * spacing);
        let by = (i % 3 === 0) ? 280 : ((i % 3 === 1) ? 320 : 250);
        let qData = questionsPool[i % questionsPool.length];
        
        blocks.push({
            x: bx,
            y: by,
            width: 40,
            height: 40,
            type: 'question',
            hit: false,
            question: qData,
            bounceY: 0
        });

        if (i % 2 === 0) {
            blocks.push({ x: bx + 40, y: by, width: 40, height: 40, type: 'brick' });
        }
    }

    for (let cx = 300; cx < levelLength - 400; cx += 140) {
        coinsList.push({ x: cx, y: 360 + Math.sin(cx) * 30, width: 22, height: 22, collected: false });
    }
}

// --- 5. RELOJ ANÁLOGO COMPACTO ---
function renderAnalogClock(hours, minutes) {
    const clockCanvas = document.getElementById('clockCanvas');
    const cCtx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;
    
    cCtx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
    cCtx.save();
    cCtx.translate(radius, radius);

    let grad = cCtx.createRadialGradient(0, 0, radius - 8, 0, 0, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#cbd5e1');

    cCtx.beginPath();
    cCtx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
    cCtx.fillStyle = grad;
    cCtx.fill();
    cCtx.lineWidth = 4;
    cCtx.strokeStyle = '#00F0FF';
    cCtx.stroke();

    cCtx.font = 'bold 11px Arial';
    cCtx.fillStyle = '#0f172a';
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';

    for (let num = 1; num <= 12; num++) {
        let ang = num * Math.PI / 6;
        cCtx.rotate(ang);
        cCtx.translate(0, -radius + 16);
        cCtx.rotate(-ang);
        cCtx.fillText(num.toString(), 0, 0);
        cCtx.rotate(ang);
        cCtx.translate(0, radius - 16);
        cCtx.rotate(-ang);
    }

    let hourAngle = ((hours % 12) + minutes / 60) * (Math.PI / 6);
    cCtx.rotate(hourAngle);
    cCtx.beginPath();
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -radius * 0.45);
    cCtx.lineWidth = 5;
    cCtx.strokeStyle = '#FF0055';
    cCtx.lineCap = 'round';
    cCtx.stroke();
    cCtx.rotate(-hourAngle);

    let minuteAngle = minutes * (Math.PI / 30);
    cCtx.rotate(minuteAngle);
    cCtx.beginPath();
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -radius * 0.68);
    cCtx.lineWidth = 3;
    cCtx.strokeStyle = '#0284c7';
    cCtx.lineCap = 'round';
    cCtx.stroke();
    cCtx.rotate(-minuteAngle);

    cCtx.beginPath();
    cCtx.arc(0, 0, 4, 0, 2 * Math.PI);
    cCtx.fillStyle = '#0f172a';
    cCtx.fill();

    cCtx.restore();
}

// --- 6. CONTROLES Y TECLAS ---
document.querySelectorAll('.btn-category').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-category').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        gameState.selectedCategory = e.target.getAttribute('data-cat');
    });
});

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        if (!keys.up && player.grounded) {
            player.vy = player.jumpPower;
            player.grounded = false;
            audio.playJump();
            createParticles(player.x + player.width/2, player.y + player.height, '#ffffff', 8);
        }
        keys.up = true;
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
});

const bindTouch = (id, keyName) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        audio.init();
        if (keyName === 'up') {
            if (player.grounded) {
                player.vy = player.jumpPower;
                player.grounded = false;
                audio.playJump();
                createParticles(player.x + player.width/2, player.y + player.height, '#ffffff', 8);
            }
        } else {
            keys[keyName] = true;
        }
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (keyName !== 'up') keys[keyName] = false;
    });
};

bindTouch('btn-left', 'left');
bindTouch('btn-right', 'right');
bindTouch('btn-jump', 'up');

// --- 7. DIBUJO DEL PERSONAJE ---
function drawColorfulPlayer(p) {
    ctx.save();
    
    if (p.direction === 'left') {
        ctx.translate(p.x + p.width, p.y);
        ctx.scale(-1, 1);
    } else {
        ctx.translate(p.x, p.y);
    }

    let legOffset = (p.vx !== 0 && p.grounded) ? Math.sin(gameState.animFrame * 0.35) * 5 : 0;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(16, 42, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zapatos
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(2, 36 + legOffset, 12, 8);
    ctx.fillRect(18, 36 - legOffset, 12, 8);

    // Overol Azul Neón
    ctx.fillStyle = '#0055ff';
    ctx.fillRect(4, 22, 24, 16);
    ctx.fillRect(4, 32 + legOffset, 10, 6);
    ctx.fillRect(18, 32 - legOffset, 10, 6);

    // Tirantes
    ctx.fillStyle = '#002299';
    ctx.fillRect(6, 18, 4, 8);
    ctx.fillRect(22, 18, 4, 8);

    // Botones
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(8, 26, 2.5, 0, Math.PI * 2);
    ctx.arc(24, 26, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Polera
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(4, 14, 24, 8);

    // Guantes
    ctx.fillStyle = '#FFFFFF';
    let armY = p.grounded ? 18 : 10;
    ctx.fillRect(-1, armY, 6, 8);
    ctx.fillRect(27, armY, 6, 8);

    // Cabeza
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(6, 4, 20, 12);

    // Ojos
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(17, 6, 7, 7);
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(20, 7, 4, 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(22, 8, 2, 3);

    // Gorra
    ctx.fillStyle = '#FF0055';
    ctx.fillRect(4, -1, 22, 6);
    ctx.fillRect(14, 3, 15, 4);

    ctx.restore();
}

// --- 8. ACTUALIZACIÓN Y DIBUJO ---
function update() {
    if (!gameState.active) return;

    gameState.animFrame++;

    if (keys.right) {
        player.vx = player.speed;
        player.direction = 'right';
    } else if (keys.left) {
        player.vx = -player.speed;
        player.direction = 'left';
    } else {
        player.vx = 0;
    }

    player.vy += gravity;
    player.x += player.vx;

    // Colisiones Horizontales
    blocks.forEach(b => {
        if (checkCollision(player, b)) {
            if (player.vx > 0) player.x = b.x - player.width;
            else if (player.vx < 0) player.x = b.x + b.width;
        }
    });

    player.y += player.vy;
    player.grounded = false;

    // Colisiones Verticales
    blocks.forEach(b => {
        if (checkCollision(player, b)) {
            if (player.vy > 0 && player.y + player.height - player.vy <= b.y) {
                player.y = b.y - player.height;
                player.vy = 0;
                player.grounded = true;
            } else if (player.vy < 0) {
                player.y = b.y + b.height;
                player.vy = 0;

                if (b.type === 'question' && !b.hit) {
                    triggerMathQuestion(b);
                }
            }
        }
    });

    // Monedas
    coinsList.forEach(c => {
        if (!c.collected && checkCollision(player, c)) {
            c.collected = true;
            gameState.coins++;
            gameState.score += 50;
            audio.playCoin();
            createParticles(c.x + 10, c.y + 10, '#FFD700', 12);
            updateHUD();
        }
    });

    // Caída
    if (player.y > canvas.height + 50) {
        playerLoseLife();
    }

    gameState.cameraX = player.x - 240;
    if (gameState.cameraX < 0) gameState.cameraX = 0;

    updateParticles();

    if (checkCollision(player, flagPole)) {
        audio.playCorrect();
        alert("¡FELICITACIONES! Has completado la gran aventura matemática.");
        resetGame();
    }
}

function checkCollision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

function drawBackground() {
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#1a1c4b');
    skyGrad.addColorStop(0.6, '#5a2a78');
    skyGrad.addColorStop(1, '#ff6b6b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(40, 20, 70, 0.6)';
    for (let i = -100; i < 9000; i += 300) {
        let x = i - gameState.cameraX * 0.2;
        ctx.beginPath();
        ctx.moveTo(x, 440);
        ctx.lineTo(x + 150, 220);
        ctx.lineTo(x + 300, 440);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = -100; i < 9000; i += 400) {
        let x = i - gameState.cameraX * 0.4;
        ctx.beginPath();
        ctx.arc(x, 90, 28, 0, Math.PI * 2);
        ctx.arc(x + 28, 80, 34, 0, Math.PI * 2);
        ctx.arc(x + 56, 90, 28, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    ctx.save();
    ctx.translate(-gameState.cameraX, 0);

    blocks.forEach(b => {
        if (b.type === 'ground') {
            let groundGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
            groundGrad.addColorStop(0, '#22c55e');
            groundGrad.addColorStop(0.2, '#15803d');
            groundGrad.addColorStop(0.21, '#78350f');
            groundGrad.addColorStop(1, '#451a03');

            ctx.fillStyle = groundGrad;
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(b.x, b.y, b.width, b.height);
        } else if (b.type === 'brick') {
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.width, b.height);
        } else if (b.type === 'question') {
            if (b.hit) {
                ctx.fillStyle = '#475569';
                ctx.fillRect(b.x, b.y, b.width, b.height);
                ctx.strokeStyle = '#1e293b';
                ctx.strokeRect(b.x, b.y, b.width, b.height);
                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('✓', b.x + 12, b.y + 26);
            } else {
                if (isBlockImageLoaded) {
                    try {
                        ctx.drawImage(blockImg, b.x, b.y, b.width, b.height);
                    } catch (e) {
                        isBlockImageLoaded = false;
                    }
                } else {
                    let pulse = Math.sin(gameState.animFrame * 0.1) * 3;
                    ctx.fillStyle = '#eab308';
                    ctx.fillRect(b.x, b.y, b.width, b.height);
                    ctx.strokeStyle = '#fef08a';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(b.x + 2, b.y + 2, b.width - 4, b.height - 4);
                    
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText('?', b.x + 14, b.y + 28 + pulse % 2);
                }
            }
        }
    });

    coinsList.forEach(c => {
        if (!c.collected) {
            let floatY = Math.sin(gameState.animFrame * 0.08 + c.x) * 4;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(c.x + 10, c.y + 10 + floatY, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(flagPole.x, flagPole.y, flagPole.width, flagPole.height);
    ctx.fillStyle = '#FF0055';
    ctx.beginPath();
    ctx.moveTo(flagPole.x + 24, flagPole.y);
    ctx.lineTo(flagPole.x + 80, flagPole.y + 30);
    ctx.lineTo(flagPole.x + 24, flagPole.y + 60);
    ctx.fill();

    drawParticles();
    drawColorfulPlayer(player);

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- 9. MODAL Y LÓGICA DE PREGUNTAS ---
function triggerMathQuestion(block) {
    gameState.active = false;
    currentActiveBlock = block;

    const overlay = document.getElementById('math-overlay');
    const topicText = document.getElementById('math-topic');
    const qText = document.getElementById('math-question-text');
    const optionsGrid = document.getElementById('options-container');
    const clockCanvas = document.getElementById('clockCanvas');

    const q = block.question;

    topicText.innerText = `¡DESAFÍO: ${q.topic}!`;
    qText.innerText = q.question;
    optionsGrid.innerHTML = '';

    if (q.type === 'clock') {
        clockCanvas.style.display = 'block';
        renderAnalogClock(q.hours, q.minutes);
    } else {
        clockCanvas.style.display = 'none';
    }

    let optionIndices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);

    optionIndices.forEach(idx => {
        let btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = q.options[idx];
        // Usamos addEventListener con touch-action y respuesta directa
        btn.addEventListener('click', () => {
            handleAnswer(idx === q.answer);
        });
        optionsGrid.appendChild(btn);
    });

    overlay.classList.add('active');
}

function handleAnswer(isCorrect) {
    const overlay = document.getElementById('math-overlay');
    overlay.classList.remove('active');

    if (isCorrect) {
        audio.playCorrect();
        gameState.score += 200;
        gameState.coins += 5;
        if (currentActiveBlock) currentActiveBlock.hit = true;
        createParticles(player.x + 16, player.y, '#00FFCC', 25);
    } else {
        audio.playWrong();
        gameState.lives--;
        if (gameState.lives <= 0) {
            alert("¡Se te han acabado las vidas! Inténtalo de nuevo.");
            resetGame();
            return;
        }
    }

    updateHUD();
    gameState.active = true;
}

function playerLoseLife() {
    audio.playWrong();
    gameState.lives--;
    updateHUD();

    if (gameState.lives <= 0) {
        alert("¡Game Over! Vuelve a intentar el nivel.");
        resetGame();
    } else {
        player.x = 50;
        player.y = 280;
        player.vx = 0;
        player.vy = 0;
    }
}

function updateHUD() {
    document.getElementById('hud-score').innerText = gameState.score.toString().padStart(6, '0');
    document.getElementById('hud-coins').innerText = gameState.coins.toString().padStart(2, '0');
    document.getElementById('hud-lives').innerText = gameState.lives;
    document.getElementById('hud-mode').innerText = gameState.selectedCategory;
}

function resetGame() {
    gameState.active = false;
    player.x = 50;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    gameState.cameraX = 0;
    updateHUD();
    initLevel();
    document.getElementById('screen-overlay').classList.add('visible');
}

document.getElementById('btn-start-game').addEventListener('click', () => {
    audio.init();
    gameState.score = 0;
    gameState.coins = 0;
    gameState.lives = 3;
    player.x = 50;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    gameState.cameraX = 0;
    document.getElementById('screen-overlay').classList.remove('visible');
    updateHUD();
    initLevel();
    gameState.active = true;
});

// Inicialización de arranque
initLevel();
gameLoop();
