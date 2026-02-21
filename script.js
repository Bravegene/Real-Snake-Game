const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;
let dx;
let dy;
let score;
let highScore;
let gameInterval;
let gameSpeed = 130;
let gameRunning = true;

// Load high score
highScore = localStorage.getItem("snakeHighScore") || 0;
document.getElementById("highScore").textContent = highScore;

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    gameRunning = true;

    document.getElementById("score").textContent = score;
    document.getElementById("gameOver").classList.add("hidden");

    generateFood();

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function drawBoard() {
    ctx.fillStyle = "#76c776";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = "#4ecdc4";
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize,
            gridSize
        );
    });
}

function drawFood() {
    ctx.fillStyle = "#ff3b30";
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            document.getElementById("highScore").textContent = highScore;
        }

        generateFood();
    } else {
        snake.pop();
    }
}

function gameLoop() {
    if (!gameRunning) return;

    drawBoard();
    drawFood();
    drawSnake();
    moveSnake();
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);

    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOver").classList.remove("hidden");
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    if (e.key === "ArrowUp" && dy !== 1) {
        dx = 0; dy = -1;
    }
    if (e.key === "ArrowDown" && dy !== -1) {
        dx = 0; dy = 1;
    }
    if (e.key === "ArrowLeft" && dx !== 1) {
        dx = -1; dy = 0;
    }
    if (e.key === "ArrowRight" && dx !== -1) {
        dx = 1; dy = 0;
    }
});

document.getElementById("restartBtn").addEventListener("click", startGame);

// Start immediately
startGame();
