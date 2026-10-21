/**
 * Super Math Bros - 3° Básico Chile
 * Basado en el Currículum Nacional MINEDUC
 */

// =========================================================================
// CONFIGURACIÓN DE RECURSOS E IMAGEN DEL BLOQUE ❓
// =========================================================================
const QUESTION_BLOCK_IMAGE_URL = 'logo.png';

const blockImg = new Image();
let isBlockImageLoaded = false;

blockImg.onload = () => {
    isBlockImageLoaded = true;
};

blockImg.onerror = () => {
    isBlockImageLoaded = false;
};

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

// --- 2. BANCO DE PREGUNTAS COMPLETO ---
const questionBank = {
    PROBLEMAS: [
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Camila tenía $850. Compró un jugo de $300 y un alfajor de $250. ¿Cuánto dinero le quedó después de ambas compras?", options: ["$300", "$550", "$250", "$350", "$400"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "En una biblioteca hay 3 repisas. Cada repisa tiene 8 libros. Si regalan 5 libros, ¿cuántos quedan en las repisas?", options: ["19 libros", "24 libros", "18 libros", "29 libros", "15 libros"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Tomás compra 4 paquetes con 5 láminas cada uno. Su amigo le regala 8 láminas más. ¿Cuántas tiene en total?", options: ["28 láminas", "20 láminas", "17 láminas", "32 láminas", "25 láminas"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Un furgón escolar lleva 18 niños. En la 1° parada bajan 6 niños y en la 2° suben 4. ¿Cuántos van en el furgón ahora?", options: ["16 niños", "12 niños", "20 niños", "14 niños", "18 niños"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Don Pedro cosechó 40 naranjas y las repartió por igual en 5 bolsas. Si regala una bolsa completa, ¿cuántas naranjas le quedan?", options: ["32 naranjas", "35 naranjas", "8 naranjas", "24 naranjas", "30 naranjas"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Matías corrió 450m en la mañana y 380m en la tarde. ¿Cuántos metros le faltan para llegar a 1.000m?", options: ["170 metros", "830 metros", "270 metros", "150 metros", "200 metros"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Un pastelero hornea 6 bandejas con 10 empanadas cada una. Si vende 45 empanadas, ¿cuántas le quedan por vender?", options: ["15 empanadas", "25 empanadas", "60 empanadas", "10 empanadas", "20 empanadas"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Lucía tiene $900. Compra un cuaderno de $500 y con el sobrante compra lápices de $100 cada uno. ¿Cuántos lápices compró?", options: ["4 lápices", "5 lápices", "9 lápices", "3 lápices", "6 lápices"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "En un taller hay 2 cajas con 10 pinceles cada una. Si 3 pinceles están dañados y se botan, ¿cuántos pinceles buenos quedan?", options: ["17 pinceles", "20 pinceles", "13 pinceles", "23 pinceles", "18 pinceles"], answer: 0 },
        { topic: "RESOLUCIÓN DE PROBLEMAS", question: "Sofi junta $100 cada día de lunes a viernes. El sábado gasta $200. ¿Cuánto dinero le queda al final del sábado?", options: ["$300", "$500", "$200", "$400", "$350"], answer: 0 }
    ],
    SUMA: [
        { topic: "SUMA HASTA 1.000", question: "¿Cuánto es 354 + 215?", options: ["569", "559", "579", "669", "469"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "En 3°A juntaron $450 y en 3°B $320. ¿Cuánto reunieron en total?", options: ["$770", "$750", "$670", "$870", "$720"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Suma 612 + 283:", options: ["895", "885", "893", "995", "795"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "¿Cuánto es 125 + 450?", options: ["575", "565", "585", "675", "525"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Un bus lleva 230 pasajeros y suben 140 más. ¿Cuántos hay ahora?", options: ["370", "360", "380", "470", "270"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Resuelve: 500 + 380", options: ["880", "850", "800", "980", "780"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Si sumas 240 + 360, obtienes:", options: ["600", "500", "540", "660", "700"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "Calcula 710 + 190:", options: ["900", "800", "890", "910", "990"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "En la biblioteca hay 415 libros de cuentos y 230 de ciencia. ¿Cuántos hay en total?", options: ["645", "635", "655", "745", "545"], answer: 0 },
        { topic: "SUMA HASTA 1.000", question: "¿Cuánto es 333 + 333?", options: ["666", "633", "699", "999", "600"], answer: 0 }
    ],
    RESTA: [
        { topic: "RESTA HASTA 1.000", question: "¿Cuál es el resultado de 685 - 243?", options: ["442", "448", "342", "422", "542"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Tenías $900 y gastaste $350. ¿Cuánto dinero te queda?", options: ["$550", "$650", "$500", "$450", "$600"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Calcula: 750 - 200", options: ["550", "500", "450", "600", "520"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "En un árbol había 480 manzanas y cosecharon 130. ¿Cuántas quedan?", options: ["350", "330", "320", "380", "250"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "¿Cuánto es 500 - 150?", options: ["350", "400", "300", "250", "450"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Resuelve: 890 - 440", options: ["450", "430", "410", "550", "350"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Un álbum tiene 300 láminas y pegaste 120. ¿Cuántas te faltan?", options: ["180", "170", "190", "200", "150"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "¿Cuánto es 950 - 300?", options: ["650", "600", "700", "550", "680"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Calcula 640 - 210:", options: ["430", "420", "440", "530", "330"], answer: 0 },
        { topic: "RESTA HASTA 1.000", question: "Si a 800 le restas 250, resulta:", options: ["550", "600", "500", "650", "450"], answer: 0 }
    ],
    MULT: [
        { topic: "MULTIPLICACIÓN", question: "Un paquete tiene 5 galletas. Si compro 6 paquetes, ¿cuántas galletas tengo?", options: ["30", "25", "35", "20", "40"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "¿Cuánto es 8 × 3?", options: ["24", "21", "27", "18", "30"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Si hay 4 cajas con 10 lápices cada una, ¿cuántos lápices hay en total?", options: ["40", "30", "50", "14", "44"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Calcula: 7 × 2", options: ["14", "12", "16", "18", "10"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "¿Cuánto es 9 × 5?", options: ["45", "40", "50", "35", "55"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Una mesa tiene 4 patas. ¿Cuántas patas hay en 5 mesas?", options: ["20", "16", "24", "25", "18"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Resuelve: 3 × 10", options: ["30", "20", "40", "13", "33"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "¿Cuánto es 6 × 3?", options: ["18", "15", "21", "24", "12"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Un auto lleva 5 pasajeros. ¿Cuántos llevan 8 autos iguales?", options: ["40", "35", "45", "30", "50"], answer: 0 },
        { topic: "MULTIPLICACIÓN", question: "Calcula: 10 × 10", options: ["100", "90", "110", "20", "1000"], answer: 0 }
    ],
    DIV: [
        { topic: "DIVISIÓN EQUITATIVA", question: "Repartes 20 lápices en partes iguales entre 4 niños. ¿Cuántos recibe cada uno?", options: ["5", "4", "6", "10", "2"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Si distribuyes 15 galletas entre 3 amigos por igual, ¿cuántas tiene cada uno?", options: ["5", "3", "4", "6", "15"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Tienes 12 manzanas y las colocas en 2 bolsas por igual. ¿Cuántas van por bolsa?", options: ["6", "5", "7", "4", "2"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Repartes 30 caramelos entre 5 niños de forma equitativa. ¿Cuántos recibe cada uno?", options: ["6", "5", "7", "8", "4"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "¿Cuánto es 18 dividido en 3?", options: ["6", "5", "7", "9", "3"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Si divides 50 chocolates entre 10 personas, ¿cuántos le tocan a cada una?", options: ["5", "10", "4", "6", "8"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Tienes 16 globos y los separas en 4 grupos iguales. ¿Cuántos hay en cada grupo?", options: ["4", "3", "5", "6", "8"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Repartes 25 stickers a 5 alumnos por igual. ¿Cuántos recibe cada uno?", options: ["5", "4", "6", "7", "25"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "¿Cuánto es 10 : 2?", options: ["5", "2", "4", "6", "8"], answer: 0 },
        { topic: "DIVISIÓN EQUITATIVA", question: "Repartes 40 cartas entre 4 jugadores. ¿Cuántas cartas recibe cada uno?", options: ["10", "8", "12", "5", "20"], answer: 0 }
    ],
    PATRON: [
        { topic: "PATRONES Y SECUENCIAS", question: "Descubre el número faltante: 120, 125, 130, ___, 140", options: ["135", "131", "134", "145", "138"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "¿Cuál es la regla de la secuencia? 500, 450, 400, 350...", options: ["Restar 50", "Sumar 50", "Restar 10", "Restar 100", "Sumar 100"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "Completa la secuencia: 10, 20, 30, 40, ___", options: ["50", "45", "60", "55", "41"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "¿Qué número falta? 2, 4, 6, ___, 10", options: ["8", "7", "9", "12", "5"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "Descubre el patrón: 100, 200, 300, 400, ___", options: ["500", "450", "600", "550", "410"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "Completa: 15, 20, 25, 30, ___", options: ["35", "31", "40", "34", "36"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "¿Cuál es el número que sigue? 90, 80, 70, 60, ___", options: ["50", "40", "55", "65", "45"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "Regla de la secuencia: 3, 6, 9, 12, 15...", options: ["Sumar 3", "Sumar 2", "Sumar 6", "Restar 3", "Multiplicar por 3"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "Completa: 250, 260, 270, ___", options: ["280", "275", "290", "300", "285"], answer: 0 },
        { topic: "PATRONES Y SECUENCIAS", question: "¿Qué número falta? 50, 45, 40, ___, 30", options: ["35", "38", "32", "36", "34"], answer: 0 }
    ],
    RELOJ: [
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora marca el reloj?", type: "clock", hours: 3, minutes: 30, options: ["03:30 hrs", "04:30 hrs", "03:06 hrs", "06:15 hrs", "02:30 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "Indica la hora exacta que señalan las manecillas:", type: "clock", hours: 8, minutes: 15, options: ["08:15 hrs", "08:03 hrs", "03:40 hrs", "09:15 hrs", "07:15 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora muestra el reloj?", type: "clock", hours: 12, minutes: 0, options: ["12:00 hrs", "12:06 hrs", "06:00 hrs", "01:00 hrs", "11:00 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora marca el reloj?", type: "clock", hours: 6, minutes: 45, options: ["06:45 hrs", "07:45 hrs", "06:09 hrs", "09:30 hrs", "05:45 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "Lee la hora en el reloj:", type: "clock", hours: 1, minutes: 30, options: ["01:30 hrs", "02:30 hrs", "01:06 hrs", "06:05 hrs", "12:30 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora es?", type: "clock", hours: 9, minutes: 0, options: ["09:00 hrs", "12:45 hrs", "09:12 hrs", "10:00 hrs", "08:00 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "Indica la hora que marca:", type: "clock", hours: 4, minutes: 15, options: ["04:15 hrs", "03:20 hrs", "04:03 hrs", "05:15 hrs", "04:45 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora muestra el reloj?", type: "clock", hours: 10, minutes: 30, options: ["10:30 hrs", "11:30 hrs", "10:06 hrs", "06:50 hrs", "09:30 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "¿Qué hora marca el reloj?", type: "clock", hours: 2, minutes: 0, options: ["02:00 hrs", "12:10 hrs", "02:12 hrs", "03:00 hrs", "01:00 hrs"], answer: 0 },
        { topic: "USO DEL RELOJ ANÁLOGO", question: "Indica la hora señalada:", type: "clock", hours: 5, minutes: 45, options: ["05:45 hrs", "06:45 hrs", "05:09 hrs", "09:25 hrs", "04:45 hrs"], answer: 0 }
    ]
};


// --- EXPANSIÓN DEL BANCO: 50 preguntas únicas por categoría ---
// Se conservan las 10 preguntas originales y se agregan 40 variantes nuevas por categoría.
function addQuestion(category, item) {
    questionBank[category].push(item);
}
function makeOptions(answer, distractors, suffix = '') {
    const values = [answer, ...distractors].map(v => `${v}${suffix}`);
    return [...new Set(values)].slice(0, 5);
}
function numericQuestion(topic, question, answer, distractors) {
    return { topic, question, options: makeOptions(answer, distractors), answer: 0 };
}
for (let i = 0; i < 40; i++) {
    // Sumas hasta 1.000
    {
        const a = 101 + ((i * 37 + 23) % 650);
        const b = 20 + ((i * 19 + 41) % Math.min(1000 - a, 250));
        const ans = a + b;
        addQuestion('SUMA', numericQuestion('SUMA HASTA 1.000', `Calcula: ${a} + ${b}`, ans,
            [ans - 10, ans + 10, ans - 100, ans + 100]));
    }
    // Restas hasta 1.000
    {
        const a = 250 + ((i * 43 + 17) % 700);
        const b = 20 + ((i * 23 + 9) % Math.min(a - 19, 300));
        const ans = a - b;
        addQuestion('RESTA', numericQuestion('RESTA HASTA 1.000', `Calcula: ${a} - ${b}`, ans,
            [ans + 10, ans - 10, ans + 100, Math.abs(ans - 50)]));
    }
    // Multiplicación
    {
        const factors = [2, 3, 5, 10];
        const a = factors[i % factors.length];
        const x = 2 + ((i * 3 + 1) % 9);
        const ans = a * x;
        addQuestion('MULT', numericQuestion('MULTIPLICACIÓN', `¿Cuánto es ${a} × ${x}?`, ans,
            [ans + a, ans - a, ans + 2, ans + 10]));
    }
    // División exacta
    {
        const divisors = [2, 3, 5, 10];
        const d = divisors[i % divisors.length];
        const quotient = 2 + ((i * 7 + 3) % 10);
        const dividend = d * quotient;
        addQuestion('DIV', numericQuestion('DIVISIÓN EQUITATIVA',
            `Reparte ${dividend} objetos en ${d} grupos iguales. ¿Cuántos objetos hay en cada grupo?`,
            quotient, [quotient + 1, Math.max(1, quotient - 1), quotient + 2, d]));
    }
    // Patrones y secuencias
    {
        const steps = [2, 3, 5, 10, 20, 25, 50];
        const step = steps[i % steps.length];
        const start = 10 + (i * 13 % 200);
        const ans = start + step * 3;
        addQuestion('PATRON', {
            topic: 'PATRONES Y SECUENCIAS',
            question: `Completa la secuencia: ${start}, ${start + step}, ${start + 2 * step}, ___`,
            options: [String(ans), String(ans + step), String(ans - step), String(ans + 2), String(ans - 2)],
            answer: 0
        });
    }
    // Reloj análogo: horas y minutos variados
    {
        const hours = 1 + ((i * 5 + 2) % 12);
        const minuteValues = [0, 15, 30, 45];
        const minutes = minuteValues[i % minuteValues.length];
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const answerText = `${hh}:${mm} hrs`;
        const wrong1 = `${String(hours % 12 + 1).padStart(2, '0')}:${mm} hrs`;
        const wrong2 = `${hh}:${String((minutes + 15) % 60).padStart(2, '0')} hrs`;
        const wrong3 = `${String(hours).padStart(2, '0')}:${String((minutes + 30) % 60).padStart(2, '0')} hrs`;
        const wrong4 = `${String((hours + 10) % 12 + 1).padStart(2, '0')}:${mm} hrs`;
        addQuestion('RELOJ', { topic: 'USO DEL RELOJ ANÁLOGO',
            question: '¿Qué hora marca el reloj?', type: 'clock', hours, minutes,
            options: [answerText, wrong1, wrong2, wrong3, wrong4], answer: 0 });
    }
    // Problemas contextualizados, con una respuesta correcta y distractores.
    {
        const a = 120 + (i * 17 % 300);
        const b = 30 + (i * 11 % 150);
        const c = 10 + (i * 7 % 60);
        const total = a + b - c;
        addQuestion('PROBLEMAS', {
            topic: 'RESOLUCIÓN DE PROBLEMAS',
            question: `Una escuela reunió ${a} lápices el lunes y ${b} el martes. Luego entregó ${c} lápices. ¿Cuántos lápices quedaron?`,
            options: [`${total} lápices`, `${a + b} lápices`, `${total + c} lápices`, `${Math.max(0, a - b)} lápices`, `${total + 10} lápices`],
            answer: 0
        });
    }
}

// Mezcla una copia del banco y selecciona la cantidad exacta de preguntas sin repetir.
function shuffledSample(items, count) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

// --- 3. ESTADO GLOBAL DEL JUEGO ---
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

const keys = { right: false, left: false, up: false };

// Personaje
const player = {
    x: 50,
    y: 200,
    width: 32,
    height: 44,
    vx: 0,
    vy: 0,
    speed: 4,
    jumpPower: -11,
    grounded: false,
    direction: 'right'
};

const gravity = 0.5;

let blocks = [];
let coinsList = [];
let flagPole = { x: 7700, y: 100, width: 20, height: 220 };
let currentActiveBlock = null;

// --- 4. OBTENER PREGUNTAS ---
// Categorías individuales: 10 preguntas aleatorias de sus 50.
// TODAS AL AZAR: 30 preguntas aleatorias del banco completo (350 preguntas).
function getActiveQuestions() {
    const category = gameState.selectedCategory;
    if (category !== 'ALL' && questionBank[category]) {
        return shuffledSample(questionBank[category], 10);
    }
    const allQuestions = Object.values(questionBank).flat();
    return shuffledSample(allQuestions, 30);
}

// --- 5. GENERACIÓN DEL NIVEL EXTENDIDO ---
function initLevel() {
    blocks = [];
    coinsList = [];

    let isAllMode = gameState.selectedCategory === 'ALL';
    let questionCount = isAllMode ? 30 : 10;
    let levelLength = isAllMode ? 8000 : 2500;

    // Actualizar posición del banderín de meta
    flagPole.x = levelLength - 300;

    // Suelo continuo con agujeros
    for (let x = 0; x < levelLength; x += 40) {
        if ((x > 600 && x < 720) || (x > 1400 && x < 1520) || (x > 3200 && x < 3320) || (x > 5000 && x < 5120)) continue;
        blocks.push({ x: x, y: 360, width: 40, height: 40, type: 'ground' });
    }

    let questionsPool = getActiveQuestions();

    // Generar posiciones distribuidas para los bloques ❓
    let blockPositions = [];
    let spacing = isAllMode ? 230 : 200;

    for (let i = 0; i < questionCount; i++) {
        let bx = 200 + (i * spacing);
        let by = (i % 3 === 0) ? 200 : ((i % 3 === 1) ? 240 : 180);
        blockPositions.push({ x: bx, y: by });
    }

    blockPositions.forEach((pos, idx) => {
        let qData = questionsPool[idx % questionsPool.length];
        blocks.push({
            x: pos.x,
            y: pos.y,
            width: 40,
            height: 40,
            type: 'question',
            hit: false,
            question: qData
        });

        // Ladrillos decorativos junto a algunos bloques
        if (idx % 2 === 0) {
            blocks.push({ x: pos.x + 40, y: pos.y, width: 40, height: 40, type: 'brick' });
        }
    });

    // Monedas a lo largo de todo el nivel
    for (let cx = 300; cx < levelLength - 400; cx += 150) {
        coinsList.push({ x: cx, y: 300, width: 20, height: 20, collected: false });
    }
}

// --- 6. RELOJ ANÁLOGO ---
function renderAnalogClock(hours, minutes) {
    const clockCanvas = document.getElementById('clockCanvas');
    const cCtx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;
    
    cCtx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
    cCtx.save();
    cCtx.translate(radius, radius);
    cCtx.beginPath();
    cCtx.arc(0, 0, radius - 6, 0, 2 * Math.PI);
    cCtx.fillStyle = '#ffffff';
    cCtx.fill();
    cCtx.lineWidth = 5;
    cCtx.strokeStyle = '#1e293b';
    cCtx.stroke();

    cCtx.font = 'bold 12px Arial';
    cCtx.fillStyle = '#000000';
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';
    for (let num = 1; num <= 12; num++) {
        let ang = num * Math.PI / 6;
        cCtx.rotate(ang);
        cCtx.translate(0, -radius + 20);
        cCtx.rotate(-ang);
        cCtx.fillText(num.toString(), 0, 0);
        cCtx.rotate(ang);
        cCtx.translate(0, radius - 20);
        cCtx.rotate(-ang);
    }

    let hourAngle = ((hours % 12) + minutes / 60) * (Math.PI / 6);
    cCtx.rotate(hourAngle);
    cCtx.beginPath();
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -radius * 0.45);
    cCtx.lineWidth = 5;
    cCtx.strokeStyle = '#ef4444';
    cCtx.lineCap = 'round';
    cCtx.stroke();
    cCtx.rotate(-hourAngle);

    let minuteAngle = minutes * (Math.PI / 30);
    cCtx.rotate(minuteAngle);
    cCtx.beginPath();
    cCtx.moveTo(0, 0);
    cCtx.lineTo(0, -radius * 0.7);
    cCtx.lineWidth = 3;
    cCtx.strokeStyle = '#0284c7';
    cCtx.lineCap = 'round';
    cCtx.stroke();
    cCtx.rotate(-minuteAngle);

    cCtx.beginPath();
    cCtx.arc(0, 0, 4, 0, 2 * Math.PI);
    cCtx.fillStyle = '#1e293b';
    cCtx.fill();

    cCtx.restore();
}

// --- 7. CONTROLES SELECCIÓN DE CATEGORÍA Y EVENTOS ---
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

// --- 8. DIBUJO DEL PERSONAJE COLORIDO ---
function drawColorfulPlayer(p) {
    ctx.save();
    
    if (p.direction === 'left') {
        ctx.translate(p.x + p.width, p.y);
        ctx.scale(-1, 1);
    } else {
        ctx.translate(p.x, p.y);
    }

    let legOffset = (p.vx !== 0 && p.grounded) ? Math.sin(gameState.animFrame * 0.3) * 4 : 0;

    // Zapatos
    ctx.fillStyle = '#6e3c1b';
    ctx.fillRect(2, 36 + legOffset, 12, 8);
    ctx.fillRect(18, 36 - legOffset, 12, 8);

    // Overol Azul
    ctx.fillStyle = '#0055ff';
    ctx.fillRect(4, 22, 24, 16);
    ctx.fillRect(4, 32 + legOffset, 10, 6);
    ctx.fillRect(18, 32 - legOffset, 10, 6);

    // Tirantes
    ctx.fillStyle = '#0033cc';
    ctx.fillRect(6, 18, 4, 8);
    ctx.fillRect(22, 18, 4, 8);

    // Botones
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(6, 24, 4, 4);
    ctx.fillRect(22, 24, 4, 4);

    // Polera Naranja
    ctx.fillStyle = '#ff9900';
    ctx.fillRect(4, 14, 24, 8);

    // Guantes
    ctx.fillStyle = '#ffffff';
    let armY = p.grounded ? 18 : 10;
    ctx.fillRect(0, armY, 6, 8);
    ctx.fillRect(26, armY, 6, 8);

    // Cabeza
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(6, 4, 20, 12);

    // Ojos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 6, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(21, 8, 3, 3);

    // Gorra Roja
    ctx.fillStyle = '#ff1a1a';
    ctx.fillRect(4, 0, 22, 6);
    ctx.fillRect(14, 4, 14, 3);

    ctx.restore();
}

// --- 9. BUCLE Y DIBUJO ---
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
            updateHUD();
        }
    });

    // Caída
    if (player.y > canvas.height + 50) {
        playerLoseLife();
    }

    // Cámara
    gameState.cameraX = player.x - 200;
    if (gameState.cameraX < 0) gameState.cameraX = 0;

    // Meta
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-gameState.cameraX, 0);

    // Dibujar Bloques
    blocks.forEach(b => {
        if (b.type === 'ground') {
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(b.x, b.y, b.width, 8);
        } else if (b.type === 'brick') {
            ctx.fillStyle = '#b33939';
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeStyle = '#2c2c2c';
            ctx.strokeRect(b.x, b.y, b.width, b.height);
        } else if (b.type === 'question') {
            if (b.hit) {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(b.x, b.y, b.width, b.height);
                ctx.strokeStyle = '#2c3e50';
                ctx.strokeRect(b.x, b.y, b.width, b.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('✓', b.x + 10, b.y + 28);
            } else {
                if (isBlockImageLoaded) {
                    try {
                        ctx.drawImage(blockImg, b.x, b.y, b.width, b.height);
                    } catch (e) {
                        isBlockImageLoaded = false;
                    }
                } else {
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(b.x, b.y, b.width, b.height);
                    ctx.strokeStyle = '#d35400';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(b.x, b.y, b.width, b.height);
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 22px Arial';
                    ctx.fillText('?', b.x + 14, b.y + 28);
                }
            }
        }
    });

    // Monedas
    coinsList.forEach(c => {
        if (!c.collected) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(c.x + 10, c.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f39c12';
            ctx.stroke();
        }
    });

    // Meta
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(flagPole.x, flagPole.y, flagPole.width, flagPole.height);
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(flagPole.x + 20, flagPole.y);
    ctx.lineTo(flagPole.x + 70, flagPole.y + 25);
    ctx.lineTo(flagPole.x + 20, flagPole.y + 50);
    ctx.fill();

    // Personaje
    drawColorfulPlayer(player);

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- 10. MODAL Y MANEJO DE PREGUNTAS ---
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
        btn.onclick = () => handleAnswer(idx === q.answer);
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
        player.y = 200;
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
    // Volver al menú NO borra puntos ni monedas.
    // El reinicio de estos valores ocurre solamente al pulsar COMENZAR AVENTURA.
    gameState.active = false;
    player.x = 50;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
    gameState.cameraX = 0;
    updateHUD();
    initLevel();
    document.getElementById('screen-overlay').classList.add('visible');
}

// Iniciar / reiniciar aventura: aquí sí se reinician puntos y monedas.
document.getElementById('btn-start-game').addEventListener('click', () => {
    audio.init();
    gameState.score = 0;
    gameState.coins = 0;
    gameState.lives = 3;
    player.x = 50;
    player.y = 200;
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