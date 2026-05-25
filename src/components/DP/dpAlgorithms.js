/**
 * 0/1 Knapsack DP Table Generator
 */
export const KNAPSACK_ITEMS = [
  { name: 'A', weight: 2, value: 3 },
  { name: 'B', weight: 3, value: 4 },
  { name: 'C', weight: 4, value: 8 },
  { name: 'D', weight: 5, value: 10 }
];
export const KNAPSACK_CAPACITY = 6;

export function* knapsackSolver() {
  const items = KNAPSACK_ITEMS;
  const W = KNAPSACK_CAPACITY;
  const n = items.length;

  // Initialize table with 0s
  let table = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  yield {
    table: table.map(r => [...r]),
    activeCell: null,
    readCells: [],
    message: "DP table initialized. Columns: weight capacity (0-6). Rows: items evaluated."
  };

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      let readCells = [];
      const cellCoords = { r: i, c: w };
      
      if (item.weight <= w) {
        // Read cells are: without item (i-1, w) AND with item (i-1, w - weight)
        readCells = [
          { r: i - 1, c: w },
          { r: i - 1, c: w - item.weight }
        ];

        yield {
          table: table.map(r => [...r]),
          activeCell: cellCoords,
          readCells,
          message: `Evaluating cell (${i}, ${w}) for Item ${item.name} (wt: ${item.weight}, val: ${item.value}). It fits! Comparing value of taking it vs skipping it.`
        };

        table[i][w] = Math.max(
          item.value + table[i - 1][w - item.weight],
          table[i - 1][w]
        );
      } else {
        // Read cell: without item (i-1, w)
        readCells = [{ r: i - 1, c: w }];

        yield {
          table: table.map(r => [...r]),
          activeCell: cellCoords,
          readCells,
          message: `Evaluating cell (${i}, ${w}) for Item ${item.name} (wt: ${item.weight}, val: ${item.value}). It does NOT fit. Copying value from cell above.`
        };

        table[i][w] = table[i - 1][w];
      }

      yield {
        table: table.map(r => [...r]),
        activeCell: cellCoords,
        readCells: [],
        message: `Updated cell (${i}, ${w}) value to ${table[i][w]}.`
      };
    }
  }

  // Backtrack to find selected items
  let w = W;
  let selected = [];
  let backtrackCells = [];
  
  for (let i = n; i > 0 && w > 0; i--) {
    const item = items[i - 1];
    backtrackCells.push({ r: i, c: w });
    
    if (table[i][w] !== table[i - 1][w]) {
      selected.push(item.name);
      yield {
        table: table.map(r => [...r]),
        activeCell: { r: i, c: w },
        readCells: [{ r: i - 1, c: w - item.weight }],
        backtrackCells: [...backtrackCells],
        message: `Backtracking: Value changed at row ${i}, column ${w}. Item ${item.name} was selected!`
      };
      w = w - item.weight;
    } else {
      yield {
        table: table.map(r => [...r]),
        activeCell: { r: i, c: w },
        readCells: [{ r: i - 1, c: w }],
        backtrackCells: [...backtrackCells],
        message: `Backtracking: Value unchanged at row ${i}. Item ${item.name} was skipped.`
      };
    }
  }

  yield {
    table: table.map(r => [...r]),
    activeCell: null,
    readCells: [],
    backtrackCells,
    message: `Knapsack Solved! Max Value: ${table[n][W]}. Selected Items: [${selected.reverse().join(', ')}].`
  };
}

/**
 * Longest Common Subsequence (LCS) Generator
 */
export const LCS_STR_A = 'STONE';
export const LCS_STR_B = 'LONGEST';

export function* lcsSolver() {
  const A = LCS_STR_A;
  const B = LCS_STR_B;
  const m = A.length;
  const n = B.length;

  let table = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  yield {
    table: table.map(r => [...r]),
    activeCell: null,
    readCells: [],
    message: `LCS Grid initialized. Comparing String A: "${A}" vs String B: "${B}".`
  };

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cellCoords = { r: i, c: j };
      let readCells = [];

      if (A[i - 1] === B[j - 1]) {
        // Read cell is diagonal (i-1, j-1)
        readCells = [{ r: i - 1, c: j - 1 }];
        yield {
          table: table.map(r => [...r]),
          activeCell: cellCoords,
          readCells,
          message: `Comparing '${A[i-1]}' (Str A) and '${B[j-1]}' (Str B). Match found! Value is 1 + diagonal cell (${i-1}, ${j-1}).`
        };
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        // Read cells are: top (i-1, j) and left (i, j-1)
        readCells = [
          { r: i - 1, c: j },
          { r: i, c: j - 1 }
        ];
        yield {
          table: table.map(r => [...r]),
          activeCell: cellCoords,
          readCells,
          message: `Comparing '${A[i-1]}' (Str A) and '${B[j-1]}' (Str B). Mismatch. Value is Max of cell above and cell left.`
        };
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }

      yield {
        table: table.map(r => [...r]),
        activeCell: cellCoords,
        readCells: [],
        message: `Updated cell (${i}, ${j}) to ${table[i][j]}.`
      };
    }
  }

  // Backtrack to find LCS string path
  let i = m;
  let j = n;
  let lcsLetters = [];
  let backtrackCells = [];

  while (i > 0 && j > 0) {
    backtrackCells.push({ r: i, c: j });

    if (A[i - 1] === B[j - 1]) {
      lcsLetters.unshift(A[i - 1]);
      yield {
        table: table.map(r => [...r]),
        activeCell: { r: i, c: j },
        readCells: [{ r: i - 1, c: j - 1 }],
        backtrackCells: [...backtrackCells],
        message: `Backtrack: Character match '${A[i-1]}' found! Moving diagonally up-left.`
      };
      i--;
      j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      yield {
        table: table.map(r => [...r]),
        activeCell: { r: i, c: j },
        readCells: [{ r: i - 1, c: j }],
        backtrackCells: [...backtrackCells],
        message: `Backtrack: Mismatch. Cell above (${table[i-1][j]}) >= Cell left (${table[i][j-1]}). Moving UP.`
      };
      i--;
    } else {
      yield {
        table: table.map(r => [...r]),
        activeCell: { r: i, c: j },
        readCells: [{ r: i, c: j - 1 }],
        backtrackCells: [...backtrackCells],
        message: `Backtrack: Mismatch. Cell left (${table[i][j-1]}) > Cell above (${table[i-1][j]}). Moving LEFT.`
      };
      j--;
    }
  }

  yield {
    table: table.map(r => [...r]),
    activeCell: null,
    readCells: [],
    backtrackCells,
    message: `LCS Solved! Length = ${table[m][n]}. Longest Common Subsequence = "${lcsLetters.join('')}".`
  };
}
