// 6x6 Sudoku Game Logic

class Sudoku6x6 {
  constructor() {
    this.size = 6;
    this.boxWidth = 3;
    this.boxHeight = 2;
    this.grid = [];
    this.solution = [];
    this.original = [];
    this.generatePuzzle();
  }

  generatePuzzle() {
    // Generate a valid solution
    this.solution = this.generateSolution();
    
    // Copy to grid
    this.grid = this.solution.map(row => [...row]);
    
    // Remove cells based on difficulty
    this.removeCells();
    
    // Store original puzzle
    this.original = this.grid.map(row => [...row]);
  }

  generateSolution() {
    const grid = Array(6).fill(null).map(() => Array(6).fill(0));
    this.fillGrid(grid);
    return grid;
  }

  fillGrid(grid) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (grid[row][col] === 0) {
          const nums = this.shuffle([1, 2, 3, 4, 5, 6]);
          for (let num of nums) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  isValid(grid, row, col, num) {
    // Check row
    for (let c = 0; c < 6; c++) {
      if (grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 6; r++) {
      if (grid[r][col] === num) return false;
    }

    // Check 2x3 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false;
      }
    }

    return true;
  }

  removeCells() {
    let removed = 0;
    const difficulty = Math.random();
    const targetRemove = difficulty < 0.33 ? 18 : difficulty < 0.66 ? 24 : 28;

    while (removed < targetRemove) {
      const row = Math.floor(Math.random() * 6);
      const col = Math.floor(Math.random() * 6);

      if (this.grid[row][col] !== 0) {
        this.grid[row][col] = 0;
        removed++;
      }
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  isValid(grid, row, col, num) {
    // Check row
    for (let c = 0; c < 6; c++) {
      if (c !== col && grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 6; r++) {
      if (r !== row && grid[r][col] === num) return false;
    }

    // Check 2x3 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) return false;
      }
    }

    return true;
  }

  getHint(grid) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (grid[row][col] === 0 && this.original[row][col] === 0) {
          return { row, col, value: this.solution[row][col] };
        }
      }
    }
    return null;
  }

  getConflicts(grid, row, col, num) {
    const conflicts = [];

    // Check row
    for (let c = 0; c < 6; c++) {
      if (c !== col && grid[row][c] === num) {
        conflicts.push({ row, col: c });
      }
    }

    // Check column
    for (let r = 0; r < 6; r++) {
      if (r !== row && grid[r][col] === num) {
        conflicts.push({ row: r, col });
      }
    }

    // Check 2x3 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) {
          conflicts.push({ row: r, col: c });
        }
      }
    }

    return conflicts;
  }

  isComplete(grid) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (grid[row][col] === 0) return false;
      }
    }
    return true;
  }
}

// Game State
let sudoku = new Sudoku6x6();
let userGrid = sudoku.grid.map(row => [...row]);
let moves = 0;
let errors = 0;
let selectedCell = null;

function renderBoard() {
  const board = document.getElementById("sudokuBoard");
  board.innerHTML = "";

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      
      if (sudoku.original[row][col] !== 0) {
        cell.className += " given";
        cell.textContent = sudoku.original[row][col];
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = "1";
        input.value = userGrid[row][col] || "";
        input.dataset.row = row;
        input.dataset.col = col;

        input.addEventListener("input", (e) => {
          const val = e.target.value;
          if (val === "") {
            userGrid[row][col] = 0;
            moves++;
            updateStats();
            renderBoard();
            return;
          }
          
          const num = parseInt(val);
          if (num >= 1 && num <= 6) {
            userGrid[row][col] = num;
            moves++;
            errors = 0;
            updateStats();
            checkConflicts();
          } else {
            e.target.value = "";
          }
        });

        input.addEventListener("click", () => {
          selectedCell = { row, col };
        });

        cell.appendChild(input);
      }

      board.appendChild(cell);
    }
  }
}

function checkConflicts() {
  const cells = document.querySelectorAll(".sudoku-cell input");
  cells.forEach(input => {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const num = userGrid[row][col];

    if (num === 0) {
      input.classList.remove("conflict");
      return;
    }

    const conflicts = sudoku.getConflicts(userGrid, row, col, num);
    input.classList.toggle("conflict", conflicts.length > 0);
    errors = Math.max(0, conflicts.length);
  });

  updateStats();
}

function updateStats() {
  document.getElementById("moveCount").textContent = `Moves: ${moves}`;
  document.getElementById("errorCount").textContent = `Errors: ${errors}`;

  let filled = 0;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      if (userGrid[row][col] !== 0) filled++;
    }
  }

  const completion = Math.round((filled / 36) * 100);
  document.getElementById("completionStatus").textContent = `Completion: ${completion}%`;

  if (sudoku.isComplete(userGrid)) {
    document.getElementById("status").textContent = "Completed!";
  } else {
    document.getElementById("status").textContent = "In Progress";
  }
}

function newGame() {
  sudoku = new Sudoku6x6();
  userGrid = sudoku.grid.map(row => [...row]);
  moves = 0;
  errors = 0;
  selectedCell = null;
  document.getElementById("status").textContent = "Ready";
  renderBoard();
  updateStats();
}

function getHint() {
  const hint = sudoku.getHint(userGrid);
  if (hint) {
    userGrid[hint.row][hint.col] = hint.value;
    moves++;
    renderBoard();
    updateStats();
  }
}

function reset() {
  userGrid = sudoku.original.map(row => [...row]);
  moves = 0;
  errors = 0;
  document.getElementById("status").textContent = "Ready";
  renderBoard();
  updateStats();
}

function solve() {
  userGrid = sudoku.solution.map(row => [...row]);
  moves++;
  document.getElementById("status").textContent = "Solved!";
  renderBoard();
  updateStats();
}

// Event listeners
document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("hintBtn").addEventListener("click", getHint);
document.getElementById("resetBtn").addEventListener("click", reset);
document.getElementById("solveBtn").addEventListener("click", solve);

// Initialize
renderBoard();
updateStats();
