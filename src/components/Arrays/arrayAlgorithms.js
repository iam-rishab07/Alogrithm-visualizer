/**
 * Two Pointers Generator (Target Sum on Sorted Array)
 * Yields steps for visualizing two pointers.
 */
export const SORTED_ARRAY = [2, 4, 5, 8, 9, 12, 14, 17, 20];
export const TARGET_SUM = 22;

export function* twoPointersSolver() {
  const array = [...SORTED_ARRAY];
  const target = TARGET_SUM;
  let L = 0;
  let R = array.length - 1;
  
  yield {
    array,
    left: L,
    right: R,
    found: false,
    message: `Starting pointers at ends. L = 0, R = ${R}. Target = ${target}.`
  };

  while (L < R) {
    const sum = array[L] + array[R];
    yield {
      array,
      left: L,
      right: R,
      found: false,
      message: `Comparing sum (${array[L]} + ${array[R]} = ${sum}) with target (${target}).`
    };

    if (sum === target) {
      yield {
        array,
        left: L,
        right: R,
        found: true,
        message: `Match found! ${array[L]} + ${array[R]} = ${target}.`
      };
      return;
    }

    if (sum < target) {
      L++;
      yield {
        array,
        left: L,
        right: R,
        found: false,
        message: `Sum (${sum}) < target (${target}). Incrementing left pointer L to index ${L}.`
      };
    } else {
      R--;
      yield {
        array,
        left: L,
        right: R,
        found: false,
        message: `Sum (${sum}) > target (${target}). Decrementing right pointer R to index ${R}.`
      };
    }
  }

  yield {
    array,
    left: null,
    right: null,
    found: false,
    message: "No pairs found that sum up to target."
  };
}

/**
 * Sliding Window Generator (Max Sum Subarray of size K)
 */
export const SLIDING_ARRAY = [2, 1, 5, 1, 3, 2, 8, 3];
export const WINDOW_K = 3;

export function* slidingWindowSolver() {
  const array = [...SLIDING_ARRAY];
  const k = WINDOW_K;
  const n = array.length;
  
  let currentSum = 0;
  for (let i = 0; i < k; i++) {
    currentSum += array[i];
  }
  let maxSum = currentSum;

  yield {
    array,
    windowStart: 0,
    windowEnd: k - 1,
    currentSum,
    maxSum,
    message: `Calculated sum of initial window [0 to ${k - 1}]: ${currentSum}. Set Max Sum = ${maxSum}.`
  };

  for (let i = 1; i <= n - k; i++) {
    const prev = array[i - 1];
    const next = array[i + k - 1];
    currentSum = currentSum - prev + next;
    
    let isNewMax = false;
    if (currentSum > maxSum) {
      maxSum = currentSum;
      isNewMax = true;
    }

    yield {
      array,
      windowStart: i,
      windowEnd: i + k - 1,
      currentSum,
      maxSum,
      message: `Slide window to index [${i} to ${i + k - 1}]. Subtracted ${prev}, added ${next}. Sum = ${currentSum}.${isNewMax ? ' New Max Sum found!' : ''}`
    };
  }

  yield {
    array,
    windowStart: null,
    windowEnd: null,
    currentSum: null,
    maxSum,
    message: `Sliding Window search finished. Maximum Sum Subarray = ${maxSum}.`
  };
}

/**
 * Trapping Rain Water Generator
 * height is the elevation map.
 */
export const WATER_ELEVATIONS = [0, 2, 0, 3, 1, 0, 1, 3, 2, 1, 2, 1];

export function* trappingWaterSolver() {
  const height = [...WATER_ELEVATIONS];
  const n = height.length;
  let water = new Array(n).fill(0);
  
  let L = 0;
  let R = n - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalTrapped = 0;

  yield {
    height,
    water: [...water],
    left: L,
    right: R,
    leftMax,
    rightMax,
    totalTrapped,
    message: `Initialized pointers L = 0, R = ${R}.`
  };

  while (L <= R) {
    yield {
      height,
      water: [...water],
      left: L,
      right: R,
      leftMax,
      rightMax,
      totalTrapped,
      message: `Comparing boundary height[L] (${height[L]}) with height[R] (${height[R]}).`
    };

    if (height[L] <= height[R]) {
      if (height[L] >= leftMax) {
        leftMax = height[L];
        yield {
          height,
          water: [...water],
          left: L,
          right: R,
          leftMax,
          rightMax,
          totalTrapped,
          message: `Updated leftMax to ${leftMax} at index L = ${L}.`
        };
      } else {
        const trapped = leftMax - height[L];
        water[L] = trapped;
        totalTrapped += trapped;
        yield {
          height,
          water: [...water],
          left: L,
          right: R,
          leftMax,
          rightMax,
          totalTrapped,
          message: `Water trapped at index L = ${L} is leftMax (${leftMax}) - height[L] (${height[L]}) = ${trapped}.`
        };
      }
      L++;
    } else {
      if (height[R] >= rightMax) {
        rightMax = height[R];
        yield {
          height,
          water: [...water],
          left: L,
          right: R,
          leftMax,
          rightMax,
          totalTrapped,
          message: `Updated rightMax to ${rightMax} at index R = ${R}.`
        };
      } else {
        const trapped = rightMax - height[R];
        water[R] = trapped;
        totalTrapped += trapped;
        yield {
          height,
          water: [...water],
          left: L,
          right: R,
          leftMax,
          rightMax,
          totalTrapped,
          message: `Water trapped at index R = ${R} is rightMax (${rightMax}) - height[R] (${height[R]}) = ${trapped}.`
        };
      }
      R--;
    }
  }

  yield {
    height,
    water: [...water],
    left: null,
    right: null,
    leftMax,
    rightMax,
    totalTrapped,
    message: `Trapping Rain Water calculations completed. Total Trapped Water = ${totalTrapped} units.`
  };
}
