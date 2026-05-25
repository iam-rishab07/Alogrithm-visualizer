// Helper to deep clone a tree structure
export function cloneTree(node) {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    height: node.height
  };
}

// Layout Calculator for Tree Visuals
export function computeTreeLayout(node, x = 350, y = 50, level = 0, parentNode = null) {
  if (!node) return { nodes: [], links: [] };

  const nodes = [];
  const links = [];

  const hOffset = 180 / Math.pow(1.8, level);
  const vOffset = 65;

  const leftChildLayout = computeTreeLayout(node.left, x - hOffset, y + vOffset, level + 1, { x, y });
  const rightChildLayout = computeTreeLayout(node.right, x + hOffset, y + vOffset, level + 1, { x, y });

  nodes.push({
    value: node.value,
    x,
    y
  });

  if (parentNode) {
    links.push({
      x1: parentNode.x,
      y1: parentNode.y,
      x2: x,
      y2: y
    });
  }

  return {
    nodes: [...nodes, ...leftChildLayout.nodes, ...rightChildLayout.nodes],
    links: [...links, ...leftChildLayout.links, ...rightChildLayout.links]
  };
}

// Tree node structure helpers
function getHN(node) {
  return node ? node.height : 0;
}

function getBalance(node) {
  if (!node) return 0;
  return getHN(node.left) - getHN(node.right);
}

function updateHN(node) {
  node.height = Math.max(getHN(node.left), getHN(node.right)) + 1;
}

// AVL Rotations
function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHN(y);
  updateHN(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHN(x);
  updateHN(y);
  return y;
}

/**
 * BST / AVL Insert Generator
 */
export function* treeInsert(root, value, isAVL = false) {
  let steps = [];

  function* insertHelper(node, val) {
    if (!node) {
      const newNode = { value: val, left: null, right: null, height: 1 };
      yield {
        tree: newNode,
        highlightedValue: val,
        status: `Created new node ${val}.`,
        isAction: true
      };
      return newNode;
    }

    yield {
      tree: node,
      highlightedValue: node.value,
      status: `Comparing ${val} with node ${node.value}.`,
      isAction: false
    };

    if (val < node.value) {
      node.left = yield* insertHelper(node.left, val);
    } else if (val > node.value) {
      node.right = yield* insertHelper(node.right, val);
    } else {
      // Duplicate values not allowed
      yield {
        tree: node,
        highlightedValue: node.value,
        status: `Value ${val} already exists in the tree.`,
        isAction: true
      };
      return node;
    }

    updateHN(node);

    if (isAVL) {
      const balance = getBalance(node);
      
      // Left Left Case
      if (balance > 1 && val < node.left.value) {
        yield {
          tree: node,
          highlightedValue: node.value,
          status: `Left-Left Unbalance detected at node ${node.value}. Executing Right Rotation.`,
          isAction: true
        };
        return rotateRight(node);
      }
      
      // Right Right Case
      if (balance < -1 && val > node.right.value) {
        yield {
          tree: node,
          highlightedValue: node.value,
          status: `Right-Right Unbalance detected at node ${node.value}. Executing Left Rotation.`,
          isAction: true
        };
        return rotateLeft(node);
      }
      
      // Left Right Case
      if (balance > 1 && val > node.left.value) {
        yield {
          tree: node,
          highlightedValue: node.left.value,
          status: `Left-Right Unbalance detected at node ${node.value}. Rotating Left at child ${node.left.value}.`,
          isAction: true
        };
        node.left = rotateLeft(node.left);
        yield {
          tree: node,
          highlightedValue: node.value,
          status: `Executing Right Rotation at node ${node.value}.`,
          isAction: true
        };
        return rotateRight(node);
      }
      
      // Right Left Case
      if (balance < -1 && val < node.right.value) {
        yield {
          tree: node,
          highlightedValue: node.right.value,
          status: `Right-Left Unbalance detected at node ${node.value}. Rotating Right at child ${node.right.value}.`,
          isAction: true
        };
        node.right = rotateRight(node.right);
        yield {
          tree: node,
          highlightedValue: node.value,
          status: `Executing Left Rotation at node ${node.value}.`,
          isAction: true
        };
        return rotateLeft(node);
      }
    }

    return node;
  }

  let rootCopy = cloneTree(root);
  const generator = insertHelper(rootCopy, value);
  let step = generator.next();

  while (!step.done) {
    // We yield intermediate states
    // To ensure layout displays the whole tree, we must stitch the modified sub-node back into the full root tree
    // We handle this by cloning the root, traversing to find the target and applying it.
    // To keep it clean, the helper yields snapshots of the entire tree!
    yield {
      treeSnapshot: rootCopy,
      highlightedValue: step.value.highlightedValue,
      status: step.value.status,
      isAction: step.value.isAction
    };
    step = generator.next();
  }

  // Final Tree Return
  yield {
    treeSnapshot: rootCopy,
    highlightedValue: null,
    status: `Insertion of ${value} completed successfully!`,
    isAction: false
  };
}

/**
 * BST Traversals (Inorder, Preorder, Postorder, Levelorder)
 */
export function* treeTraversal(root, type) {
  const traversedList = [];

  function* inorder(node) {
    if (!node) return;
    yield* inorder(node.left);
    traversedList.push(node.value);
    yield {
      highlightedValue: node.value,
      traversed: [...traversedList],
      status: `Visiting node ${node.value}. Appending to In-order output.`
    };
    yield* inorder(node.right);
  }

  function* preorder(node) {
    if (!node) return;
    traversedList.push(node.value);
    yield {
      highlightedValue: node.value,
      traversed: [...traversedList],
      status: `Visiting node ${node.value}. Appending to Pre-order output.`
    };
    yield* preorder(node.left);
    yield* preorder(node.right);
  }

  function* postorder(node) {
    if (!node) return;
    yield* postorder(node.left);
    yield* postorder(node.right);
    traversedList.push(node.value);
    yield {
      highlightedValue: node.value,
      traversed: [...traversedList],
      status: `Visiting node ${node.value}. Appending to Post-order output.`
    };
  }

  function* levelorder(node) {
    if (!node) return;
    const queue = [node];
    while (queue.length > 0) {
      const current = queue.shift();
      traversedList.push(current.value);
      yield {
        highlightedValue: current.value,
        traversed: [...traversedList],
        status: `Visiting node ${current.value}. Appending to Level-order output.`
      };
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  }

  if (type === 'inorder') yield* inorder(root);
  else if (type === 'preorder') yield* preorder(root);
  else if (type === 'postorder') yield* postorder(root);
  else if (type === 'levelorder') yield* levelorder(root);
}

// Trie (Prefix Tree) layouts
export function computeTrieLayout(node, x = 350, y = 40, level = 0, char = '*', parent = null) {
  if (!node) return { nodes: [], links: [] };

  const nodes = [];
  const links = [];

  const childrenCount = Object.keys(node.children).length;
  const childKeys = Object.keys(node.children).sort();

  const hSpread = Math.max(160 / Math.pow(1.5, level), 25);
  const vSpread = 55;

  nodes.push({
    id: node.id,
    char,
    isWordEnd: node.isWordEnd,
    x,
    y
  });

  if (parent) {
    links.push({
      x1: parent.x,
      y1: parent.y,
      x2: x,
      y2: y
    });
  }

  childKeys.forEach((key, idx) => {
    let childX = x;
    if (childrenCount > 1) {
      const startX = x - (hSpread * (childrenCount - 1)) / 2;
      childX = startX + idx * hSpread;
    }
    const childLayout = computeTrieLayout(node.children[key], childX, y + vSpread, level + 1, key, { x, y });
    nodes.push(...childLayout.nodes);
    links.push(...childLayout.links);
  });

  return { nodes, links };
}

/**
 * Trie Insertion Step Generator
 */
export function* trieInsertWord(trieRoot, word) {
  let root = { ...trieRoot };
  let current = root;
  let nodeCount = 0; // tracking nodes internally

  yield {
    trieSnapshot: root,
    highlightedId: current.id,
    status: `Starting Trie insert for word "${word}" at root.`
  };

  for (let i = 0; i < word.length; i++) {
    const char = word[i].toUpperCase();
    
    if (!current.children[char]) {
      // Create node
      const newId = `${char}-${Math.random().toString(36).substr(2, 5)}`;
      current.children[char] = {
        id: newId,
        isWordEnd: false,
        children: {}
      };
      
      yield {
        trieSnapshot: { ...root },
        highlightedId: newId,
        status: `Character '${char}' not found. Adding node to path.`
      };
    } else {
      yield {
        trieSnapshot: { ...root },
        highlightedId: current.children[char].id,
        status: `Character '${char}' already exists. Moving down.`
      };
    }
    current = current.children[char];
  }
  
  current.isWordEnd = true;
  yield {
    trieSnapshot: { ...root },
    highlightedId: current.id,
    status: `Marked end of word for "${word}".`
  };
}

/**
 * Trie Search Step Generator
 */
export function* trieSearchWord(trieRoot, word) {
  let current = trieRoot;
  
  yield {
    highlightedId: current.id,
    status: `Searching for word "${word}" starting at Trie root.`,
    isFound: null
  };

  for (let i = 0; i < word.length; i++) {
    const char = word[i].toUpperCase();
    
    if (!current.children[char]) {
      yield {
        highlightedId: current.id,
        status: `Character '${char}' NOT found. Word "${word}" does not exist in Trie.`,
        isFound: false
      };
      return;
    }
    
    current = current.children[char];
    yield {
      highlightedId: current.id,
      status: `Character '${char}' found. Moving down.`,
      isFound: null
    };
  }

  if (current.isWordEnd) {
    yield {
      highlightedId: current.id,
      status: `Word "${word}" found and is marked as a valid leaf word!`,
      isFound: true
    };
  } else {
    yield {
      highlightedId: current.id,
      status: `Prefix "${word}" exists, but it is not marked as a completed word.`,
      isFound: false
    };
  }
}
