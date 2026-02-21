const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configuration
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameOverActive = false;
let gameLoop;

// Initialize
document.getElementById('highScore').textContent = highScore;
generateFood();
drawGame();


// =======================
// FOOD
// =======================

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}


// =======================
// DRAWING
// =======================

// 🌱 Draw tiled grass board
function clearCanvas() {
    for (let x = 0; x < tileCount; x++) {
        for (let y = 0; y < tileCount; y++) {

            if ((x + y) % 2 === 0) {
                ctx.fillStyle = '#90ee90'; // light green
            } else {
                ctx.fillStyle = '#76c776'; // darker green
            }

            ctx.fillRect(
                x * gridSize,
                y * gridSize,
                gridSize,
                gridSize
            );
        }
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];

        ctx.fillStyle = i === 0 ? '#45b7b8' : '#4ecdc4';

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    }
}

function drawFood() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 3,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function drawScore() {
    document.getElementById('score').textContent = score;
}

function drawGame() {
    clearCanvas();
    drawSnake();
    drawFood();
    drawScore();
}


// =======================
// GAME LOGIC
// =======================

function moveSnake() {
    if (!gameRunning || gameOverActive) return;

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Wall collision
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount
    ) {
        gameOver();
        return;
    }

    // Self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }

    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    gameOverActive = true;
    dx = 0;
    dy = 0;

    clearInterval(gameLoop);
    gameLoop = null;

    const gameOverDiv = document.getElementById('gameOver');
    if (gameOverDiv) {
        gameOverDiv.classList.remove('hidden');
        document.getElementById('finalScore').textContent = score;
    }
}


// =======================
// START / RESET
// =======================

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    gameOverActive = false;
    gameRunning = false;

    const gameOverDiv = document.getElementById('gameOver');
    if (gameOverDiv) gameOverDiv.classList.add('hidden');

    clearInterval(gameLoop);
    gameLoop = null;

    generateFood();
    drawGame();
}

function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gameOverActive = false;

    if (dx === 0 && dy === 0) {
        dx = 1;
        dy = 0;
    }

    gameLoop = setInterval(() => {
        moveSnake();
        drawGame();
    }, 100);
}


// =======================
// CONTROLS
// =======================

document.addEventListener('keydown', (e) => {

    if (gameOverActive) return;

    if (!gameRunning && e.key.startsWith('Arrow')) {
        startGame();
    }

    if (!gameRunning) return;

    if (
        (e.key === 'ArrowLeft' && dx === 1) ||
        (e.key === 'ArrowRight' && dx === -1) ||
        (e.key === 'ArrowUp' && dy === 1) ||
        (e.key === 'ArrowDown' && dy === -1)
    ) return;

    switch (e.key) {
        case 'ArrowUp': dx = 0; dy = -1; break;
        case 'ArrowDown': dx = 0; dy = 1; break;
        case 'ArrowLeft': dx = -1; dy = 0; break;
        case 'ArrowRight': dx = 1; dy = 0; break;
    }
});


// =======================
// TOUCH CONTROLS
// =======================

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOverActive) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameOverActive) return;

    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && dx !== 1) { dx = -1; dy = 0; }
        else if (diffX < 0 && dx !== -1) { dx = 1; dy = 0; }
    } else {
        if (diffY > 0 && dy !== 1) { dx = 0; dy = -1; }
        else if (diffY < 0 && dy !== -1) { dx = 0; dy = 1; }
    }

    if (!gameRunning) startGame();
});


// =======================
// RESTART BUTTON
// =======================

const restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
    restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetGame();
        startGame();
    });
}
