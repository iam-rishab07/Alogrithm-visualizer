// Deep clone a 2D board
function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * N-Queens Solver Generator
 * Yields steps for N-Queens.
 * board is a 2D array of size N x N:
 * - 0: empty cell
 * - 1: queen placed
 * - 2: under check/evaluation
 * - -1: conflict detected
 */
export function* nQueensSolver(n) {
  let board = Array.from({ length: n }, () => Array(n).fill(0));
  
  function isSafe(board, row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return { safe: false, conflict: [i, col] };
    }
    
    // Check upper left diagonal
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return { safe: false, conflict: [i, j] };
    }
    
    // Check upper right diagonal
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 1) return { safe: false, conflict: [i, j] };
    }
    
    return { safe: true };
  }

  function* solve(row) {
    if (row === n) {
      yield { board: cloneBoard(board), message: "All queens successfully placed!", isDone: true };
      return true;
    }

    for (let col = 0; col < n; col++) {
      // Highlight tentative placement
      board[row][col] = 2;
      yield { 
        board: cloneBoard(board), 
        activeCell: { row, col },
        message: `Trying queen at row ${row}, col ${col}.`
      };

      const check = isSafe(board, row, col);
      if (check.safe) {
        board[row][col] = 1; // place queen
        yield { 
          board: cloneBoard(board), 
          activeCell: { row, col },
          message: `Safe position. Placed queen at (${row}, ${col}). Recursing to row ${row + 1}.`
        };

        const success = yield* solve(row + 1);
        if (success) return true;

        // Backtrack
        board[row][col] = 2; // set to checking before removal
        yield { 
          board: cloneBoard(board), 
          activeCell: { row, col },
          message: `Backtracking: Row ${row + 1} failed. Preparing to remove queen from (${row}, ${col}).`
        };
      } else {
        // Highlight conflict
        board[row][col] = -1; // conflict state
        const conflictNode = check.conflict;
        yield { 
          board: cloneBoard(board), 
          activeCell: { row, col },
          conflictCell: conflictNode ? { row: conflictNode[0], col: conflictNode[1] } : null,
          message: `Conflict detected with queen at (${conflictNode[0]}, ${conflictNode[1]}).`
        };
      }

      board[row][col] = 0; // backtrack clear
      yield { 
        board: cloneBoard(board), 
        activeCell: { row, col },
        message: `Cleared cell (${row}, ${col}).`
      };
    }
    return false;
  }

  yield* solve(0);
}

/**
 * Sudoku Solver Generator
 * grid is a 9x9 array containing numbers 0 (empty) or 1-9.
 */
export const INITIAL_SUDOKU = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

export function* sudokuSolver(initialGrid) {
  let grid = cloneBoard(initialGrid);

  function isValid(r, c, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num) return false;
    }
    // Check col
    for (let i = 0; i < 9; i++) {
      if (grid[i][c] === num) return false;
    }
    // Check box
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  }

  function* solve() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            // Check tentative fill
            yield { 
              grid: cloneBoard(boardWithHighlight(r, c, num)), 
              activeCell: { row: r, col: c },
              message: `Testing number ${num} at (${r}, ${c}).`
            };

            if (isValid(r, c, num)) {
              grid[r][c] = num;
              yield { 
                grid: cloneBoard(grid), 
                activeCell: { row: r, col: c },
                message: `Placed ${num} at (${r}, ${c}). Recursing.`
              };

              const success = yield* solve();
              if (success) return true;

              // Backtrack erase
              yield { 
                grid: cloneBoard(grid), 
                activeCell: { row: r, col: c },
                message: `Backtrack: Erasing ${num} from (${r}, ${c}) as path failed.`
              };
              grid[r][c] = 0;
            }
          }
          return false; // trigger backtracking
        }
      }
    }
    return true;
  }

  function boardWithHighlight(row, col, num) {
    const copy = cloneBoard(grid);
    copy[row][col] = -num; // Use negative to flag active tentative values in renderer
    return copy;
  }

  yield* solve();
  yield { grid: cloneBoard(grid), activeCell: null, message: "Sudoku Solved successfully!", isDone: true };
}

/**
 * Knight's Tour Solver Generator (5x5 Grid)
 * board is a 5x5 array containing numbers representing the move order (0 means unvisited).
 */
export function* knightTourSolver() {
  const n = 5;
  let board = Array.from({ length: n }, () => Array(n).fill(0));
  
  const moveR = [-2, -1, 1, 2, 2, 1, -1, -2];
  const moveC = [1, 2, 2, 1, -1, -2, -2, -1];

  function isValid(r, c) {
    return r >= 0 && r < n && c >= 0 && c < n && board[r][c] === 0;
  }

  function* solve(r, c, moveCount) {
    board[r][c] = moveCount;
    yield { 
      board: cloneBoard(board), 
      activeCell: { row: r, col: c },
      message: `Knight visited (${r}, ${c}) at move ${moveCount}.`
    };

    if (moveCount === n * n) {
      yield { board: cloneBoard(board), message: "Knight's Tour completed successfully!", isDone: true };
      return true;
    }

    for (let i = 0; i < 8; i++) {
      const nextR = r + moveR[i];
      const nextC = c + moveC[i];
      
      if (isValid(nextR, nextC)) {
        const success = yield* solve(nextR, nextC, moveCount + 1);
        if (success) return true;
      }
    }

    // Backtrack
    yield { 
      board: cloneBoard(board), 
      activeCell: { row: r, col: c },
      message: `Backtracking: No moves left from (${r}, ${c}). Erasing move ${moveCount}.`
    };
    board[r][c] = 0;
    return false;
  }

  yield* solve(0, 0, 1);
}
