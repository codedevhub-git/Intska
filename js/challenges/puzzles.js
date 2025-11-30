/**
 * Puzzle Challenges
 * 13. Drag-and-Drop Sorting
 * 14. Tile Shuffle Puzzle
 * 15. Cup Shuffle Game
 * 16. Water Levels Puzzle
 * 17. Shape Rotation Fit
 * 18. Word Unscramble
 * 19. Cube Counting
 * 20. Same Game (Color Cluster)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice, shuffleArray, generateColors } from '../utils/random.js';
import { validateArray, validateNumber, validateString } from '../utils/validators.js';

/**
 * 13. Drag-and-Drop Sorting Challenge
 */
export function createDragDropSortingChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  const categories = [
    { name: 'Even', test: (n) => n % 2 === 0, items: () => Array.from({ length: params.itemCount }, () => randomInt(1, 50)) },
    { name: 'Odd', test: (n) => n % 2 !== 0, items: () => Array.from({ length: params.itemCount }, () => randomInt(1, 50)) },
    { name: 'Big (>25)', test: (n) => n > 25, items: () => Array.from({ length: params.itemCount }, () => randomInt(1, 50)) },
    { name: 'Small (≤25)', test: (n) => n <= 25, items: () => Array.from({ length: params.itemCount }, () => randomInt(1, 50)) }
  ];
  
  const sortType = randomChoice(categories);
  const items = sortType.items();
  const shuffledItems = shuffleArray(items);
  
  const correctAnswer = items.map((item, index) => 
    sortType.test(item) ? index : -1
  ).filter(i => i !== -1).sort((a, b) => a - b);
  
  let selectedItems = [];
  
  return {
    id: 'drag-drop-sorting',
    category: 'puzzle',
    difficulty: difficulty,
    title: `Select All: ${sortType.name}`,
    correctAnswer: correctAnswer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="sorting-challenge">
          <p class="sort-instruction">Click all ${sortType.name} numbers</p>
          <div class="sortable-items">
            ${shuffledItems.map((item, index) => `
              <div class="sortable-item" data-index="${index}" data-value="${item}">
                ${item}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary">Submit</button>
        <button id="clear-btn" class="btn btn-secondary">Clear</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const items = contentContainer.querySelectorAll('.sortable-item');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const clearBtn = answerContainer.querySelector('#clear-btn');
      
      selectedItems = [];
      
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.index);
          
          if (item.classList.contains('item-selected')) {
            item.classList.remove('item-selected');
            selectedItems = selectedItems.filter(i => i !== index);
          } else {
            item.classList.add('item-selected');
            selectedItems.push(index);
          }
        });
      });
      
      clearBtn.addEventListener('click', () => {
        items.forEach(item => item.classList.remove('item-selected'));
        selectedItems = [];
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: selectedItems.sort((a, b) => a - b) } 
        }));
      });
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {
      selectedItems = [];
    }
  };
}

/**
 * 14. Tile Shuffle Puzzle Challenge
 */
export function createTileShufflePuzzle(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  const gridSize = params.tileGridSize;
  const totalTiles = gridSize * gridSize;
  
  // Create solved state (0 represents empty)
  const solvedState = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
  solvedState.push(0);
  
  // Shuffle tiles (ensure solvable)
  let tiles = [...solvedState];
  const emptyIndex = tiles.indexOf(0);
  
  // Make random valid moves
  const moves = 20 + (difficulty * 5);
  let currentEmpty = emptyIndex;
  
  for (let i = 0; i < moves; i++) {
    const validMoves = getValidMoves(currentEmpty, gridSize);
    const randomMove = validMoves[randomInt(0, validMoves.length - 1)];
    
    [tiles[currentEmpty], tiles[randomMove]] = [tiles[randomMove], tiles[currentEmpty]];
    currentEmpty = randomMove;
  }
  
  let currentTiles = [...tiles];
  
  return {
    id: 'tile-shuffle',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Arrange Tiles in Order',
    correctAnswer: solvedState,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="tile-puzzle">
          <div class="tile-grid" id="tile-grid" style="
            grid-template-columns: repeat(${gridSize}, 1fr);
            grid-template-rows: repeat(${gridSize}, 1fr);
          ">
            ${currentTiles.map((tile, index) => `
              <div class="tile ${tile === 0 ? 'tile-empty' : ''}" data-index="${index}">
                ${tile === 0 ? '' : tile}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary">Check Solution</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const grid = contentContainer.querySelector('#tile-grid');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      grid.addEventListener('click', (e) => {
        const tile = e.target.closest('.tile');
        if (!tile) return;
        
        const index = parseInt(tile.dataset.index);
        const emptyIndex = currentTiles.indexOf(0);
        
        const validMoves = getValidMoves(emptyIndex, gridSize);
        
        if (validMoves.includes(index)) {
          [currentTiles[index], currentTiles[emptyIndex]] = 
          [currentTiles[emptyIndex], currentTiles[index]];
          
          this.render(contentContainer, answerContainer);
        }
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentTiles } 
        }));
      });
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {
      currentTiles = [];
    }
  };
}

function getValidMoves(emptyIndex, gridSize) {
  const row = Math.floor(emptyIndex / gridSize);
  const col = emptyIndex % gridSize;
  const moves = [];
  
  if (row > 0) moves.push(emptyIndex - gridSize); // Up
  if (row < gridSize - 1) moves.push(emptyIndex + gridSize); // Down
  if (col > 0) moves.push(emptyIndex - 1); // Left
  if (col < gridSize - 1) moves.push(emptyIndex + 1); // Right
  
  return moves;
}

/**
 * 15. Cup Shuffle Game Challenge
 */
export function createCupShuffleChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  const cupCount = params.cupCount;
  const ballPosition = randomInt(0, cupCount - 1);
  
  let isShuffling = false;
  
  return {
    id: 'cup-shuffle',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Track the Ball',
    correctAnswer: ballPosition,
    
    async render(contentContainer, answerContainer) {
      // Show ball initially
      contentContainer.innerHTML = `
        <div class="cup-shuffle">
          <p class="shuffle-instruction">Watch the ball...</p>
          <div class="cups-container" id="cups-container">
            ${Array.from({ length: cupCount }, (_, i) => `
              <div class="cup" data-index="${i}">
                <div class="cup-top"></div>
                ${i === ballPosition ? '<div class="ball">●</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hide ball
      const ball = contentContainer.querySelector('.ball');
      if (ball) ball.style.opacity = '0';
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Shuffle
      await this.performShuffle(contentContainer, params);
      
      // Show answer options
      contentContainer.querySelector('.shuffle-instruction').textContent = 
        'Which cup has the ball?';
      
      answerContainer.innerHTML = `
        <p class="instruction">Click a cup</p>
      `;
      
      this.setupEventListeners(contentContainer);
    },
    
    async performShuffle(contentContainer, params) {
      const cupsContainer = contentContainer.querySelector('#cups-container');
      const cups = Array.from(cupsContainer.querySelectorAll('.cup'));
      
      const shuffles = params.shuffleMoves;
      
      for (let i = 0; i < shuffles; i++) {
        const idx1 = randomInt(0, cups.length - 1);
        let idx2 = randomInt(0, cups.length - 1);
        while (idx2 === idx1) {
          idx2 = randomInt(0, cups.length - 1);
        }
        
        // Animate swap
        await this.swapCups(cups[idx1], cups[idx2], params.shuffleSpeed);
      }
    },
    
    async swapCups(cup1, cup2, speed) {
      cup1.style.transition = `transform ${speed}ms ease`;
      cup2.style.transition = `transform ${speed}ms ease`;
      
      const distance = (parseInt(cup2.dataset.index) - parseInt(cup1.dataset.index)) * 100;
      
      cup1.style.transform = `translateX(${distance}px)`;
      cup2.style.transform = `translateX(${-distance}px)`;
      
      await new Promise(resolve => setTimeout(resolve, speed));
      
      // Swap data-index
      const temp = cup1.dataset.index;
      cup1.dataset.index = cup2.dataset.index;
      cup2.dataset.index = temp;
      
      cup1.style.transform = '';
      cup2.style.transform = '';
      cup1.style.transition = '';
      cup2.style.transition = '';
    },
    
    setupEventListeners(contentContainer) {
      const cups = contentContainer.querySelectorAll('.cup');
      
      cups.forEach((cup) => {
        cup.addEventListener('click', () => {
          const answer = parseInt(cup.dataset.index);
          window.dispatchEvent(new CustomEvent('challengeAnswer', { 
            detail: { answer } 
          }));
        });
      });
    },
    
    check(answer) {
      return answer === this.correctAnswer;
    },
    
    cleanup() {}
  };
}

/**
 * 16. Water Levels Puzzle Challenge
 */
export function createWaterLevelsPuzzle(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  const containerCount = params.containerCount;
  
  // Generate random water levels
  const levels = Array.from({ length: containerCount }, () => 
    randomInt(20, 80)
  );
  
  const correctOrder = levels
    .map((level, index) => ({ level, index }))
    .sort((a, b) => a.level - b.level)
    .map(item => item.index);
  
  const shuffledLevels = shuffleArray([...levels]);
  let currentOrder = shuffledLevels.map((_, i) => i);
  
  return {
    id: 'water-levels',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Sort by Water Level (Low to High)',
    correctAnswer: correctOrder,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="water-puzzle">
          <div class="containers-row" id="containers">
            ${currentOrder.map((originalIndex, displayIndex) => {
              const level = shuffledLevels[originalIndex];
              return `
                <div class="water-container" data-original="${originalIndex}" data-display="${displayIndex}">
                  <div class="water-fill" style="height: ${level}%"></div>
                  <div class="container-label">${displayIndex + 1}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <p class="instruction">Click two containers to swap them</p>
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const containers = contentContainer.querySelectorAll('.water-container');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      let selectedContainer = null;
      
      containers.forEach((container) => {
        container.addEventListener('click', () => {
          if (!selectedContainer) {
            selectedContainer = container;
            container.classList.add('container-selected');
          } else {
            if (selectedContainer === container) {
              container.classList.remove('container-selected');
              selectedContainer = null;
            } else {
              // Swap
              const idx1 = parseInt(selectedContainer.dataset.display);
              const idx2 = parseInt(container.dataset.display);
              
              [currentOrder[idx1], currentOrder[idx2]] = 
              [currentOrder[idx2], currentOrder[idx1]];
              
              selectedContainer.classList.remove('container-selected');
              selectedContainer = null;
              
              this.render(contentContainer, answerContainer);
            }
          }
        });
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentOrder } 
        }));
      });
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

/**
 * 17. Shape Rotation Fit Challenge
 */
export function createShapeRotationChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  const shapes = ['L', 'T', 'Z', 'arrow'];
  const targetShape = randomChoice(shapes);
  const targetRotation = randomChoice([0, 90, 180, 270]);
  
  let currentRotation = randomInt(0, 3) * 90;
  while (currentRotation === targetRotation) {
    currentRotation = randomInt(0, 3) * 90;
  }
  
  return {
    id: 'shape-rotation',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Rotate to Match',
    correctAnswer: targetRotation,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="rotation-challenge">
          <div class="target-silhouette">
            <p>Match this:</p>
            <div class="shape shape-${targetShape}" style="transform: rotate(${targetRotation}deg);"></div>
          </div>
          <div class="rotatable-shape">
            <p>Rotate this:</p>
            <div class="shape shape-${targetShape} shape-active" id="active-shape" 
                 style="transform: rotate(${currentRotation}deg);"></div>
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="rotation-controls">
          <button id="rotate-left" class="btn btn-secondary">↶ Rotate Left</button>
          <button id="rotate-right" class="btn btn-secondary">Rotate Right ↷</button>
        </div>
        <button id="submit-btn" class="btn btn-primary" style="margin-top: 20px;">Submit</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const shape = contentContainer.querySelector('#active-shape');
      const rotateLeft = answerContainer.querySelector('#rotate-left');
      const rotateRight = answerContainer.querySelector('#rotate-right');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      rotateLeft.addEventListener('click', () => {
        currentRotation = (currentRotation - 90 + 360) % 360;
        shape.style.transform = `rotate(${currentRotation}deg)`;
      });
      
      rotateRight.addEventListener('click', () => {
        currentRotation = (currentRotation + 90) % 360;
        shape.style.transform = `rotate(${currentRotation}deg)`;
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentRotation } 
        }));
      });
    },
    
    check(answer) {
      return answer === this.correctAnswer;
    },
    
    cleanup() {}
  };
}

/**
 * 18. Word Unscramble Challenge
 */
export function createWordUnscrambleChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  const wordsByLength = {
    4: ['code', 'game', 'play', 'mind', 'fast', 'quiz', 'help', 'jump'],
    5: ['brain', 'smart', 'think', 'solve', 'logic', 'quick', 'match', 'focus'],
    6: ['puzzle', 'memory', 'answer', 'number', 'player', 'choose', 'system'],
    7: ['pattern', 'sequence', 'challenge', 'correct', 'mistake'],
    8: ['question', 'learning', 'thinking', 'complete'],
    9: ['algorithm', 'calculate', 'different'],
    10: ['difficulty', 'comparison', 'processing']
  };
  
  const targetLength = Math.min(params.wordLength, 10);
  const availableWords = wordsByLength[targetLength] || wordsByLength[5];
  const correctWord = randomChoice(availableWords);
  const scrambledWord = shuffleArray(correctWord.split('')).join('');
  
  return {
    id: 'word-unscramble',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Unscramble the Word',
    correctAnswer: correctWord.toLowerCase(),
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="unscramble-challenge">
          <div class="scrambled-word">${scrambledWord.toUpperCase()}</div>
          <p class="unscramble-hint">Rearrange the letters to form a word</p>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="text" 
          id="answer-input" 
          class="answer-input"
          placeholder="Type the word"
          autocomplete="off"
          maxlength="${correctWord.length}"
        />
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      this.setupEventListeners(answerContainer);
    },
    
    setupEventListeners(answerContainer) {
      const input = answerContainer.querySelector('#answer-input');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      input.focus();
      
      const submit = () => {
        const answer = input.value.toLowerCase().trim();
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer } 
        }));
      };
      
      submitBtn.addEventListener('click', submit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submit();
      });
    },
    
    check(answer) {
      return validateString(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

/**
 * 19. Cube Counting Challenge
 */
export function createCubeCountingChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  // Simple cube stacks (2D representation)
  const stacks = [
    { visual: '□\n□□\n□□□', count: 6 },
    { visual: '□□\n□□\n□□', count: 6 },
    { visual: '□\n□\n□□□', count: 5 },
    { visual: '□□□\n□□\n□', count: 6 },
    { visual: '□\n□□\n□□\n□□□', count: 7 },
    { visual: '□□\n□□\n□□\n□□', count: 8 }
  ];
  
  const stack = randomChoice(stacks);
  
  return {
    id: 'cube-counting',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Count the Cubes',
    correctAnswer: stack.count,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="cube-challenge">
          <p class="cube-instruction">How many cubes are in this stack?</p>
          <pre class="cube-visual">${stack.visual}</pre>
          <p class="cube-hint">Count all visible and hidden cubes</p>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Number of cubes"
          autocomplete="off"
          min="1"
        />
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      this.setupEventListeners(answerContainer);
    },
    
    setupEventListeners(answerContainer) {
      const input = answerContainer.querySelector('#answer-input');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      input.focus();
      
      const submit = () => {
        const answer = parseInt(input.value);
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer } 
        }));
      };
      
      submitBtn.addEventListener('click', submit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submit();
      });
    },
    
    check(answer) {
      return validateNumber(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

/**
 * 20. Same Game (Color Cluster) Challenge
 */
export function createSameGameChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  const gridSize = 8;
  const colors = generateColors(params.colorCount);
  
  // Generate grid
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => randomChoice(colors))
  );
  
  // Find a cluster to click
  const targetCluster = findLargestCluster(grid);
  const targetSize = targetCluster.length;
  
  return {
    id: 'same-game',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Click the Largest Color Group',
    correctAnswer: targetSize,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="same-game">
          <p class="game-instruction">Click the largest connected group of same color</p>
          <div class="same-game-grid" id="game-grid">
            ${grid.map((row, i) => 
              row.map((color, j) => `
                <div class="game-cell" data-row="${i}" data-col="${j}" 
                     style="background-color: ${color};"></div>
              `).join('')
            ).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <p class="instruction">Click any cell in the group</p>
      `;
      
      this.setupEventListeners(contentContainer);
    },
    
    setupEventListeners(contentContainer) {
      const cells = contentContainer.querySelectorAll('.game-cell');
      
      cells.forEach((cell) => {
        cell.addEventListener('click', () => {
          const row = parseInt(cell.dataset.row);
          const col = parseInt(cell.dataset.col);
          const color = grid[row][col];
          
          const cluster = getCluster(grid, row, col, color);
          const answer = cluster.length;
          
          window.dispatchEvent(new CustomEvent('challengeAnswer', { 
            detail: { answer } 
          }));
        });
      });
    },
    
    check(answer) {
      return validateNumber(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

function getCluster(grid, row, col, color, visited = new Set()) {
  const key = `${row},${col}`;
  
  if (visited.has(key)) return [];
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return [];
  if (grid[row][col] !== color) return [];
  
  visited.add(key);
  const cluster = [{ row, col }];
  
  cluster.push(...getCluster(grid, row - 1, col, color, visited));
  cluster.push(...getCluster(grid, row + 1, col, color, visited));
  cluster.push(...getCluster(grid, row, col - 1, color, visited));
  cluster.push(...getCluster(grid, row, col + 1, color, visited));
  
  return cluster;
}

function findLargestCluster(grid) {
  let largest = [];
  const checked = new Set();
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const key = `${i},${j}`;
      if (!checked.has(key)) {
        const cluster = getCluster(grid, i, j, grid[i][j]);
        cluster.forEach(cell => checked.add(`${cell.row},${cell.col}`));
        
        if (cluster.length > largest.length) {
          largest = cluster;
        }
      }
    }
  }
  
  return largest;
}


/**
 * Register all puzzle challenges
 */
import { registerChallenge } from './registry.js';

registerChallenge('drag-drop-sorting', 'puzzle', createDragDropSortingChallenge, {
  name: 'Sorting',
  description: 'Sort items by category',
  minDifficulty: 1
});

registerChallenge('tile-shuffle', 'puzzle', createTileShufflePuzzle, {
  name: 'Tile Puzzle',
  description: 'Arrange tiles in order',
  minDifficulty: 3
});

registerChallenge('cup-shuffle', 'puzzle', createCupShuffleChallenge, {
  name: 'Cup Shuffle',
  description: 'Track the ball',
  minDifficulty: 1
});

registerChallenge('water-levels', 'puzzle', createWaterLevelsPuzzle, {
  name: 'Water Levels',
  description: 'Sort containers by level',
  minDifficulty: 2
});

registerChallenge('shape-rotation', 'puzzle', createShapeRotationChallenge, {
  name: 'Shape Rotation',
  description: 'Rotate shape to match',
  minDifficulty: 2
});

registerChallenge('word-unscramble', 'puzzle', createWordUnscrambleChallenge, {
  name: 'Word Unscramble',
  description: 'Unscramble letters',
  minDifficulty: 1
});

registerChallenge('cube-counting', 'puzzle', createCubeCountingChallenge, {
  name: 'Cube Counting',
  description: 'Count cubes in stack',
  minDifficulty: 4
});

registerChallenge('same-game', 'puzzle', createSameGameChallenge, {
  name: 'Color Cluster',
  description: 'Find largest color group',
  minDifficulty: 3
});