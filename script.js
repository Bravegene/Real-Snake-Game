const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, food, dx, dy, score, highScore;
let gameRunning = false;
let gameSpeed = 160;
const minSpeed = 70;
const speedIncrease = 5;
let lastTime = 0;

// Web Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playEatSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = 600 + Math.random() * 120;

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 1;
    dy = 0;
    score = 0;
    gameSpeed = 160;
    generateFood();
    document.getElementById("score").textContent = score;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function drawBoard() {
    for (let x = 0; x < tileCount; x++) {
        for (let y = 0; y < tileCount; y++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#90ee90' : '#76c776';
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }
}

function drawSnake() {
    snake.forEach((segment, i) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;

        ctx.fillStyle = i === 0 ? '#45b7b8' : '#4ecdc4';
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, gridSize/2);
        ctx.fill();

        if (i === 0) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x + 8 + dx*4, y + 8 + dy*4, 3, 0, Math.PI*2);
            ctx.arc(x + 12 + dx*4, y + 8 + dy*4, 3, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

function drawFood() {
    const cx = food.x * gridSize + gridSize/2;
    const cy = food.y * gridSize + gridSize/2;
    const r = gridSize/2 - 2;

    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#34c759';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx - r*0.8, cy - r*1.4);
    ctx.lineTo(cx + r*0.4, cy - r*1.2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(cx - r/2, cy - r/2, r/2.5, 0, Math.PI*2);
    ctx.fill();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        gameRunning = false;
        document.getElementById("startMenu").style.display = "flex";
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").textContent = score;
        playEatSound();

        if (gameSpeed > minSpeed) gameSpeed -= speedIncrease;
        generateFood();
    } else {
        snake.pop();
    }
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    if (timestamp - lastTime > gameSpeed) {
        moveSnake();
        lastTime = timestamp;
    }

    drawBoard();
    drawFood();
    drawSnake();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
    if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
    if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
});

document.getElementById("startBtn").addEventListener("click", () => {
    audioCtx.resume();
    document.getElementById("startMenu").style.display = "none";
    resetGame();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
});
