/**
 * Memory Challenges
 * 10. Color Sequence Memory
 * 11. Shape Grid Memory
 * 12. Pattern Matching (Find Sets)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, generateColors, shuffleArray } from '../utils/random.js';
import { validateArray } from '../utils/validators.js';

/**
 * 10. Color Sequence Memory Challenge
 */
export function createColorSequenceChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  const sequenceLength = params.sequenceLength;
  const colors = generateColors(6);
  const sequence = Array.from({ length: sequenceLength }, () => 
    colors[randomInt(0, colors.length - 1)]
  );
  
  let playerSequence = [];
  let isShowingSequence = true;
  
  return {
    id: 'color-sequence',
    category: 'memory',
    difficulty: difficulty,
    title: 'Memorize the Sequence',
    correctAnswer: sequence,
    
    async render(contentContainer, answerContainer) {
      // Show sequence first
      contentContainer.innerHTML = `
        <div class="memory-sequence">
          <p class="memory-instruction">Watch the sequence...</p>
          <div class="sequence-display" id="sequence-display"></div>
        </div>
      `;
      
      answerContainer.innerHTML = '';
      
      await this.showSequence(contentContainer);
      
      // Then show input
      contentContainer.innerHTML = `
        <div class="memory-sequence">
          <p class="memory-instruction">Repeat the sequence</p>
          <div class="player-sequence" id="player-sequence"></div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="color-buttons" id="color-buttons">
          ${colors.map((color, index) => `
            <button class="color-btn" data-color="${color}" data-index="${index}" 
                    style="background-color: ${color};"></button>
          `).join('')}
        </div>
        <button id="submit-btn" class="btn btn-primary" style="margin-top: 20px;">Submit</button>
      `;
      
      isShowingSequence = false;
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    async showSequence(contentContainer) {
      const display = contentContainer.querySelector('#sequence-display');
      const flashSpeed = getDifficultyParams('memory', difficulty).flashSpeed;
      
      for (let i = 0; i < sequence.length; i++) {
        const colorBox = document.createElement('div');
        colorBox.className = 'sequence-item-flash';
        colorBox.style.backgroundColor = sequence[i];
        display.appendChild(colorBox);
        
        await new Promise(resolve => setTimeout(resolve, flashSpeed));
        colorBox.classList.add('flash-active');
        
        await new Promise(resolve => setTimeout(resolve, flashSpeed));
        colorBox.classList.remove('flash-active');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const colorButtons = answerContainer.querySelectorAll('.color-btn');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const playerDisplay = contentContainer.querySelector('#player-sequence');
      
      playerSequence = [];
      
      colorButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const color = btn.dataset.color;
          playerSequence.push(color);
          
          const colorBox = document.createElement('div');
          colorBox.className = 'sequence-item-player';
          colorBox.style.backgroundColor = color;
          playerDisplay.appendChild(colorBox);
        });
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: playerSequence } 
        }));
      });
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {
      playerSequence = [];
      isShowingSequence = false;
    }
  };
}

/**
 * 11. Shape Grid Memory Challenge
 */
export function createShapeGridChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  const rows = params.gridRows;
  const cols = params.gridCols;
  const activeCells = Math.min(params.activeCells, rows * cols - 1);
  
  // Generate random active positions
  const totalCells = rows * cols;
  const activePositions = new Set();
  
  while (activePositions.size < activeCells) {
    activePositions.add(randomInt(0, totalCells - 1));
  }
  
  const correctPattern = Array.from(activePositions).sort((a, b) => a - b);
  let playerPattern = [];
  
  return {
    id: 'shape-grid',
    category: 'memory',
    difficulty: difficulty,
    title: 'Memorize the Pattern',
    correctAnswer: correctPattern,
    
    async render(contentContainer, answerContainer) {
      // Show pattern first
      contentContainer.innerHTML = `
        <div class="grid-memory">
          <p class="memory-instruction">Memorize the pattern...</p>
          <div class="memory-grid" id="memory-grid" style="
            grid-template-columns: repeat(${cols}, 1fr);
            grid-template-rows: repeat(${rows}, 1fr);
          ">
            ${Array.from({ length: totalCells }, (_, i) => `
              <div class="grid-memory-cell ${activePositions.has(i) ? 'cell-active' : ''}" 
                   data-index="${i}"></div>
            `).join('')}
          </div>
        </div>
      `;
      
      await new Promise(resolve => setTimeout(resolve, 3000 + (difficulty * 200)));
      
      // Then show input grid
      contentContainer.innerHTML = `
        <div class="grid-memory">
          <p class="memory-instruction">Click to recreate the pattern</p>
          <div class="memory-grid" id="memory-grid-input" style="
            grid-template-columns: repeat(${cols}, 1fr);
            grid-template-rows: repeat(${rows}, 1fr);
          ">
            ${Array.from({ length: totalCells }, (_, i) => `
              <div class="grid-memory-cell grid-memory-input" data-index="${i}"></div>
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
      const cells = contentContainer.querySelectorAll('.grid-memory-input');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const clearBtn = answerContainer.querySelector('#clear-btn');
      
      playerPattern = [];
      
      cells.forEach((cell) => {
        cell.addEventListener('click', () => {
          const index = parseInt(cell.dataset.index);
          
          if (cell.classList.contains('cell-active')) {
            cell.classList.remove('cell-active');
            playerPattern = playerPattern.filter(i => i !== index);
          } else {
            cell.classList.add('cell-active');
            playerPattern.push(index);
          }
        });
      });
      
      clearBtn.addEventListener('click', () => {
        cells.forEach(cell => cell.classList.remove('cell-active'));
        playerPattern = [];
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: playerPattern.sort((a, b) => a - b) } 
        }));
      });
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {
      playerPattern = [];
    }
  };
}

/**
 * 12. Pattern Matching (Find Sets) Challenge
 */
export function createPatternMatchingChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  const uniqueItems = params.uniqueItems;
  const totalItems = params.totalItems;
  const matchesToFind = params.matchesToFind;
  
  // Generate items with duplicates
  const shapes = ['●', '■', '▲', '◆', '★', '♦', '♥', '♠', '♣', '✦'];
  const colors = generateColors(uniqueItems);
  
  const items = [];
  const matchGroups = [];
  
  // Create groups of matching items
  for (let i = 0; i < matchesToFind; i++) {
    const shape = shapes[i % shapes.length];
    const color = colors[i % colors.length];
    const count = 3;
    
    const group = [];
    for (let j = 0; j < count; j++) {
      const itemId = items.length;
      items.push({ id: itemId, shape, color, group: i });
      group.push(itemId);
    }
    matchGroups.push(group);
  }
  
  // Fill remaining slots with unique items
  while (items.length < totalItems) {
    items.push({
      id: items.length,
      shape: shapes[randomInt(0, shapes.length - 1)],
      color: colors[randomInt(0, colors.length - 1)],
      group: -1
    });
  }
  
  const shuffledItems = shuffleArray(items);
  const correctAnswer = matchGroups[0]; // First group to find
  
  let selectedItems = [];
  
  return {
    id: 'pattern-matching',
    category: 'memory',
    difficulty: difficulty,
    title: `Find ${matchesToFind} Identical Items`,
    correctAnswer: correctAnswer.sort((a, b) => a - b),
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="pattern-matching">
          <p class="memory-instruction">Find 3 items that match exactly</p>
          <div class="matching-grid">
            ${shuffledItems.map(item => `
              <div class="matching-item" data-id="${item.id}" 
                   style="color: ${item.color};">
                ${item.shape}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const items = contentContainer.querySelectorAll('.matching-item');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      selectedItems = [];
      
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const id = parseInt(item.dataset.id);
          
          if (item.classList.contains('item-selected')) {
            item.classList.remove('item-selected');
            selectedItems = selectedItems.filter(i => i !== id);
          } else {
            if (selectedItems.length < 3) {
              item.classList.add('item-selected');
              selectedItems.push(id);
            }
          }
        });
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
 * Register all memory challenges
 */
import { registerChallenge } from './registry.js';

registerChallenge('color-sequence', 'memory', createColorSequenceChallenge, {
  name: 'Color Sequence',
  description: 'Memorize color sequence',
  minDifficulty: 1
});

registerChallenge('shape-grid', 'memory', createShapeGridChallenge, {
  name: 'Shape Grid',
  description: 'Memorize grid pattern',
  minDifficulty: 2
});

registerChallenge('pattern-matching', 'memory', createPatternMatchingChallenge, {
  name: 'Pattern Matching',
  description: 'Find matching items',
  minDifficulty: 1
});