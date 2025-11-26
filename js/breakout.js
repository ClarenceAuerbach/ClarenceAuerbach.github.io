// Breakout game logic
document.addEventListener("DOMContentLoaded", () => {
  // Canvas setup
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Responsive canvas sizing
  function resizeCanvas() {
    const maxWidth = 800;
    const width = Math.min(window.innerWidth - 60, maxWidth);
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

  // Paddle (Memory Leak)
  const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    width: 80,
    height: 10,
    dx: 7,
    color: "#ff00ff",
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "#ff69b4";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
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

  // Ball (Bits)
  const ballImages = [
    "./ressource/one.png",
    "./ressource/zero.png",
  ];
  const ballImgs = [];
  let imagesLoaded = 0;

  ballImages.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imagesLoaded++;
    };
    ballImgs.push(img);
  });

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 12,
    dx: 3,
    dy: -3,
    color: "#00ff41",
    imageIndex: 0,
    animationCounter: 0,
    draw() {
      if (imagesLoaded === 2 && ballImgs[this.imageIndex].complete) {
        const size = this.radius * 2;
        ctx.drawImage(
          ballImgs[this.imageIndex],
          this.x - this.radius,
          this.y - this.radius,
          size,
          size
        );

        this.animationCounter++;
        if (this.animationCounter >= 25) {
          this.imageIndex = 1 - this.imageIndex;
          this.animationCounter = 0;
        }
      } else {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 255, 65, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    },
    update() {
      this.x += this.dx;
      this.y += this.dy;

      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
        this.dx *= -1;
      }

      if (this.y - this.radius < 0) {
        this.dy *= -1;
      }

      if (this.y - this.radius > canvas.height) {
        return "lost";
      }

      return "ok";
    },
    checkPaddleCollision(paddle) {
      const ballBottom = this.y + this.radius;
      const ballTop = this.y - this.radius;
      const paddleTop = paddle.y;
      const paddleBottom = paddle.y + paddle.height;

      if (this.dy > 0 && ballBottom >= paddleTop && ballBottom <= paddleBottom + 10) {
        const ballLeft = this.x - this.radius;
        const ballRight = this.x + this.radius;
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;

        if (ballRight > paddleLeft && ballLeft < paddleRight) {
          this.dy = -Math.abs(this.dy);
          this.y = paddleTop - this.radius;

          const paddleCenter = paddleLeft + paddle.width / 2;
          const hitPos = (this.x - paddleCenter) / (paddle.width / 2);
          this.dx = hitPos * 5;

          return true;
        }
      }
      return false;
    },
  };

  // Bricks (C Code)
  const codeLines = [
    "strcpy(path_cp, path);",
    "int idx = atoi(entry->d_name);",
    "extract_cmd((dest_cmd->cmd)+idx, path_cp);",
    "free(dir_path_copy);",
  ];

  let bricks = [];

  function initBricks() {
    bricks = [];
    const charWidth = 12;
    const charHeight = 20;
    const lineSpacing = 25;
    const rows = 3 + gameState.level;
    let brickId = 0;

    for (let r = 0; r < rows; r++) {
      const codeLine = codeLines[r % codeLines.length];
      const startX = 20;
      const startY = 30 + r * lineSpacing;
      
      for (let c = 0; c < codeLine.length; c++) {
        const char = codeLine[c];
        const x = startX + c * charWidth;
        const y = startY;
        
        bricks.push({
          id: brickId++,
          x,
          y,
          width: charWidth,
          height: charHeight,
          active: true,
          char,
          color: "#00ff41",
        });
      }
    }
  }

  function drawBricks() {
    bricks.forEach((brick) => {
      if (brick.active) {
        ctx.fillStyle = brick.color;
        ctx.font = "bold 16px JetBrains Mono";
        ctx.fillText(brick.char, brick.x, brick.y + 16);

        ctx.strokeStyle = "rgba(0, 255, 65, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.strokeText(brick.char, brick.x, brick.y + 16);
      }
    });
  }

  function checkBrickCollisions() {
    bricks.forEach((brick) => {
      if (!brick.active) return;

      const ballLeft = ball.x - ball.radius;
      const ballRight = ball.x + ball.radius;
      const ballTop = ball.y - ball.radius;
      const ballBottom = ball.y + ball.radius;

      const brickLeft = brick.x;
      const brickRight = brick.x + brick.width;
      const brickTop = brick.y;
      const brickBottom = brick.y + brick.height;

      if (
        ballRight > brickLeft &&
        ballLeft < brickRight &&
        ballBottom > brickTop &&
        ballTop < brickBottom
      ) {
        brick.active = false;

        const overlapLeft = ballRight - brickLeft;
        const overlapRight = brickRight - ballLeft;
        const overlapTop = ballBottom - brickTop;
        const overlapBottom = brickBottom - ballTop;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop || minOverlap === overlapBottom) {
          ball.dy *= -1;
        } else {
          ball.dx *= -1;
        }

        gameState.score += 10;
        gameState.codesBroken++;

        document.getElementById("score").textContent = gameState.score;
        document.getElementById("codeCount").textContent = gameState.codesBroken;

        if (bricks.every((b) => !b.active)) {
          gameState.levelComplete = true;
        }
      }
    });
  }

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

    paddle.update(keys);

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

      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = 3;
      ball.dy = -3;
      gameState.gameRunning = false;
      document.getElementById("gameStatus").textContent =
        "Press SPACE to Continue";
      return;
    }

    ball.checkPaddleCollision(paddle);
    checkBrickCollisions();

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
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    drawBricks();
    ball.draw();
    paddle.draw();

    if (gameState.levelComplete) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = "bold 48px JetBrains Mono";
      ctx.textAlign = "center";
      const text = "YOU WON!";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = "#00cc33";
      ctx.font = "20px JetBrains Mono";
      ctx.fillText("Press SPACE for Next Level", canvas.width / 2, canvas.height / 2 + 40);
      ctx.textAlign = "left";
    }
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

  initBricks();
  gameLoop();
});
