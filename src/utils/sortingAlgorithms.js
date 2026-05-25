/**
 * Bubble Sort Generator
 * Yields steps for visualizing Bubble Sort.
 */
export function* bubbleSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = [];
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...array], compared: [j, j + 1], swapped: [], sorted: [...sorted] };
      
      if (array[j] > array[j + 1]) {
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        yield { array: [...array], compared: [], swapped: [j, j + 1], sorted: [...sorted] };
      }
    }
    sorted.push(n - i - 1);
    yield { array: [...array], compared: [], swapped: [], sorted: [...sorted] };
  }
  sorted.push(0);
  yield { array: [...array], compared: [], swapped: [], sorted: [...sorted] };
}

/**
 * Selection Sort Generator
 * Yields steps for Selection Sort.
 */
export function* selectionSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = [];
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { array: [...array], compared: [j, minIdx], swapped: [], sorted: [...sorted] };
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
        yield { array: [...array], compared: [j, minIdx], swapped: [], sorted: [...sorted] };
      }
    }
    if (minIdx !== i) {
      let temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      yield { array: [...array], compared: [], swapped: [i, minIdx], sorted: [...sorted] };
    }
    sorted.push(i);
    yield { array: [...array], compared: [], swapped: [], sorted: [...sorted] };
  }
  sorted.push(n - 1);
  yield { array: [...array], compared: [], swapped: [], sorted: [...sorted] };
}

/**
 * Insertion Sort Generator
 * Yields steps for Insertion Sort.
 */
export function* insertionSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = [0];
  
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    
    yield { array: [...array], compared: [i, j], swapped: [], sorted: [...sorted] };
    
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      yield { array: [...array], compared: [], swapped: [j, j + 1], sorted: [...sorted] };
      j = j - 1;
    }
    array[j + 1] = key;
    yield { array: [...array], compared: [], swapped: [j + 1], sorted: [...sorted] };
    
    sorted = Array.from({ length: i + 1 }, (_, idx) => idx);
  }
  
  yield { array: [...array], compared: [], swapped: [], sorted: Array.from({ length: n }, (_, idx) => idx) };
}

/**
 * Merge Sort Generator
 * Yields steps for Merge Sort (Divide & Conquer).
 */
export function* mergeSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = new Set();
  
  function* merge(low, mid, high) {
    let left = array.slice(low, mid + 1);
    let right = array.slice(mid + 1, high + 1);
    let i = 0, j = 0, k = low;
    
    while (i < left.length && j < right.length) {
      yield { array: [...array], compared: [low + i, mid + 1 + j], swapped: [], sorted: Array.from(sorted) };
      if (left[i] <= right[j]) {
        array[k] = left[i];
        i++;
      } else {
        array[k] = right[j];
        j++;
      }
      yield { array: [...array], compared: [], swapped: [k], sorted: Array.from(sorted) };
      k++;
    }
    
    while (i < left.length) {
      array[k] = left[i];
      yield { array: [...array], compared: [], swapped: [k], sorted: Array.from(sorted) };
      i++;
      k++;
    }
    
    while (j < right.length) {
      array[k] = right[j];
      yield { array: [...array], compared: [], swapped: [k], sorted: Array.from(sorted) };
      j++;
      k++;
    }
    
    // If it is the final merge of the entire array, mark all as sorted
    if (low === 0 && high === n - 1) {
      for (let s = 0; s < n; s++) sorted.add(s);
    }
  }
  
  function* mergeSortHelper(low, high) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      yield* mergeSortHelper(low, mid);
      yield* mergeSortHelper(mid + 1, high);
      yield* merge(low, mid, high);
    }
  }
  
  yield* mergeSortHelper(0, n - 1);
  for (let s = 0; s < n; s++) sorted.add(s);
  yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
}

/**
 * Quick Sort Generator (Lomuto Partitioning)
 * Yields steps for Quick Sort.
 */
export function* quickSort(arr) {
  let array = [...arr];
  let sorted = new Set();
  
  function* partition(low, high) {
    let pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      yield { array: [...array], compared: [j, high], swapped: [], sorted: Array.from(sorted) };
      
      if (array[j] < pivot) {
        i++;
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        yield { array: [...array], compared: [], swapped: [i, j], sorted: Array.from(sorted) };
      }
    }
    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;
    yield { array: [...array], compared: [], swapped: [i + 1, high], sorted: Array.from(sorted) };
    
    const p = i + 1;
    sorted.add(p);
    yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
    return p;
  }
  
  function* quickSortHelper(low, high) {
    if (low < high) {
      let pi = yield* partition(low, high);
      yield* quickSortHelper(low, pi - 1);
      yield* quickSortHelper(pi + 1, high);
    } else if (low === high) {
      sorted.add(low);
      yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
    }
  }
  
  yield* quickSortHelper(0, array.length - 1);
  for (let i = 0; i < array.length; i++) {
    sorted.add(i);
  }
  yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
}

/**
 * Heap Sort Generator
 * Yields steps for Heap Sort.
 */
export function* heapSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = new Set();
  
  function* heapify(size, rootIdx) {
    let largest = rootIdx;
    let left = 2 * rootIdx + 1;
    let right = 2 * rootIdx + 2;
    
    if (left < size) {
      yield { array: [...array], compared: [left, largest], swapped: [], sorted: Array.from(sorted) };
      if (array[left] > array[largest]) {
        largest = left;
      }
    }
    
    if (right < size) {
      yield { array: [...array], compared: [right, largest], swapped: [], sorted: Array.from(sorted) };
      if (array[right] > array[largest]) {
        largest = right;
      }
    }
    
    if (largest !== rootIdx) {
      let temp = array[rootIdx];
      array[rootIdx] = array[largest];
      array[largest] = temp;
      yield { array: [...array], compared: [], swapped: [rootIdx, largest], sorted: Array.from(sorted) };
      
      yield* heapify(size, largest);
    }
  }
  
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }
  
  for (let i = n - 1; i > 0; i--) {
    let temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    yield { array: [...array], compared: [], swapped: [0, i], sorted: Array.from(sorted) };
    
    sorted.add(i);
    yield* heapify(i, 0);
  }
  sorted.add(0);
  yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
}

/**
 * Radix Sort Generator
 * Yields steps for Radix Sort.
 */
export function* radixSort(arr) {
  let array = [...arr];
  const n = array.length;
  let sorted = new Set();
  
  let max = Math.max(...array);
  
  function* countingSort(exp) {
    let output = new Array(n).fill(0);
    let count = new Array(10).fill(0);
    
    for (let i = 0; i < n; i++) {
      let digit = Math.floor(array[i] / exp) % 10;
      count[digit]++;
      yield { array: [...array], compared: [i], swapped: [], sorted: Array.from(sorted) };
    }
    
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    
    for (let i = n - 1; i >= 0; i--) {
      let digit = Math.floor(array[i] / exp) % 10;
      output[count[digit] - 1] = array[i];
      count[digit]--;
    }
    
    for (let i = 0; i < n; i++) {
      array[i] = output[i];
      yield { array: [...array], compared: [], swapped: [i], sorted: Array.from(sorted) };
    }
  }
  
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    yield* countingSort(exp);
  }
  
  for (let i = 0; i < n; i++) {
    sorted.add(i);
  }
  yield { array: [...array], compared: [], swapped: [], sorted: Array.from(sorted) };
}
