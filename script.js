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

// Web Audio for apple and crash
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

function playCrashSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// Screen shake
function shakeScreen() {
    const container = document.querySelector(".game-container");
    container.classList.add("shake");
    setTimeout(() => container.classList.remove("shake"), 400);
}

// Reset game
function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 1;
    dy = 0;
    score = 0;
    gameSpeed = 160;
    generateFood();
    document.getElementById("score").textContent = score;
}

// Generate food
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

// Draw grass tiles
function drawBoard() {
    for (let x = 0; x < tileCount; x++) {
        for (let y = 0; y < tileCount; y++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#90ee90' : '#76c776';
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }
}

// Draw snake with eyes and rounded body (works everywhere)
function drawSnake() {
    snake.forEach((segment, i) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        ctx.fillStyle = i === 0 ? '#45b7b8' : '#4ecdc4';

        const radius = gridSize / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + gridSize - radius, y);
        ctx.quadraticCurveTo(x + gridSize, y, x + gridSize, y + radius);
        ctx.lineTo(x + gridSize, y + gridSize - radius);
        ctx.quadraticCurveTo(x + gridSize, y + gridSize, x + gridSize - radius, y + gridSize);
        ctx.lineTo(x + radius, y + gridSize);
        ctx.quadraticCurveTo(x, y + gridSize, x, y + gridSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Eyes on head
        if (i === 0) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x + 6 + dx*4, y + 8 + dy*4, 2.5, 0, Math.PI*2);
            ctx.arc(x + 14 + dx*4, y + 8 + dy*4, 2.5, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

// Draw apple
function drawFood() {
    const cx = food.x * gridSize + gridSize/2;
    const cy = food.y * gridSize + gridSize/2;
    const r = gridSize/2 - 2;

    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fill();

    // Leaf
    ctx.fillStyle = '#34c759';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx - r*0.8, cy - r*1.4);
    ctx.lineTo(cx + r*0.4, cy - r*1.2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(cx - r/2, cy - r/2, r/2.5, 0, Math.PI*2);
    ctx.fill();
}

// Move snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        gameRunning = false;
        playCrashSound();
        shakeScreen();
        setTimeout(() => {
            document.getElementById("finalScore").textContent = score;
            document.getElementById("gameOverMenu").classList.remove("hidden");
        }, 500);
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").textContent = score;
        playEatSound();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById("highScore").textContent = highScore;
        }
        if (gameSpeed > minSpeed) gameSpeed -= speedIncrease;
        generateFood();
    } else {
        snake.pop();
    }
}

// Main game loop
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

// Controls
document.addEventListener("keydown", e => {
    if (!gameRunning) return;
    if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
    if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
    if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
});

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
    audioCtx.resume();
    document.getElementById("startMenu").classList.add("hidden");
    resetGame();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("gameOverMenu").classList.add("hidden");
    resetGame();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
});

// Initialize high score
highScore = localStorage.getItem('snakeHighScore') || 0;
document.getElementById("highScore").textContent = highScore;
