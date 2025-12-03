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
 * registerChallenge
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice, shuffleArray, generateColors } from '../utils/random.js';
import { validateArray, validateNumber, validateString } from '../utils/validators.js';

/**
 * 13. Number Selection Challenge (formerly Drag-and-Drop)
 * FIXED: Renamed to match actual gameplay (Click/Select)
 */
export function createNumberSelectionChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  // 1. Define the Rules
  const categories = [
    { 
      name: 'Even Numbers', 
      test: (n) => n % 2 === 0, 
      // Generate a mix of even and odd to ensure the game is playable
      generate: () => {
        const evens = Array.from({ length: 4 }, () => randomInt(1, 25) * 2);
        const odds = Array.from({ length: 4 }, () => randomInt(1, 25) * 2 - 1);
        return shuffleArray([...evens, ...odds]);
      }
    },
    { 
      name: 'Odd Numbers', 
      test: (n) => n % 2 !== 0,
      generate: () => {
        const evens = Array.from({ length: 4 }, () => randomInt(1, 25) * 2);
        const odds = Array.from({ length: 4 }, () => randomInt(1, 25) * 2 - 1);
        return shuffleArray([...evens, ...odds]);
      }
    },
    { 
      name: 'Big Numbers (>50)', 
      test: (n) => n > 50,
      generate: () => {
        const big = Array.from({ length: 4 }, () => randomInt(51, 99));
        const small = Array.from({ length: 4 }, () => randomInt(1, 49));
        return shuffleArray([...big, ...small]);
      }
    },
    { 
      name: 'Small Numbers (≤50)', 
      test: (n) => n <= 50,
      generate: () => {
        const big = Array.from({ length: 4 }, () => randomInt(51, 99));
        const small = Array.from({ length: 4 }, () => randomInt(1, 49));
        return shuffleArray([...big, ...small]);
      }
    }
  ];
  
  // 2. Setup the Round
  const category = randomChoice(categories);
  
  // We generate specific numbers based on the rule so we KNOW there are correct answers
  // (The old code just picked random numbers, so sometimes there were 0 correct answers)
  const items = category.generate();
  
  // 3. Calculate Correct Indices
  // We store the INDEX of the correct items
  const correctIndices = items
    .map((val, idx) => category.test(val) ? idx : -1)
    .filter(idx => idx !== -1)
    .sort((a, b) => a - b); // Sort needed for comparison later

  // Styles for this game
  const selectionStyles = `
    <style>
      .selection-game { text-align: center; }
      .number-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        padding: 20px;
        max-width: 400px;
        margin: 0 auto;
      }
      .number-item {
        background: #ecf0f1;
        border: 2px solid #bdc3c7;
        border-radius: 8px;
        padding: 20px 10px;
        font-size: 1.5rem;
        font-weight: bold;
        color: #2c3e50;
        cursor: pointer;
        transition: all 0.2s;
      }
      .number-item:hover {
        transform: translateY(-2px);
        border-color: #3498db;
      }
      /* The Selected State */
      .number-item.selected {
        background-color: #3498db;
        color: white;
        border-color: #2980b9;
        box-shadow: 0 4px 10px rgba(52, 152, 219, 0.4);
        transform: scale(1.05);
      }
      .instruction-text {
        font-size: 1.2rem;
        color: #555;
        margin-bottom: 10px;
      }
      .rule-badge {
        background: #2c3e50;
        color: #fff;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
      }
    </style>
  `;

  // Track what user has clicked
  let userSelection = [];

  return {
    id: 'number-selection', // Renamed from drag-drop
    category: 'puzzle',
    difficulty: difficulty,
    title: `Find: ${category.name}`,
    correctAnswer: correctIndices,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${selectionStyles}
        <div class="selection-game">
          <p class="instruction-text">Tap all numbers that match:</p>
          <div class="rule-badge">${category.name}</div>
          <div class="number-grid">
            ${items.map((item, index) => `
              <div class="number-item" data-index="${index}">
                ${item}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="clear-btn" class="btn btn-secondary">Clear</button>
          <button id="submit-btn" class="btn btn-primary">Submit</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const gridItems = contentContainer.querySelectorAll('.number-item');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const clearBtn = answerContainer.querySelector('#clear-btn');
      
      userSelection = [];
      
      // Handle Item Clicks
      gridItems.forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.index);
          
          if (userSelection.includes(idx)) {
            // Deselect
            userSelection = userSelection.filter(i => i !== idx);
            item.classList.remove('selected');
          } else {
            // Select
            userSelection.push(idx);
            item.classList.add('selected');
          }
        });
      });
      
      // Clear All
      clearBtn.addEventListener('click', () => {
        userSelection = [];
        gridItems.forEach(item => item.classList.remove('selected'));
      });
      
      // Submit
      submitBtn.addEventListener('click', () => {
        // Sort selection so comparison works (e.g. [1,2] matches [1,2])
        const finalAnswer = userSelection.sort((a, b) => a - b);
        
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: finalAnswer } 
        }));
      });
    },
    
    check(answer) {
      // Compare the two arrays (User's indices vs Correct indices)
      return JSON.stringify(answer) === JSON.stringify(this.correctAnswer);
    },
    
    cleanup() {
      userSelection = [];
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
 * 15. Cup Shuffle Game Challenge (FIXED)
 */
export function createCupShuffleChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  const cupCount = params.cupCount;
  
  // Track where the ball is (index 0 to cupCount-1)
  let ballLocation = randomInt(0, cupCount - 1);
  
  // We need to inject some specific CSS for this game to look right
  // without needing you to edit a separate CSS file immediately.
  const gameStyles = `
    <style>
      .cup-shuffle { text-align: center; overflow: hidden; }
      .cups-container { 
        display: flex; 
        justify-content: center; 
        gap: 20px; 
        padding: 20px; 
        min-height: 120px;
        position: relative;
      }
      .cup {
        width: 60px;
        height: 70px;
        position: relative;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        z-index: 2; /* Cups above ball */
      }
      .cup-img {
        width: 100%;
        height: 100%;
        background: #d35400; /* Orange/Brown cup color */
        border-radius: 4px 4px 15px 15px;
        border: 2px solid #a04000;
        position: relative;
        z-index: 2;
      }
      .ball-obj {
        width: 25px;
        height: 25px;
        background-color: #e74c3c; /* Bright Red */
        border-radius: 50%;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1; /* Ball behind cup initially */
        box-shadow: inset -2px -2px 6px rgba(0,0,0,0.3);
      }
      /* Animation classes */
      .cup-lift { transform: translateY(-30px); transition: transform 0.3s; }
    </style>
  `;

  let challengeObject = {
    id: 'cup-shuffle',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Track the Ball',
    correctAnswer: null, // Will be set after shuffle

    async render(contentContainer, answerContainer) {
      // 1. Setup HTML
      contentContainer.innerHTML = `
        ${gameStyles}
        <div class="cup-shuffle">
          <p class="shuffle-instruction" style="font-size: 1.2rem; margin-bottom: 10px;">Watch the ball...</p>
          <div class="cups-container" id="cups-container">
            ${Array.from({ length: cupCount }, (_, i) => `
              <div class="cup" id="cup-${i}" data-id="${i}">
                <div class="cup-img"></div>
                ${i === ballLocation ? '<div class="ball-obj"></div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `<button class="btn btn-secondary" disabled>Shuffling...</button>`;

      // 2. Reveal Sequence
      const cups = contentContainer.querySelectorAll('.cup');
      const ballCup = cups[ballLocation];
      const ball = ballCup.querySelector('.ball-obj');
      const cupImg = ballCup.querySelector('.cup-img');

      // Lift cup to show ball
      await new Promise(r => setTimeout(r, 500));
      cupImg.classList.add('cup-lift');
      
      await new Promise(r => setTimeout(r, 1000));
      
      // Drop cup to hide ball
      cupImg.classList.remove('cup-lift');
      await new Promise(r => setTimeout(r, 500));

      // 3. Start Shuffle
      // Hide the ball visually by setting z-index lower or opacity
      // (Though it's already hidden physically by the cup div sitting on top)
      
      await this.performShuffle(contentContainer, params);

      // 4. Ready for Input
      contentContainer.querySelector('.shuffle-instruction').textContent = 'Which cup has the ball?';
      answerContainer.innerHTML = `<p class="instruction">Click the correct cup</p>`;
      
      this.setupEventListeners(contentContainer);
    },

    async performShuffle(contentContainer, params) {
      const container = contentContainer.querySelector('#cups-container');
      const shuffles = params.shuffleMoves || 5;
      const speed = params.shuffleSpeed || 400;

      for (let i = 0; i < shuffles; i++) {
        // Get current list of cups (order changes in DOM)
        const currentCups = Array.from(container.children);
        
        // Pick two random distinct indices
        const idx1 = randomInt(0, currentCups.length - 1);
        let idx2 = randomInt(0, currentCups.length - 1);
        while (idx2 === idx1) idx2 = randomInt(0, currentCups.length - 1);

        const cup1 = currentCups[idx1];
        const cup2 = currentCups[idx2];

        // Animate and Swap
        await this.swapCups(cup1, cup2, speed, container);
      }
    },

    async swapCups(cup1, cup2, speed, container) {
      // 1. Calculate precise distance between elements
      const x1 = cup1.offsetLeft;
      const x2 = cup2.offsetLeft;
      const distance = x2 - x1;

      // 2. Apply transition
      cup1.style.transition = `transform ${speed}ms ease-in-out`;
      cup2.style.transition = `transform ${speed}ms ease-in-out`;

      // 3. Move visually
      cup1.style.transform = `translateX(${distance}px)`;
      cup2.style.transform = `translateX(${-distance}px)`;

      // 4. Wait for animation
      await new Promise(resolve => setTimeout(resolve, speed));

      // 5. Remove transition to prevent animation during DOM swap
      cup1.style.transition = 'none';
      cup2.style.transition = 'none';
      
      // 6. Reset transform
      cup1.style.transform = '';
      cup2.style.transform = '';

      // 7. Actually swap DOM elements (This is key to prevent flying out!)
      // We swap them in the HTML so they occupy the new physical space naturally
      const parent = cup1.parentNode;
      const sibling1 = cup1.nextSibling === cup2 ? cup1 : cup1.nextSibling;
      
      // Swap logic
      const tempPlaceholder = document.createElement('div');
      parent.insertBefore(tempPlaceholder, cup1);
      parent.insertBefore(cup1, cup2);
      parent.insertBefore(cup2, tempPlaceholder);
      parent.removeChild(tempPlaceholder);
    },

    setupEventListeners(contentContainer) {
      const cups = contentContainer.querySelectorAll('.cup');
      
      cups.forEach(cup => {
        cup.addEventListener('click', () => {
          // Reveal this cup
          const img = cup.querySelector('.cup-img');
          img.classList.add('cup-lift');
          
          // Check if this cup holds the ball
          const hasBall = cup.querySelector('.ball-obj') !== null;
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('challengeAnswer', { 
              detail: { answer: hasBall } 
            }));
          }, 800); // Wait a bit for user to see result
        });
      });
    },

    check(answer) {
      // Answer is boolean (true if they clicked the cup with the ball)
      return answer === true;
    },

    cleanup() {}
  };

  return challengeObject;
}

/**
 * 16. Water Levels Puzzle Challenge (FIXED)
 */
export function createWaterLevelsPuzzle(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  const containerCount = params.containerCount || 5;

  // 1. Generate random water levels
  const levels = Array.from({ length: containerCount }, () => 
    randomInt(10, 95) // 10% to 95% full
  );

  // 2. The Correct Answer is simply the levels sorted low to high
  const correctOrder = [...levels].sort((a, b) => a - b);

  // 3. Current State: Shuffle the levels for the player to fix
  let currentLevels = shuffleArray([...levels]);
  
  // Ensure it doesn't accidentally start solved
  while (JSON.stringify(currentLevels) === JSON.stringify(correctOrder)) {
    currentLevels = shuffleArray([...levels]);
  }

  // Styles for this specific game
  const waterStyles = `
    <style>
      .water-puzzle { text-align: center; padding: 20px; }
      .containers-row { 
        display: flex; 
        justify-content: center; 
        align-items: flex-end; 
        gap: 15px; 
        min-height: 200px;
        margin-bottom: 20px;
      }
      .water-container {
        width: 60px;
        height: 150px;
        border: 2px solid #555;
        border-radius: 0 0 10px 10px; /* Beaker shape */
        border-top: none;
        position: relative;
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s;
        overflow: hidden; /* Keep water inside rounded corners */
      }
      .water-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      /* Visual feedback for selection */
      .container-selected {
        border-color: #f1c40f; /* Yellow highlight */
        box-shadow: 0 0 15px #f1c40f;
        transform: scale(1.05);
      }
      .water-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #3498db; /* Water Blue */
        transition: height 0.5s ease-in-out;
        opacity: 0.8;
      }
      .water-label {
        position: absolute;
        bottom: -25px;
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: #888;
      }
      .puzzle-status { font-weight: bold; margin-bottom: 10px; color: #aaa; }
    </style>
  `;

  return {
    id: 'water-levels',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Sort Water: Low to High',
    correctAnswer: correctOrder,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${waterStyles}
        <div class="water-puzzle">
          <p class="puzzle-status" id="status-text">Select a container...</p>
          <div class="containers-row" id="containers">
            ${this.renderContainers(currentLevels)}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary">Check Order</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },

    renderContainers(levels) {
      return levels.map((level, index) => `
        <div class="water-container" data-index="${index}">
          <div class="water-fill" style="height: ${level}%"></div>
          <div class="water-label">${level}%</div> 
        </div>
      `).join('');
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const containerRow = contentContainer.querySelector('#containers');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const statusText = contentContainer.querySelector('#status-text');
      
      let selectedIndex = null;
      
      // Event Delegation for clicks
      containerRow.addEventListener('click', (e) => {
        const target = e.target.closest('.water-container');
        if (!target) return;

        const clickedIndex = parseInt(target.dataset.index);

        if (selectedIndex === null) {
          // SELECT FIRST ITEM
          selectedIndex = clickedIndex;
          target.classList.add('container-selected');
          statusText.textContent = `Selected: ${currentLevels[clickedIndex]}%. Now click another to swap.`;
        } else if (selectedIndex === clickedIndex) {
          // DESELECT (Clicked same one)
          target.classList.remove('container-selected');
          selectedIndex = null;
          statusText.textContent = 'Select a container...';
        } else {
          // SWAP ACTION
          const prevSelected = containerRow.querySelector(`.water-container[data-index="${selectedIndex}"]`);
          if (prevSelected) prevSelected.classList.remove('container-selected');
          
          // Perform Swap in logic
          [currentLevels[selectedIndex], currentLevels[clickedIndex]] = 
          [currentLevels[clickedIndex], currentLevels[selectedIndex]];
          
          // Re-render immediately to show swap
          containerRow.innerHTML = this.renderContainers(currentLevels);
          
          selectedIndex = null;
          statusText.textContent = 'Swapped! Arrange Low to High.';
        }
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentLevels } 
        }));
      });
    },
    
    check(answer) {
      // Simple array comparison of values
      return JSON.stringify(answer) === JSON.stringify(this.correctAnswer);
    },
    
    cleanup() {}
  };
}

/**
 * 17. Shape Rotation Fit Challenge (FIXED & UPGRADED)
 */
export function createShapeRotationChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  // Difficulty Scaling
  // Level 1-2: 3x3 Grid, simple shapes
  // Level 3+: 4x4 Grid, complex scattered shapes
  const gridSize = difficulty > 2 ? 4 : 3;
  
  // 1. Generate a Random Matrix Shape
  // We create a grid where 1 = filled, 2 = anchor (colored), 0 = empty
  const totalCells = gridSize * gridSize;
  const cellsToFill = Math.floor(totalCells * 0.6); // Fill ~60% of the grid
  
  let grid = Array(totalCells).fill(0);
  
  // Fill random spots
  let filledCount = 0;
  while (filledCount < cellsToFill) {
    const idx = randomInt(0, totalCells - 1);
    if (grid[idx] === 0) {
      grid[idx] = 1;
      filledCount++;
    }
  }
  
  // Set one random filled spot as the "Anchor" (Red block)
  // This ensures the shape has a distinct "up" direction, solving symmetry bugs.
  const filledIndices = grid.map((val, idx) => val === 1 ? idx : -1).filter(i => i !== -1);
  const anchorIndex = randomChoice(filledIndices);
  grid[anchorIndex] = 2;

  // 2. Set Rotations
  const targetRotation = randomInt(0, 3) * 90; // 0, 90, 180, 270
  
  // Ensure player starts at a different rotation
  let startRotation = randomInt(0, 3) * 90;
  while (normalizeAngle(startRotation) === normalizeAngle(targetRotation)) {
    startRotation = randomInt(0, 3) * 90;
  }
  
  let currentRotation = startRotation;

  // CSS for the matrix grid
  const shapeStyles = `
    <style>
      .rotation-challenge {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
        padding: 20px;
      }
      .shape-container {
        text-align: center;
      }
      .label-text {
        font-size: 1.1rem;
        margin-bottom: 5px;
        color: #7f8c8d;
        font-weight: bold;
      }
      .matrix-grid {
        display: grid;
        grid-template-columns: repeat(${gridSize}, 1fr);
        grid-template-rows: repeat(${gridSize}, 1fr);
        gap: 2px;
        width: ${gridSize * 30}px;
        height: ${gridSize * 30}px;
        padding: 5px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .matrix-cell {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      /* Cell Types */
      .cell-empty { background: transparent; }
      .cell-fill { background: #3498db; box-shadow: inset 0 0 0 2px rgba(0,0,0,0.1); } /* Blue */
      .cell-anchor { background: #e74c3c; box-shadow: inset 0 0 0 2px rgba(0,0,0,0.1); } /* Red */

      /* Target is semi-transparent and greyed out slightly to look like a "blueprint" */
      .target-grid .cell-fill { background: #7f8c8d; opacity: 0.8; }
      .target-grid .cell-anchor { background: #c0392b; opacity: 0.8; }

      .controls-area {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 25px;
      }
    </style>
  `;

  return {
    id: 'shape-rotation',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Align the Blueprint',
    correctAnswer: targetRotation,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${shapeStyles}
        <div class="rotation-challenge">
          
          <div class="shape-container">
            <div class="label-text">Match This</div>
            <div class="matrix-grid target-grid" style="transform: rotate(${targetRotation}deg);">
              ${this.renderGridCells(grid)}
            </div>
          </div>

          <div style="font-size: 2rem; color: #ccc;">➔</div>

          <div class="shape-container">
            <div class="label-text">Your Shape</div>
            <div class="matrix-grid active-grid" id="player-shape" style="transform: rotate(${currentRotation}deg);">
              ${this.renderGridCells(grid)}
            </div>
          </div>

        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="controls-area">
          <button id="rotate-left" class="btn btn-secondary" style="min-width: 60px;">↺ Left</button>
          <button id="submit-btn" class="btn btn-primary" style="min-width: 100px;">Submit</button>
          <button id="rotate-right" class="btn btn-secondary" style="min-width: 60px;">Right ↻</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    renderGridCells(gridData) {
      return gridData.map(val => {
        let className = 'cell-empty';
        if (val === 1) className = 'cell-fill';
        if (val === 2) className = 'cell-anchor';
        return `<div class="matrix-cell ${className}"></div>`;
      }).join('');
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const playerShape = contentContainer.querySelector('#player-shape');
      const rotateLeft = answerContainer.querySelector('#rotate-left');
      const rotateRight = answerContainer.querySelector('#rotate-right');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      const updateVisuals = () => {
        playerShape.style.transform = `rotate(${currentRotation}deg)`;
      };
      
      rotateLeft.addEventListener('click', () => {
        currentRotation -= 90;
        updateVisuals();
      });
      
      rotateRight.addEventListener('click', () => {
        currentRotation += 90;
        updateVisuals();
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentRotation } 
        }));
      });
      
      // Keyboard support for fun
      const keyHandler = (e) => {
        if (e.key === 'ArrowLeft') { currentRotation -= 90; updateVisuals(); }
        if (e.key === 'ArrowRight') { currentRotation += 90; updateVisuals(); }
      };
      document.addEventListener('keydown', keyHandler);
      this._cleanupKey = keyHandler; // Store for cleanup
    },
    
    check(answer) {
      const normAnswer = normalizeAngle(answer);
      const normTarget = normalizeAngle(this.correctAnswer);
      return normAnswer === normTarget;
    },
    
    cleanup() {
      if (this._cleanupKey) {
        document.removeEventListener('keydown', this._cleanupKey);
      }
    }
  };
}

/**
 * Helper: Normalizes any degree to 0, 90, 180, 270
 * Handles negative numbers (-90 -> 270) and overflow (450 -> 90)
 */
function normalizeAngle(degrees) {
  // The % 360 gives remainder, but can be negative in JS (-90 % 360 = -90).
  // We add 360 and % 360 again to ensure positive result.
  return ((degrees % 360) + 360) % 360;
}

/**
 * 18. Word Unscramble Challenge (pass)
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
 * 19. Cube Counting Challenge (Mobile Optimized: Touch + Pinch + Rotate + Pan)
 */
export function createCubeCountingChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  // Mobile Scaling: Reduce grid size slightly for very small screens if needed
  const gridSize = difficulty < 3 ? 3 : (difficulty < 6 ? 4 : 5);
  const maxHeight = difficulty < 3 ? 3 : (difficulty < 6 ? 4 : 5);
  
  // Game Mode Logic
  const isColorMode = difficulty > 2 && Math.random() > 0.5;
  const targetColor = 'red'; 
  
  // Generate Cubes
  let cubes = [];
  let totalCount = 0;
  let colorCount = 0;
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const height = randomInt(1, maxHeight);
      for (let z = 0; z < height; z++) {
        const isRed = Math.random() > 0.8;
        const color = isColorMode && isRed ? 'red' : 'blue';
        
        cubes.push({ x, y, z, color });
        
        totalCount++;
        if (color === targetColor) colorCount++;
      }
    }
  }

  if (isColorMode && colorCount === 0) {
    cubes[0].color = targetColor;
    colorCount = 1;
  }

  const correctAnswer = isColorMode ? colorCount : totalCount;
  const missionTitle = isColorMode 
    ? `Count <span style="color:#ff6b6b; font-weight:800;">RED</span> Cubes` 
    : "Count <span style='font-weight:800;'>ALL</span> Cubes";

  const styles = `
    <style>
      .cube-game-wrapper {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        padding: 15px;
        box-sizing: border-box;
      }

      .scene-viewport {
        width: 100%;
        height: 320px;
        position: relative;
        perspective: 1200px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        background: radial-gradient(circle, #ffffff 0%, #e9ecef 100%);
        touch-action: none;
        cursor: grab;
      }
      
      .scene-viewport:active {
        cursor: grabbing;
      }

      .cube-grid {
        position: relative;
        transform-style: preserve-3d;
        transform: 
          translate(var(--pan-x, 0px), var(--pan-y, 0px))
          scale(var(--scale, 1)) 
          rotateX(var(--rot-x, -25deg)) 
          rotateY(var(--rot-y, 45deg));
        transition: transform 0.05s linear;
      }

      .cube {
        position: absolute;
        width: 30px;
        height: 30px;
        transform-style: preserve-3d;
        transform: 
          translateX(calc(var(--x) * var(--gap, 30px)))
          translateY(calc(var(--z) * -1 * var(--gap, 30px)))
          translateZ(calc(var(--y) * var(--gap, 30px)));
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .face {
        position: absolute;
        width: 30px;
        height: 30px;
        border: 1px solid rgba(0,0,0,0.1);
        box-sizing: border-box;
        backface-visibility: hidden;
      }
      .face-front  { transform: rotateY(  0deg) translateZ(15px); }
      .face-back   { transform: rotateY(180deg) translateZ(15px); }
      .face-right  { transform: rotateY( 90deg) translateZ(15px); filter: brightness(0.85); }
      .face-left   { transform: rotateY(-90deg) translateZ(15px); filter: brightness(0.85); }
      .face-top    { transform: rotateX( 90deg) translateZ(15px); filter: brightness(1.15); }
      .face-bottom { transform: rotateX(-90deg) translateZ(15px); filter: brightness(0.5); }

      .c-blue .face { background: #4dabf7; }
      .c-red .face { background: #ff6b6b; }

      .controls-panel {
        width: 100%;
        margin-top: 15px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      .control-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.75rem;
        font-weight: bold;
        color: #868e96;
        text-transform: uppercase;
      }

      input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;
        margin-top: 5px;
      }
      
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background: #339af0;
        cursor: pointer;
        margin-top: -10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        cursor: pointer;
        background: #dee2e6;
        border-radius: 2px;
      }
      
      input[type=range]::-moz-range-thumb {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background: #339af0;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      
      input[type=range]::-moz-range-track {
        width: 100%;
        height: 4px;
        cursor: pointer;
        background: #dee2e6;
        border-radius: 2px;
      }

      .touch-hint {
        font-size: 0.7rem;
        color: #868e96;
        text-align: center;
        margin-top: 8px;
        font-style: italic;
      }

      .answer-section {
        margin-top: 15px;
        display: flex;
        gap: 10px;
        width: 100%;
      }
      .answer-section input {
        flex: 1;
        text-align: center;
        font-size: 1.2rem;
      }
      .answer-section button {
        flex: 1;
      }
      
      .reset-btn {
        background: #868e96;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        margin-top: 8px;
        width: 100%;
      }
      .reset-btn:active {
        background: #495057;
      }
    </style>
  `;

  return {
    id: 'cube-counting',
    category: 'puzzle',
    difficulty: difficulty,
    title: isColorMode ? 'Color Count' : 'Cube Count',
    correctAnswer: correctAnswer,
    touchState: null,
    
    render(contentContainer, answerContainer) {
      const offset = (gridSize * 30) / 2;
      
      contentContainer.innerHTML = `
        ${styles}
        <div class="cube-game-wrapper">
          <div style="font-size: 1rem; margin-bottom: 10px;">${missionTitle}</div>
          
          <div class="scene-viewport" id="viewport">
            <div class="cube-grid" id="grid-scene" 
                 style="--x-off: -${offset}px; --y-off: ${offset}px; margin-left: -${offset}px; margin-top: ${offset}px;">
              ${cubes.map(c => `
                <div class="cube c-${c.color}" style="--x: ${c.x}; --y: ${c.y}; --z: ${c.z};">
                  <div class="face face-front"></div>
                  <div class="face face-back"></div>
                  <div class="face face-right"></div>
                  <div class="face face-left"></div>
                  <div class="face face-top"></div>
                  <div class="face face-bottom"></div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="touch-hint">
            👆 Drag to rotate • 🤏 Pinch to zoom • Two fingers to pan
          </div>

          <div class="controls-panel">
            <div class="control-group">
              <label>Rotate</label>
              <input type="range" id="slider-rotate" min="0" max="360" value="45">
            </div>
            <div class="control-group">
              <label>Explode</label>
              <input type="range" id="slider-explode" min="30" max="80" value="30">
            </div>
            <div class="control-group">
              <label>Zoom</label>
              <input type="range" id="slider-zoom" min="0.5" max="2" step="0.1" value="1.0">
            </div>
          </div>
          
          <button class="reset-btn" id="reset-view">Reset View</button>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="answer-section">
          <input type="number" id="answer-input" class="answer-input" placeholder="?" inputmode="numeric" pattern="[0-9]*">
          <button id="submit-btn" class="btn btn-primary">Check</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const grid = contentContainer.querySelector('#grid-scene');
      const viewport = contentContainer.querySelector('#viewport');
      
      const sRotate = contentContainer.querySelector('#slider-rotate');
      const sExplode = contentContainer.querySelector('#slider-explode');
      const sZoom = contentContainer.querySelector('#slider-zoom');
      const resetBtn = contentContainer.querySelector('#reset-view');
      
      // State
      let rotX = -25;
      let rotY = 45;
      let scale = 1.0;
      let gap = 30;
      let panX = 0;
      let panY = 0;
      
      // Touch state
      this.touchState = {
        touches: [],
        lastDistance: 0,
        lastAngle: 0,
        lastX: 0,
        lastY: 0,
        isDragging: false
      };
      
      // Update view
      const updateView = () => {
        grid.style.setProperty('--rot-x', `${rotX}deg`);
        grid.style.setProperty('--rot-y', `${rotY}deg`);
        grid.style.setProperty('--gap', `${gap}px`);
        grid.style.setProperty('--scale', scale);
        grid.style.setProperty('--pan-x', `${panX}px`);
        grid.style.setProperty('--pan-y', `${panY}px`);
        
        // Sync sliders
        sRotate.value = rotY;
        sZoom.value = scale;
        sExplode.value = gap;
      };
      
      // Slider listeners
      sRotate.addEventListener('input', (e) => {
        rotY = parseFloat(e.target.value);
        updateView();
      });
      
      sExplode.addEventListener('input', (e) => {
        gap = parseFloat(e.target.value);
        updateView();
      });
      
      sZoom.addEventListener('input', (e) => {
        scale = parseFloat(e.target.value);
        updateView();
      });
      
      // Reset button
      resetBtn.addEventListener('click', () => {
        rotX = -25;
        rotY = 45;
        scale = 1.0;
        gap = 30;
        panX = 0;
        panY = 0;
        updateView();
      });
      
      // Helper: Get distance between two touches
      const getDistance = (t1, t2) => {
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };
      
      // Helper: Get angle between two touches
      const getAngle = (t1, t2) => {
        return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
      };
      
      // Helper: Get center point of two touches
      const getCenter = (t1, t2) => {
        return {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      };
      
      // Touch Start
      viewport.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchState.touches = Array.from(e.touches);
        
        if (e.touches.length === 2) {
          // Two finger gesture - prepare for pinch/pan
          this.touchState.lastDistance = getDistance(e.touches[0], e.touches[1]);
          this.touchState.lastAngle = getAngle(e.touches[0], e.touches[1]);
          const center = getCenter(e.touches[0], e.touches[1]);
          this.touchState.lastX = center.x;
          this.touchState.lastY = center.y;
        } else if (e.touches.length === 1) {
          // Single finger - prepare for rotation
          this.touchState.isDragging = true;
          this.touchState.lastX = e.touches[0].clientX;
          this.touchState.lastY = e.touches[0].clientY;
        }
      });
      
      // Touch Move
      viewport.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 2) {
          // Two finger gestures
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          const currentAngle = getAngle(e.touches[0], e.touches[1]);
          const center = getCenter(e.touches[0], e.touches[1]);
          
          // PINCH TO ZOOM
          if (this.touchState.lastDistance > 0) {
            const scaleChange = currentDistance / this.touchState.lastDistance;
            scale *= scaleChange;
            scale = Math.max(0.5, Math.min(2, scale)); // Clamp
          }
          
          // TWO FINGER PAN
          const dx = center.x - this.touchState.lastX;
          const dy = center.y - this.touchState.lastY;
          panX += dx;
          panY += dy;
          
          this.touchState.lastDistance = currentDistance;
          this.touchState.lastAngle = currentAngle;
          this.touchState.lastX = center.x;
          this.touchState.lastY = center.y;
          
          updateView();
          
        } else if (e.touches.length === 1 && this.touchState.isDragging) {
          // Single finger rotation
          const dx = e.touches[0].clientX - this.touchState.lastX;
          const dy = e.touches[0].clientY - this.touchState.lastY;
          
          rotY += dx * 0.5;
          rotX += dy * 0.5;
          
          // Clamp rotX to prevent flipping too much
          rotX = Math.max(-80, Math.min(10, rotX));
          
          this.touchState.lastX = e.touches[0].clientX;
          this.touchState.lastY = e.touches[0].clientY;
          
          updateView();
        }
      });
      
      // Touch End
      viewport.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          this.touchState.isDragging = false;
          this.touchState.lastDistance = 0;
        }
      });
      
      // Mouse support (for desktop testing)
      let mouseDown = false;
      let lastMouseX = 0;
      let lastMouseY = 0;
      
      viewport.addEventListener('mousedown', (e) => {
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      });
      
      viewport.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        
        rotY += dx * 0.5;
        rotX += dy * 0.5;
        rotX = Math.max(-80, Math.min(10, rotX));
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        updateView();
      });
      
      viewport.addEventListener('mouseup', () => {
        mouseDown = false;
      });
      
      viewport.addEventListener('mouseleave', () => {
        mouseDown = false;
      });
      
      // Mouse wheel zoom
      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.001;
        scale = Math.max(0.5, Math.min(2, scale));
        updateView();
      }, { passive: false });
      
      // Init
      updateView();
      
      // Answer submission
      const input = answerContainer.querySelector('#answer-input');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      const submit = () => {
        if (!input.value) return;
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: parseInt(input.value) } 
        }));
      };
      
      submitBtn.addEventListener('click', submit);
      input.addEventListener('keypress', (e) => { 
        if(e.key === 'Enter') submit(); 
      });
    },
    
    check(answer) {
      return validateNumber(answer, this.correctAnswer);
    },
    
    cleanup() {
      this.touchState = null;
    }
  };
}

/**
 * 20. Jewel Cluster Challenge (Fixed: Click-to-Select)
 */
export function createSameGameChallenge(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  
  // Difficulty Settings
  const gridSize = difficulty < 3 ? 6 : (difficulty < 6 ? 8 : 10);
  const colorCount = difficulty < 3 ? 3 : (difficulty < 6 ? 4 : 5);
  
  const jewelColors = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'];
  const activeColors = jewelColors.slice(0, colorCount);
  
  // Generate Grid
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => activeColors[Math.floor(Math.random() * activeColors.length)])
  );
  
  // Calculate Solution
  const targetCluster = findLargestCluster(grid);
  const targetSize = targetCluster.length;
  
  // Track user selection
  let currentSelectedSize = 0;

  // CSS Styles
  const styles = `
    <style>
      .jewel-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }
      .game-status {
        font-size: 1.1rem;
        font-weight: bold;
        color: #555;
        min-height: 24px;
        transition: color 0.3s;
      }
      .jewel-grid {
        display: grid;
        grid-template-columns: repeat(${gridSize}, 1fr);
        gap: 4px;
        background: #2c3e50;
        padding: 8px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        /* Prevent accidental highlighting of text */
        user-select: none; 
      }
      .jewel {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 25%;
        cursor: pointer;
        transition: all 0.2s ease-out;
        position: relative;
        box-shadow: inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.2);
        border: 2px solid transparent; /* Reserve space for border */
      }
      
      /* Colors */
      .jewel-ruby { background: linear-gradient(135deg, #ff6b6b, #c0392b); }
      .jewel-sapphire { background: linear-gradient(135deg, #4dabf7, #2980b9); }
      .jewel-emerald { background: linear-gradient(135deg, #51cf66, #27ae60); }
      .jewel-topaz { background: linear-gradient(135deg, #fcc419, #f39c12); }
      .jewel-amethyst { background: linear-gradient(135deg, #cc5de8, #8e44ad); }

      /* Selected State */
      .jewel.selected {
        transform: scale(1.1);
        z-index: 2;
        box-shadow: 0 0 15px rgba(255,255,255,0.6);
        border-color: white;
      }
      
      /* Dimmed State (when something else is selected) */
      .grid-has-selection .jewel:not(.selected) {
        opacity: 0.4;
        transform: scale(0.9);
        filter: grayscale(0.6);
      }
      
      /* Hover hint (subtle) */
      .jewel:hover {
        filter: brightness(1.2);
      }
    </style>
  `;

  return {
    id: 'same-game',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Find the Largest Cluster',
    correctAnswer: targetSize,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${styles}
        <div class="jewel-game">
          <div class="game-status" id="status-text">Select a group...</div>
          
          <div class="jewel-grid" id="grid-container" style="width: ${gridSize * 40}px; max-width: 100%;">
            ${grid.map((row, i) => 
              row.map((color, j) => `
                <div class="jewel jewel-${color}" data-row="${i}" data-col="${j}"></div>
              `).join('')
            ).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: center;">
          <button id="reset-btn" class="btn btn-secondary">Clear</button>
          <button id="submit-btn" class="btn btn-primary" disabled>Submit Selection</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const gridContainer = contentContainer.querySelector('#grid-container');
      const jewels = contentContainer.querySelectorAll('.jewel');
      const statusText = contentContainer.querySelector('#status-text');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const resetBtn = answerContainer.querySelector('#reset-btn');

      // Click Handler for Jewels
      jewels.forEach((jewel) => {
        jewel.addEventListener('click', () => {
          const r = parseInt(jewel.dataset.row);
          const c = parseInt(jewel.dataset.col);
          const color = grid[r][c];
          
          // 1. Calculate Cluster
          const cluster = getCluster(grid, r, c, color);
          currentSelectedSize = cluster.length;
          
          // 2. Update Visuals
          // Remove old selection
          jewels.forEach(j => j.classList.remove('selected'));
          gridContainer.classList.add('grid-has-selection');
          
          // Add new selection
          cluster.forEach(pos => {
            const el = gridContainer.querySelector(`.jewel[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (el) el.classList.add('selected');
          });
          
          // 3. Update Text & Button
          statusText.textContent = `Selected Group Size: ${currentSelectedSize}`;
          statusText.style.color = "#2c3e50";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit (" + currentSelectedSize + ")";
        });
      });

      // Reset Button
      resetBtn.addEventListener('click', () => {
        jewels.forEach(j => j.classList.remove('selected'));
        gridContainer.classList.remove('grid-has-selection');
        statusText.textContent = "Select a group...";
        currentSelectedSize = 0;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submit Selection";
      });

      // Submit Button
      submitBtn.addEventListener('click', () => {
        if (currentSelectedSize === 0) return;
        
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: currentSelectedSize } 
        }));
      });
    },
    
    check(answer) {
      // Logic: The answer is correct if it equals the largest possible cluster size
      return validateNumber(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

// --- Recursive Logic (Standard) ---

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

// corrected
registerChallenge('number-selection', 'puzzle', createNumberSelectionChallenge, {
  name: 'Number Hunt',
  description: 'Tap all numbers that match the rule',
  minDifficulty: 1,
  baseTime: 60
});

// corrected
registerChallenge('tile-shuffle', 'puzzle', createTileShufflePuzzle, {
  name: 'Tile Puzzle',
  description: 'Arrange tiles in order',
  minDifficulty: 3,
  baseTime: 90
});

// corrected
registerChallenge('cup-shuffle', 'puzzle', createCupShuffleChallenge, {
  name: 'Cup Shuffle',
  description: 'Track the ball',
  minDifficulty: 1,
  baseTime: 45
});

// corrected
registerChallenge('water-levels', 'puzzle', createWaterLevelsPuzzle, {
  name: 'Water Levels',
  description: 'Sort containers by level',
  minDifficulty: 2,
  baseTime: 45
});

// corrected
registerChallenge('shape-rotation', 'puzzle', createShapeRotationChallenge, {
  name: 'Shape Rotation',
  description: 'Rotate shape to match',
  minDifficulty: 2,
  baseTime: 35
});

// corrected
registerChallenge('word-unscramble', 'puzzle', createWordUnscrambleChallenge, {
  name: 'Word Unscramble',
  description: 'Unscramble letters',
  minDifficulty: 1,
  baseTime: 60
});

// corrected
registerChallenge('cube-counting', 'puzzle', createCubeCountingChallenge, {
  name: 'Cube Counting',
  description: 'Count cubes in stack',
  minDifficulty: 4,
  baseTime: 65
});

// corrected
registerChallenge('same-game', 'puzzle', createSameGameChallenge, {
  name: 'Color Cluster',
  description: 'Find largest color group',
  minDifficulty: 3,
  baseTime: 45
});