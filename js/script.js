// C-BREAKOUT: Break the Code - Full Game Implementation

document.addEventListener("DOMContentLoaded", () => {
  // Canvas setup
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Responsive canvas sizing
  function resizeCanvas() {
    const maxWidth = 800;
    const width = Math.min(window.innerWidth - 40, maxWidth);
    const height = 500;
    canvas.width = width;
    canvas.height = height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Game variables
  const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    codesBroken: 0,
    gameRunning: false,
    gameOver: false,
    levelComplete: false,
  };

  // Paddle (Memory Leak) - catch the bits
  const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    width: 80,
    height: 10,
    dx: 7,
    color: "#ff00ff",
    draw() {
      // Memory leak effect - glitch animation
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "#ff69b4";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
      // Label
      ctx.fillStyle = "#ff69b4";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText("MEMORY_LEAK", this.x + 5, this.y - 5);
    },
    update(keys) {
      if (keys["ArrowLeft"] && this.x > 0) {
        this.x -= this.dx;
      }
      if (keys["ArrowRight"] && this.x + this.width < canvas.width) {
        this.x += this.dx;
      }
    },
  };

  // Ball (Bits) - corrupted data bouncing around
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 5,
    dx: 3,
    dy: -3,
    color: "#00ff41",
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      // Bit glow
      ctx.strokeStyle = "rgba(0, 255, 65, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    update() {
      this.x += this.dx;
      this.y += this.dy;

      // Bounce off left/right walls
      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
        this.dx *= -1;
      }

      // Bounce off top wall
      if (this.y - this.radius < 0) {
        this.dy *= -1;
      }

      // Ball fell through bottom (hit by memory leak or missed)
      if (this.y - this.radius > canvas.height) {
        return "lost";
      }

      return "ok";
    },
    checkPaddleCollision(paddle) {
      if (
        this.x > paddle.x &&
        this.x < paddle.x + paddle.width &&
        this.y + this.radius > paddle.y &&
        this.y + this.radius < paddle.y + paddle.height
      ) {
        this.dy *= -1;
        this.y = paddle.y - this.radius;

        // Add English to ball based on paddle position
        const hitPos = (this.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        this.dx += hitPos * 2;

        return true;
      }
      return false;
    },
  };

  // Bricks (C Code) - things to break
  const codeSnippets = [
    "#include <stdio.h>",
    "int main() {",
    "printf(\"Hello\");",
    "return 0;",
    "malloc(size)",
    "free(ptr);",
    "void *ptr;",
    "int arr[10];",
    "if (x > 5) {",
    "for (i=0; i<n)",
    "while (1) {",
    "sizeof(int)",
  ];

  let bricks = [];

  function initBricks() {
    bricks = [];
    const brickWidth = 60;
    const brickHeight = 20;
    const brickPadding = 8;
    const cols = Math.floor((canvas.width - 20) / (brickWidth + brickPadding));
    const rows = 3 + gameState.level;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 10 + c * (brickWidth + brickPadding);
        const y = 30 + r * (brickHeight + brickPadding);
        const code = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        bricks.push({
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          active: true,
          code,
          color: "#00ff41",
        });
      }
    }
  }

  function drawBricks() {
    bricks.forEach((brick) => {
      if (brick.active) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Code display
        ctx.fillStyle = "#000";
        ctx.font = "9px JetBrains Mono";
        const textWidth = ctx.measureText(brick.code).width;
        const textX = brick.x + (brick.width - textWidth) / 2;
        const textY = brick.y + brick.height / 2 + 3;
        ctx.fillText(brick.code, textX, textY);

        // Border glow
        ctx.strokeStyle = "#00cc33";
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
  }

  function checkBrickCollisions() {
    bricks.forEach((brick) => {
      if (!brick.active) return;

      if (
        ball.x > brick.x &&
        ball.x < brick.x + brick.width &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.height
      ) {
        brick.active = false;
        ball.dy *= -1;
        gameState.score += 10;
        gameState.codesBroken++;

        // Update UI
        document.getElementById("score").textContent = gameState.score;
        document.getElementById("codeCount").textContent = gameState.codesBroken;

        // Check if level complete
        if (bricks.every((b) => !b.active)) {
          gameState.levelComplete = true;
        }
      }
    });
  }

  // Game state update
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === " ") {
      e.preventDefault();
      if (!gameState.gameRunning && !gameState.gameOver) {
        gameState.gameRunning = true;
        document.getElementById("gameStatus").textContent = "Game Running...";
      } else if (gameState.gameOver) {
        resetGame();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  function updateGame() {
    if (!gameState.gameRunning) return;

    // Update paddle
    paddle.update(keys);

    // Update ball
    const ballStatus = ball.update();

    if (ballStatus === "lost") {
      gameState.lives--;
      document.getElementById("lives").textContent = gameState.lives;

      if (gameState.lives <= 0) {
        gameState.gameOver = true;
        gameState.gameRunning = false;
        document.getElementById("gameStatus").textContent =
          "GAME OVER - Press SPACE to Restart";
        return;
      }

      // Reset ball position
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = 3;
      ball.dy = -3;
      gameState.gameRunning = false;
      document.getElementById("gameStatus").textContent =
        "Press SPACE to Continue";
      return;
    }

    // Check collisions
    ball.checkPaddleCollision(paddle);
    checkBrickCollisions();

    // Level complete
    if (gameState.levelComplete) {
      gameState.level++;
      gameState.gameRunning = false;
      gameState.levelComplete = false;
      initBricks();
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = 3;
      ball.dy = -3;
      document.getElementById("level").textContent = gameState.level;
      document.getElementById("gameStatus").textContent =
        "Level Complete! Press SPACE for Next Level";
    }
  }

  function drawGame() {
    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = "rgba(0, 255, 65, 0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw game objects
    drawBricks();
    ball.draw();
    paddle.draw();
  }

  function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.codesBroken = 0;
    gameState.gameRunning = false;
    gameState.gameOver = false;
    gameState.levelComplete = false;

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 3;
    ball.dy = -3;

    paddle.x = canvas.width / 2 - 40;

    initBricks();

    document.getElementById("score").textContent = "0";
    document.getElementById("lives").textContent = "3";
    document.getElementById("level").textContent = "1";
    document.getElementById("codeCount").textContent = "0";
    document.getElementById("gameStatus").textContent =
      "Press SPACE to Start | Arrow Keys to Move";
  }

  function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
  }

  // Background decorative symbols (C letters)
  const container = document.getElementById("background-symbols");
  const count = 30;

  for (let i = 0; i < count; i++) {
    const symbol = document.createElement("div");
    symbol.className = "symbol";
    symbol.textContent = "C";

    symbol.style.left = `${Math.random() * 100}%`;
    symbol.style.top = `${Math.random() * 100}%`;

    symbol.style.animationDelay = `${Math.random() * 3}s`;
    symbol.style.animationDuration = `${3 + Math.random() * 2}s`;

    container.appendChild(symbol);
  }

  // Initialize and start
  initBricks();
  gameLoop();
});
