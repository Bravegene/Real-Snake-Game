const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configuration
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [{x: 10, y: 10}];
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

function generateFood() {
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function clearCanvas() {
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4ecdc4';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    ctx.fillStyle = '#45b7b8';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
}

function drawFood() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
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

function moveSnake() {
    if (!gameRunning || gameOverActive) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) { gameOver(); return; }
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) { gameOver(); return; }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
    } else { snake.pop(); }
}

function gameOver() {
    gameRunning = false;
    gameOverActive = true;
    dx = 0; dy = 0;

    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }

    const gameOverDiv = document.getElementById('gameOver');
    if (gameOverDiv) {
        gameOverDiv.classList.remove('hidden');
        document.getElementById('finalScore').textContent = score;
    }
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 0; dy = 0;
    score = 0;
    gameOverActive = false;
    gameRunning = false;
    generateFood();
    drawScore();
    const gameOverDiv = document.getElementById('gameOver');
    if (gameOverDiv) gameOverDiv.classList.add('hidden');
    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
    drawGame();
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameOverActive = false;
        gameLoop = setInterval(() => {
            moveSnake();
            drawGame();
        }, 100);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.key.startsWith('Arrow')) startGame();
    if (!gameRunning) return;

    if ((e.key === 'ArrowLeft' && dx === 1) || (e.key === 'ArrowRight' && dx === -1) ||
        (e.key === 'ArrowUp' && dy === 1) || (e.key === 'ArrowDown' && dy === -1)) return;

    switch(e.key) {
        case 'ArrowUp': dx = 0; dy = -1; break;
        case 'ArrowDown': dx = 0; dy = 1; break;
        case 'ArrowLeft': dx = -1; dy = 0; break;
        case 'ArrowRight': dx = 1; dy = 0; break;
    }
});

// Restart button
const restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
    restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetGame();
        startGame();
    });
}

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; });
canvas.addEventListener('touchend', (e) => {
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

    touchStartX = 0; touchStartY = 0;
});

// Initial draw
drawGame();
