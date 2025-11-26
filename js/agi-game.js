// AGI Simulator - Neural Network Training Game

class NeuralNetwork {
  constructor(inputSize, hiddenSize, outputSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.learningRate = 0.5;

    // Initialize weights with small random values
    this.weightsIH = this.randomMatrix(hiddenSize, inputSize);
    this.weightsHO = this.randomMatrix(outputSize, hiddenSize);
    
    // Initialize biases
    this.biasH = this.randomMatrix(hiddenSize, 1);
    this.biasO = this.randomMatrix(outputSize, 1);
  }

  randomMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = Math.random() * 2 - 1;
      }
    }
    return matrix;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  sigmoidDerivative(x) {
    return x * (1 - x);
  }

  forward(input) {
    // Input to Hidden
    const hidden = this.matrixMultiply(this.weightsIH, input);
    this.addMatrix(hidden, this.biasH);
    this.applyFunction(hidden, x => this.sigmoid(x));

    // Hidden to Output
    const output = this.matrixMultiply(this.weightsHO, hidden);
    this.addMatrix(output, this.biasO);
    this.applyFunction(output, x => this.sigmoid(x));

    return { hidden, output };
  }

  backward(input, output, target) {
    // Output error
    const outputError = this.subtractMatrix(target, output);
    const outputGradient = this.multiplyMatrices(
      outputError,
      this.applyFunctionMap(output, x => this.sigmoidDerivative(x))
    );

    // Update weights HO and bias O
    const hidden = this.forward(input).hidden;
    const weightsHODelta = this.matrixMultiply(outputGradient, this.transposeMatrix(hidden));
    this.addMatrix(this.weightsHO, this.scaleMatrix(weightsHODelta, this.learningRate));
    this.addMatrix(this.biasO, this.scaleMatrix(outputGradient, this.learningRate));

    // Hidden error
    const hiddenError = this.matrixMultiply(this.transposeMatrix(this.weightsHO), outputGradient);
    const hiddenGradient = this.multiplyMatrices(
      hiddenError,
      this.applyFunctionMap(hidden, x => this.sigmoidDerivative(x))
    );

    // Update weights IH and bias H
    const weightsIHDelta = this.matrixMultiply(hiddenGradient, this.transposeMatrix(input));
    this.addMatrix(this.weightsIH, this.scaleMatrix(weightsIHDelta, this.learningRate));
    this.addMatrix(this.biasH, this.scaleMatrix(hiddenGradient, this.learningRate));
  }

  matrixMultiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  transposeMatrix(matrix) {
    const result = [];
    for (let j = 0; j < matrix[0].length; j++) {
      result[j] = [];
      for (let i = 0; i < matrix.length; i++) {
        result[j][i] = matrix[i][j];
      }
    }
    return result;
  }

  addMatrix(a, b) {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        a[i][j] += b[i][j];
      }
    }
  }

  subtractMatrix(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < a[i].length; j++) {
        result[i][j] = a[i][j] - b[i][j];
      }
    }
    return result;
  }

  scaleMatrix(matrix, scale) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      result[i] = [];
      for (let j = 0; j < matrix[i].length; j++) {
        result[i][j] = matrix[i][j] * scale;
      }
    }
    return result;
  }

  applyFunction(matrix, fn) {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = fn(matrix[i][j]);
      }
    }
  }

  applyFunctionMap(matrix, fn) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      result[i] = [];
      for (let j = 0; j < matrix[i].length; j++) {
        result[i][j] = fn(matrix[i][j]);
      }
    }
    return result;
  }

  multiplyMatrices(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < a[i].length; j++) {
        result[i][j] = a[i][j] * b[i][j];
      }
    }
    return result;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("agiCanvas");
  const ctx = canvas.getContext("2d");

  // Resize canvas
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Game state
  const gameState = {
    epoch: 1,
    totalEpochs: 50,
    accuracy: 0,
    loss: 0,
    isTraining: false,
    trainingComplete: false,
  };

  // Initialize neural network
  const nn = new NeuralNetwork(3, 8, 4);

  // Training data - simple patterns
  const trainingData = [
    { input: [[0.1], [0.2], [0.3]], target: [[1], [0], [0], [0]] },
    { input: [[0.2], [0.3], [0.4]], target: [[1], [0], [0], [0]] },
    { input: [[0.5], [0.5], [0.5]], target: [[0], [1], [0], [0]] },
    { input: [[0.6], [0.6], [0.6]], target: [[0], [1], [0], [0]] },
    { input: [[0.8], [0.7], [0.9]], target: [[0], [0], [1], [0]] },
    { input: [[0.9], [0.8], [0.7]], target: [[0], [0], [1], [0]] },
    { input: [[0.3], [0.9], [0.2]], target: [[0], [0], [0], [1]] },
    { input: [[0.2], [0.8], [0.1]], target: [[0], [0], [0], [1]] },
  ];

  function train() {
    let totalLoss = 0;
    let correct = 0;

    trainingData.forEach(({ input, target }) => {
      const { output } = nn.forward(input);
      
      // Calculate loss
      let loss = 0;
      for (let i = 0; i < output.length; i++) {
        loss += Math.pow(output[i][0] - target[i][0], 2);
      }
      totalLoss += loss;

      // Check if correct
      let predicted = 0;
      let maxOutput = output[0][0];
      for (let i = 1; i < output.length; i++) {
        if (output[i][0] > maxOutput) {
          maxOutput = output[i][0];
          predicted = i;
        }
      }

      let expectedClass = 0;
      for (let i = 1; i < target.length; i++) {
        if (target[i][0] > target[expectedClass][0]) {
          expectedClass = i;
        }
      }

      if (predicted === expectedClass) {
        correct++;
      }

      // Backward pass
      nn.backward(input, output, target);
    });

    gameState.loss = (totalLoss / trainingData.length).toFixed(4);
    gameState.accuracy = Math.round((correct / trainingData.length) * 100);
    gameState.epoch++;

    document.getElementById("epoch").textContent = gameState.epoch;
    document.getElementById("accuracy").textContent = gameState.accuracy;
    document.getElementById("loss").textContent = gameState.loss;

    if (gameState.epoch > gameState.totalEpochs) {
      gameState.isTraining = false;
      gameState.trainingComplete = true;
      document.getElementById("gameStatus").textContent =
        gameState.accuracy === 100
          ? "✓ TRAINING COMPLETE! 100% Accuracy Achieved!"
          : `Training Complete - Accuracy: ${gameState.accuracy}%`;
    } else {
      document.getElementById("trainingInfo").textContent = 
        `Training progress: ${((gameState.epoch / gameState.totalEpochs) * 100).toFixed(0)}% complete`;
    }
  }

  function drawNetwork() {
    ctx.fillStyle = "rgba(24, 26, 30, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = "rgba(58, 134, 249, 0.05)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Layer positions
    const layerY = canvas.height / 2;
    const inputX = canvas.width * 0.1;
    const hiddenX = canvas.width * 0.5;
    const outputX = canvas.width * 0.9;

    const neuronRadius = 8;

    // Draw neurons and connections
    const inputCount = 3;
    const hiddenCount = 8;
    const outputCount = 4;

    // Draw connections with weight colors
    ctx.lineWidth = 1;
    for (let i = 0; i < inputCount; i++) {
      const y1 = layerY - (inputCount * 40) / 2 + i * 40;
      for (let j = 0; j < hiddenCount; j++) {
        const y2 = layerY - (hiddenCount * 30) / 2 + j * 30;
        const weight = nn.weightsIH[j][i];
        ctx.strokeStyle = weight > 0
          ? `rgba(58, 134, 249, ${Math.min(Math.abs(weight), 1)})`
          : `rgba(255, 100, 100, ${Math.min(Math.abs(weight), 1)})`;
        ctx.beginPath();
        ctx.moveTo(inputX + neuronRadius, y1);
        ctx.lineTo(hiddenX - neuronRadius, y2);
        ctx.stroke();
      }
    }

    for (let i = 0; i < hiddenCount; i++) {
      const y1 = layerY - (hiddenCount * 30) / 2 + i * 30;
      for (let j = 0; j < outputCount; j++) {
        const y2 = layerY - (outputCount * 40) / 2 + j * 40;
        const weight = nn.weightsHO[j][i];
        ctx.strokeStyle = weight > 0
          ? `rgba(58, 134, 249, ${Math.min(Math.abs(weight), 1)})`
          : `rgba(255, 100, 100, ${Math.min(Math.abs(weight), 1)})`;
        ctx.beginPath();
        ctx.moveTo(hiddenX + neuronRadius, y1);
        ctx.lineTo(outputX - neuronRadius, y2);
        ctx.stroke();
      }
    }

    // Draw input neurons
    ctx.fillStyle = "#3a86f9";
    for (let i = 0; i < inputCount; i++) {
      const y = layerY - (inputCount * 40) / 2 + i * 40;
      ctx.beginPath();
      ctx.arc(inputX, y, neuronRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3a86f9";
    ctx.font = "12px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.fillText("INPUT", inputX, layerY + 60);

    // Draw hidden neurons
    ctx.fillStyle = "#3a86f9";
    for (let i = 0; i < hiddenCount; i++) {
      const y = layerY - (hiddenCount * 30) / 2 + i * 30;
      ctx.beginPath();
      ctx.arc(hiddenX, y, neuronRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3a86f9";
    ctx.fillText("HIDDEN", hiddenX, layerY + 60);

    // Draw output neurons
    ctx.fillStyle = "#3a86f9";
    for (let i = 0; i < outputCount; i++) {
      const y = layerY - (outputCount * 40) / 2 + i * 40;
      ctx.beginPath();
      ctx.arc(outputX, y, neuronRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3a86f9";
    ctx.fillText("OUTPUT", outputX, layerY + 60);

    // Draw title
    ctx.fillStyle = "#3a86f9";
    ctx.font = "bold 16px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.fillText("Neural Network Architecture", canvas.width / 2, 30);
  }

  function gameLoop() {
    drawNetwork();

    if (gameState.isTraining) {
      train();
    }

    requestAnimationFrame(gameLoop);
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (!gameState.isTraining) {
        gameState.isTraining = true;
        document.getElementById("gameStatus").textContent = "Training...";
      }
    } else if (e.key === "Escape") {
      gameState.epoch = 1;
      gameState.accuracy = 0;
      gameState.loss = 0;
      gameState.isTraining = false;
      gameState.trainingComplete = false;
      nn.learningRate = 0.5;

      // Reinitialize network
      const newNN = new NeuralNetwork(3, 8, 4);
      Object.assign(nn, newNN);

      document.getElementById("epoch").textContent = "1";
      document.getElementById("accuracy").textContent = "0";
      document.getElementById("loss").textContent = "0.00";
      document.getElementById("gameStatus").textContent = "Press SPACE to Train | Escape to Reset";
      document.getElementById("trainingInfo").textContent = "Ready to train on pattern recognition task";
    }
  });

  gameLoop();
});
