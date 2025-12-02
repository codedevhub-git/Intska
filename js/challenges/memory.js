/**
 * Memory Challenges
 * 10. Color Sequence Memory
 * 11. Shape Grid Memory
 * 12. Pattern Matching (Find Sets)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, generateColors, shuffleArray } from '../utils/random.js';
import { validateArray } from '../utils/validators.js';
import { registerChallenge } from './registry.js';

// Helper function for array comparison (needed for the fix in Pattern Matching)
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    // Sort arrays before comparing elements if order does not matter
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
}


/**
 * 10. Color Sequence Memory Challenge (Hardcore Cyber Version)
 * FIXED: No Replay Button + Numeric Counter for high levels
 */
export function createColorSequenceChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  // Difficulty Logic:
  // Cap length at 20 (human limit is usually 7-9, so 20 is insane)
  // At Level 99, it just gets faster, not infinitely longer.
  const rawLength = params.sequenceLength || 5;
  const sequenceLength = Math.min(rawLength, 20); 
  
  const buttonCount = difficulty < 3 ? 4 : 6;
  // Speed increases with difficulty (lower number = faster)
  // Cap speed at 200ms (super fast) so it doesn't become a blur
  const baseSpeed = 1000 - (difficulty * 50);
  const playbackSpeed = Math.max(200, baseSpeed);
  
  const neonPalette = [
    { color: '#FF0055', name: 'red' },
    { color: '#00E5FF', name: 'cyan' },
    { color: '#00FF99', name: 'green' },
    { color: '#FFD500', name: 'yellow' },
    { color: '#7000FF', name: 'purple' },
    { color: '#FF5500', name: 'orange' }
  ];
  
  const activeColors = neonPalette.slice(0, buttonCount);
  
  // Generate sequence
  const sequenceIndices = Array.from({ length: sequenceLength }, () => 
    randomInt(0, buttonCount - 1)
  );
  
  const correctAnswer = sequenceIndices.map(i => activeColors[i].name);
  
  let playerInput = [];
  let isInputLocked = true;

  const styles = `
    <style>
      .cyber-memory {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }
      
      /* Digital Counter instead of Dots */
      .cyber-counter {
        font-family: 'Courier New', monospace;
        background: #111;
        border: 1px solid #333;
        color: #00E5FF;
        padding: 5px 15px;
        border-radius: 4px;
        font-size: 1.2rem;
        letter-spacing: 2px;
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
        margin-bottom: 10px;
      }
      .cyber-counter span { color: #555; } /* Divider color */
      
      .pad-grid {
        display: grid;
        grid-template-columns: repeat(${buttonCount === 4 ? 2 : 3}, 1fr);
        gap: 15px;
        padding: 15px;
        background: #1a1a2e;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 2px #333;
      }
      
      .neon-pad {
        width: 70px; /* Slightly smaller to fit mobile better */
        height: 70px;
        border-radius: 12px;
        cursor: pointer;
        background: rgba(255,255,255,0.05);
        transition: all 0.1s ease-out;
        position: relative;
        border: 2px solid transparent;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Active/Glow State */
      .neon-pad.active {
        transform: scale(0.92);
        filter: brightness(1.5);
      }
      
      /* Color Definitions */
      ${activeColors.map((c, i) => `
        .pad-${i} { border-color: ${c.color}44; }
        .pad-${i}::after {
          content: ''; position: absolute; inset: 0;
          background: ${c.color}; opacity: 0.2;
          border-radius: 10px;
        }
        .pad-${i}.active {
          background: ${c.color};
          box-shadow: 0 0 25px ${c.color}, inset 0 0 10px white;
          border-color: #fff;
        }
        .pad-${i}.active::after { opacity: 0.8; }
      `).join('')}

      .message-display {
        font-family: monospace;
        color: #fff;
        font-size: 1.1rem;
        min-height: 1.5em;
        font-weight: bold;
        text-transform: uppercase;
      }
    </style>
  `;

  return {
    id: 'color-sequence',
    category: 'memory',
    difficulty: difficulty,
    title: 'Cyber Sequence',
    correctAnswer: correctAnswer,
    
    async render(contentContainer, answerContainer) {
      // 1. Setup HTML
      contentContainer.innerHTML = `
        ${styles}
        <div class="cyber-memory">
          <div class="message-display" id="msg-text">Prepare...</div>
          
          <div class="pad-grid" id="pad-grid">
            ${activeColors.map((c, i) => `
              <button class="neon-pad pad-${i}" data-index="${i}"></button>
            `).join('')}
          </div>
          
          <div class="cyber-counter" id="counter-display">
            00 <span>/</span> ${String(sequenceLength).padStart(2, '0')}
          </div>
        </div>
      `;
      
      // No Replay button anymore. Just Submit.
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary" disabled style="width: 100%; max-width: 200px;">Submit Sequence</button>
      `;
      
      // 2. Logic References
      const padButtons = contentContainer.querySelectorAll('.neon-pad');
      const msgText = contentContainer.querySelector('#msg-text');
      const counterDisplay = contentContainer.querySelector('#counter-display');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      const updateCounter = (current) => {
        const c = String(current).padStart(2, '0');
        const t = String(sequenceLength).padStart(2, '0');
        counterDisplay.innerHTML = `${c} <span>/</span> ${t}`;
      };

      const flashButton = async (index) => {
        const btn = padButtons[index];
        btn.classList.add('active');
        await new Promise(r => setTimeout(r, playbackSpeed * 0.5));
        btn.classList.remove('active');
      };
      
      const playSequence = async () => {
        isInputLocked = true;
        playerInput = [];
        updateCounter(0);
        submitBtn.disabled = true;
        
        msgText.textContent = "MEMORIZE";
        msgText.style.color = "#FF0055"; // Alert Red
        
        await new Promise(r => setTimeout(r, 1000)); 
        
        for (let i = 0; i < sequenceIndices.length; i++) {
          await flashButton(sequenceIndices[i]);
          await new Promise(r => setTimeout(r, playbackSpeed * 0.5)); // Pause between flashes
        }
        
        msgText.textContent = "YOUR TURN";
        msgText.style.color = "#00FF99"; // Go Green
        isInputLocked = false;
      };
      
      // 3. Inputs
      padButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (isInputLocked) return;
          
          const idx = parseInt(btn.dataset.index);
          
          // Instant feedback
          flashButton(idx);
          
          // Record input
          if (playerInput.length < sequenceLength) {
            playerInput.push(activeColors[idx].name);
            updateCounter(playerInput.length);
            
            // Check if done
            if (playerInput.length === sequenceLength) {
              msgText.textContent = "SEQUENCE COMPLETE";
              msgText.style.color = "#00E5FF";
              submitBtn.disabled = false;
              submitBtn.focus(); // Helper for keyboard users
            }
          }
        });
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: playerInput } 
        }));
      });
      
      // Auto-start
      setTimeout(playSequence, 500);
    },
    
    check(answer) {
      return validateArray(answer, this.correctAnswer);
    },
    
    cleanup() {
      isInputLocked = true;
    }
  };
}

/**
 * 11. Shape Grid Memory Challenge (Mobile-First Tactile Version)
 */
export function createShapeGridChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  const rows = params.gridRows;
  const cols = params.gridCols;
  const totalCells = rows * cols;

  // Difficulty Cap: Max 50% of grid
  const rawActive = params.activeCells;
  const activeCells = Math.min(rawActive, Math.floor(totalCells / 2)); 
  
  // Generate random active positions
  const activePositions = new Set();
  while (activePositions.size < activeCells) {
    activePositions.add(randomInt(0, totalCells - 1));
  }
  
  const correctPattern = Array.from(activePositions).sort((a, b) => a - b);
  let playerPattern = [];
  let isInputLocked = true;

  // 1. Mobile-Optimized CSS
  const styles = `
    <style>
      .grid-memory-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 400px; /* Limits size on desktop, full width on mobile */
        margin: 0 auto;
      }

      .status-text {
        font-size: 1.1rem;
        font-weight: bold;
        color: #555;
        margin-bottom: 15px;
        min-height: 1.5em;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: center;
      }

      .memory-board {
        display: grid;
        grid-template-columns: repeat(${cols}, 1fr);
        grid-template-rows: repeat(${rows}, 1fr);
        gap: 10px; /* Smaller gap for mobile */
        background: #2d3436;
        padding: 15px;
        border-radius: 12px;
        width: 100%; /* Fill the container */
        box-sizing: border-box;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      }

      /* Tactile Buttons */
      .memory-key {
        width: 100%; /* Responsive width */
        aspect-ratio: 1; /* Forces it to be a square */
        background: #ecf0f1;
        border-radius: 8px;
        cursor: pointer;
        position: relative;
        transition: transform 0.1s, background-color 0.2s;
        
        /* The "Side" of the button (Fake 3D) */
        box-shadow: 
          0 4px 0 #bdc3c7, 
          0 5px 5px rgba(0,0,0,0.15);
        
        /* Improve touch response on mobile */
        touch-action: manipulation; 
        -webkit-tap-highlight-color: transparent;
      }

      /* Hover State (Desktop only usually) */
      @media (hover: hover) {
        .memory-key:hover {
          background: #dfe6e9;
          transform: translateY(-1px);
          box-shadow: 0 5px 0 #bdc3c7, 0 6px 5px rgba(0,0,0,0.15);
        }
      }

      /* Active / Lit State (Blue LED) */
      .memory-key.lit {
        background: #00cec9;
        box-shadow: 
          0 4px 0 #00b894, 
          0 0 15px rgba(0, 206, 201, 0.4);
        border: 1px solid rgba(255,255,255,0.3);
      }

      /* Pressed State (Actual click) */
      .memory-key:active, .memory-key.pressed {
        transform: translateY(4px); /* Pushes down */
        box-shadow: 
          0 0 0 #bdc3c7, 
          inset 0 2px 4px rgba(0,0,0,0.1);
      }
      
      /* Pressed + Lit */
      .memory-key.lit:active {
         box-shadow: 
          0 0 0 #00b894,
          inset 0 2px 4px rgba(0,0,0,0.2);
      }

    </style>
  `;

  return {
    id: 'shape-grid',
    category: 'memory',
    difficulty: difficulty,
    title: 'Pattern Memory',
    correctAnswer: correctPattern,
    
    async render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${styles}
        <div class="grid-memory-container">
          <div class="status-text" id="status-display">Ready...</div>
          
          <div class="memory-board" id="memory-board">
            ${Array.from({ length: totalCells }, (_, i) => `
              <div class="memory-key" data-index="${i}"></div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
          <button id="submit-btn" class="btn btn-primary" disabled style="width: 100%; max-width: 300px;">Submit Pattern</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
      
      // Auto-start
      await this.playSequence(contentContainer);
    },
    
    async playSequence(container) {
      const keys = container.querySelectorAll('.memory-key');
      const status = container.querySelector('#status-display');
      
      // 1. Wait
      await new Promise(r => setTimeout(r, 800));
      
      // 2. Show
      status.textContent = "WATCH";
      status.style.color = "#00cec9";
      
      activePositions.forEach(index => {
        keys[index].classList.add('lit');
        keys[index].classList.add('pressed'); // Physically press it down
      });
      
      // 3. Hold
      const holdTime = 1500 + (difficulty * 200);
      await new Promise(r => setTimeout(r, holdTime));
      
      // 4. Hide
      keys.forEach(k => {
        k.classList.remove('lit');
        k.classList.remove('pressed'); // Release
      });
      
      // 5. Input
      status.textContent = "REPEAT";
      status.style.color = "#555";
      isInputLocked = false;
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const keys = contentContainer.querySelectorAll('.memory-key');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      keys.forEach(key => {
        key.addEventListener('click', () => {
          if (isInputLocked) return;
          
          const index = parseInt(key.dataset.index);
          
          // Toggle
          if (playerPattern.includes(index)) {
            key.classList.remove('lit');
            playerPattern = playerPattern.filter(i => i !== index);
          } else {
            key.classList.add('lit');
            playerPattern.push(index);
          }
          
          // Button Logic
          if (playerPattern.length > 0) {
            submitBtn.disabled = false;
            submitBtn.textContent = `Submit (${playerPattern.length})`;
          } else {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submit Pattern";
          }
        });
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
      isInputLocked = true;
    }
  };
}

/**
 * 12. Pattern Matching (Rune Stone Match - Optimized & Magical)
 * FIXED: Grid Size Capped for Mobile (Max 24 items)
 */
export function createPatternMatchingChallenge(difficulty) {
  const params = getDifficultyParams('memory', difficulty);
  
  // 1. Difficulty & Layout Constraints
  // CAP total items at 24 (4 columns x 6 rows) so it fits on mobile screens.
  // Instead of more items, high levels get more rune VARIETY (harder to distinguish).
  const totalItems = Math.min(24, 12 + (Math.floor(difficulty / 5) * 3));
  
  // Ensure totalItems is divisible by 3 (since we need sets of 3)
  const adjustedTotal = totalItems - (totalItems % 3);
  
  const groupsToGenerate = Math.floor(adjustedTotal / 3);
  const MATCH_SIZE = 3;
  
  // 2. Assets
  const runes = ['ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];
  
  // Magical Colors
  const runeColors = [
    '#00f3ff', // Cyan
    '#ff0055', // Red
    '#50ff44', // Green
    '#bd00ff', // Purple
    '#ffae00', // Gold
  ];

  // 3. Generate Items
  const items = [];
  
  // We need to ensure we don't run out of rune/color combos
  for (let i = 0; i < groupsToGenerate; i++) {
    const symbol = runes[i % runes.length];
    const color = runeColors[i % runeColors.length];
    
    // Create a matching set of 3
    for (let k = 0; k < MATCH_SIZE; k++) {
      items.push({ 
        id: items.length, 
        symbol, 
        color, 
        key: `${symbol}-${color}`
      });
    }
  }
  
  const shuffledItems = shuffleArray(items);
  let selectedItems = [];

  // 4. Styles (Floating Animation + Mobile Grid)
  const styles = `
    <style>
      .rune-match {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 15px;
      }
      
      .instruction-hud {
        font-size: 1rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: center;
        margin-bottom: 5px;
        transition: color 0.3s;
      }
      
      .rune-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        max-width: 400px; /* Constraints width for mobile */
      }
      
      .rune-stone {
        width: 50px; /* Good touch size */
        height: 60px;
        background: linear-gradient(to bottom, #a6bad0ff, #a9c8e7ff);
        border-radius: 8px;
        border-bottom: 5px solid #1a252f;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        position: relative;
        box-shadow: 0 10px 15px rgba(0,0,0,0.3);
        
        /* Floating Animation */
        animation: float 3s ease-in-out infinite;
        /* Randomize float delay so they don't move in unison */
        animation-delay: calc(var(--delay) * -1s);
        transition: transform 0.2s, filter 0.2s;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      
      .rune-symbol {
        font-size: 1.8rem;
        font-weight: bold;
        color: rgba(0,0,0,0.4);
        text-shadow: 1px 1px 0 rgba(255,255,255,0.1);
        transition: all 0.3s;
      }
      
      /* Selected State */
      .rune-stone.selected {
        background: #2c3e50;
        border-bottom-width: 2px;
        transform: translateY(3px) !important; /* Override float */
        animation: none; /* Stop floating when selected */
        box-shadow: 0 0 15px var(--glow-color);
        border: 1px solid var(--glow-color);
      }
      
      .rune-stone.selected .rune-symbol {
        color: var(--glow-color);
        text-shadow: 0 0 10px var(--glow-color);
        transform: scale(1.2);
      }

      .submit-bar {
        width: 100%;
        max-width: 300px;
        margin-top: 10px;
      }
    </style>
  `;

  return {
    id: 'pattern-matching',
    category: 'memory',
    difficulty: difficulty,
    title: 'Rune Match',
    itemData: shuffledItems, // Store data for checking
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        ${styles}
        <div class="rune-match">
          <div class="instruction-hud" id="status-text">
            Select 3 matching symbols
          </div>
          
          <div class="rune-grid">
            ${shuffledItems.map((item, index) => `
              <div class="rune-stone" 
                   data-id="${item.id}" 
                   style="--glow-color: ${item.color}; --delay: ${index % 5};">
                <div class="rune-symbol">${item.symbol}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="submit-bar">
          <button id="submit-btn" class="btn btn-primary" style="width:100%" disabled>Submit Set (0/3)</button>
        </div>
      `;
      
      this.setupEventListeners(contentContainer, answerContainer);
    },
    
    setupEventListeners(contentContainer, answerContainer) {
      const stones = contentContainer.querySelectorAll('.rune-stone');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      const statusText = contentContainer.querySelector('#status-text');
      
      selectedItems = [];
      
      stones.forEach(stone => {
        stone.addEventListener('click', () => {
          const id = parseInt(stone.dataset.id);
          
          if (stone.classList.contains('selected')) {
            // Deselect
            stone.classList.remove('selected');
            selectedItems = selectedItems.filter(i => i !== id);
          } else {
            // Select (Max 3)
            if (selectedItems.length < 3) {
              stone.classList.add('selected');
              selectedItems.push(id);
            } else {
              // Shake effect if full
              stone.animate([
                { transform: 'translateX(0)' }, 
                { transform: 'translateX(4px)' }, 
                { transform: 'translateX(-4px)' }, 
                { transform: 'translateX(0)' }
              ], { duration: 200 });
            }
          }
          
          // Update UI
          const count = selectedItems.length;
          submitBtn.textContent = `Submit Set (${count}/3)`;
          submitBtn.disabled = count !== 3;
          
          if (count === 3) {
            statusText.textContent = "ALIGNED. TAP SUBMIT.";
            statusText.style.color = "#fff";
            statusText.style.fontWeight = "bold";
          } else {
            statusText.textContent = "Select 3 matching symbols";
            statusText.style.color = "#888";
            statusText.style.fontWeight = "normal";
          }
        });
      });
      
      submitBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { 
          detail: { answer: selectedItems.sort((a, b) => a - b) } 
        }));
      });
    },
    
    check(playerAnswer) {
      if (playerAnswer.length !== 3) return false;
      
      // Map IDs back to objects
      const pickedItems = playerAnswer.map(id => this.itemData.find(i => i.id === id));
      
      if (pickedItems.some(i => !i)) return false;
      
      // Verify match
      const firstKey = pickedItems[0].key;
      return pickedItems.every(item => item.key === firstKey);
    },
    
    cleanup() {
      selectedItems = [];
    }
  };
}

// Register all memory challenges
registerChallenge('color-sequence', 'memory', createColorSequenceChallenge, {
  name: 'Color Sequence',
  description: 'Memorize color sequence',
  minDifficulty: 1,
  baseTime: 55
});

registerChallenge('shape-grid', 'memory', createShapeGridChallenge, {
  name: 'Shape Grid',
  description: 'Memorize grid pattern',
  minDifficulty: 2,
  baseTime: 40
});

registerChallenge('pattern-matching', 'memory', createPatternMatchingChallenge, {
  name: 'Pattern Matching',
  description: 'Find matching items',
  minDifficulty: 1,
  baseTime: 35
});