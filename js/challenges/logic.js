/**
 * Logic Challenges (Mobile-First, Visual Upgrade)
 * 5. Sequence Prediction
 * 6. Odd One Out
 * 7. True/False Logic
 * 8. Spatial Reasoning (3D Block View)
 * 9. Number Grid Patterns
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice, shuffleArray, randomColor } from '../utils/random.js';
import { validateNumber } from '../utils/validators.js';
import { registerChallenge } from './registry.js';

// --- Shared Helper: Numpad (Copy from Math module to ensure standalone functionality) ---
function createNumpad(container, onSubmit) {
  let currentValue = '';
  const styles = `
    <style>
      .logic-display-area {
        background: #f1f2f6;
        border: 2px solid #dfe4ea;
        border-radius: 12px;
        padding: 10px 15px;
        margin-bottom: 15px;
        text-align: center;
        font-family: 'Courier New', monospace;
        font-size: 2rem;
        min-height: 50px;
        color: #2f3542;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
      }
      .logic-numpad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        width: 100%;
        max-width: 350px;
        margin: 0 auto;
      }
      .logic-num-btn {
        background: white;
        border: 1px solid #ced6e0;
        border-radius: 10px;
        padding: 15px 0;
        font-size: 1.4rem;
        font-weight: 600;
        color: #2f3542;
        cursor: pointer;
        box-shadow: 0 4px 0 #a4b0be;
        touch-action: manipulation;
      }
      .logic-num-btn:active { transform: translateY(4px); box-shadow: none; }
      .l-btn-submit { background-color: #2ed573; color: white; border-color: #26af61; box-shadow: 0 4px 0 #26af61; }
      .l-btn-clear { background-color: #ff4757; color: white; border-color: #e04050; box-shadow: 0 4px 0 #e04050; }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div class="logic-display-area" id="logic-input-display">?</div>
    <div class="logic-numpad">
      <button class="logic-num-btn" data-val="1">1</button>
      <button class="logic-num-btn" data-val="2">2</button>
      <button class="logic-num-btn" data-val="3">3</button>
      <button class="logic-num-btn" data-val="4">4</button>
      <button class="logic-num-btn" data-val="5">5</button>
      <button class="logic-num-btn" data-val="6">6</button>
      <button class="logic-num-btn" data-val="7">7</button>
      <button class="logic-num-btn" data-val="8">8</button>
      <button class="logic-num-btn" data-val="9">9</button>
      <button class="logic-num-btn l-btn-clear" data-action="clear">C</button>
      <button class="logic-num-btn" data-val="0">0</button>
      <button class="logic-num-btn l-btn-submit" data-action="submit">↵</button>
    </div>
  `;

  const display = container.querySelector('#logic-input-display');
  const buttons = container.querySelectorAll('.logic-num-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const action = btn.dataset.action;
      if (val !== undefined) {
        if (currentValue.length < 6) {
          currentValue += val;
          display.textContent = currentValue;
        }
      } else if (action === 'clear') {
        currentValue = '';
        display.textContent = '?';
      } else if (action === 'submit') {
        if (currentValue === '') return;
        onSubmit(parseInt(currentValue, 10));
      }
    });
  });
}

/**
 * 5. Sequence Prediction Challenge (Visual "Train" Style)
 */
export function createSequencePredictionChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Logic: Ensure numbers don't get astronomical on mobile
  const sequenceTypes = [
    { name: 'Linear', gen: (s, d, i) => s + (i * d) },
    { name: 'Geometric', gen: (s, d, i) => s * Math.pow(Math.min(d, 3), i) }, // Cap multiplier
    { name: 'Fibonacci-ish', gen: (s, d, i, arr) => (i < 2 ? (i===0?s:d) : arr[i-1] + arr[i-2]) }
  ];
  
  const type = randomChoice(sequenceTypes);
  const start = randomInt(1, 10);
  const diff = randomInt(2, Math.max(3, 10 - difficulty)); // Smaller steps at high difficulty to keep mental math doable
  const length = 5;
  
  let fullSequence = [];
  for(let i=0; i<length; i++) {
    fullSequence.push(type.gen(start, diff, i, fullSequence));
  }
  
  const answer = fullSequence.pop(); // Remove last
  
  return {
    id: 'sequence-prediction',
    category: 'logic',
    difficulty: difficulty,
    title: 'Complete the Pattern',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <style>
          .seq-train { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; overflow-x: auto; padding: 10px; }
          .seq-car {
            background: #3742fa;
            color: white;
            min-width: 50px;
            height: 60px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 4px 0 #2f3542;
            position: relative;
          }
          /* Connector lines */
          .seq-car:not(:last-child)::after {
            content: ''; position: absolute; right: -8px; top: 50%;
            width: 8px; height: 4px; background: #2f3542;
          }
          .seq-car.missing { background: #ced6e0; color: #2f3542; border: 2px dashed #a4b0be; box-shadow: none; }
        </style>
        <div class="seq-train">
          ${fullSequence.map(n => `<div class="seq-car">${n}</div>`).join('')}
          <div class="seq-car missing">?</div>
        </div>
      `;
      createNumpad(answerContainer, (val) => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: val } }));
      });
    },
    check(a) { return validateNumber(a, this.correctAnswer); }, cleanup() {}
  };
}

/**
 * 6. Odd One Out Challenge (Emoji Grid)
 */
export function createOddOneOutChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Use Emojis instead of CSS shapes for better mobile visuals
  const themes = [
    { base: '🍎', odd: '🍅' }, // Red round
    { base: '🐱', odd: '🐯' }, // Cats
    { base: '⌚', odd: '⏰' }, // Clocks
    { base: '🌑', odd: '🌚' }, // Moons
    { base: '🔒', odd: '🔓' }  // Locks
  ];
  
  const theme = randomChoice(themes);
  const itemCount = difficulty < 3 ? 9 : (difficulty < 6 ? 12 : 16); // 3x3, 3x4, or 4x4
  const oddIndex = randomInt(0, itemCount - 1);
  
  return {
    id: 'odd-one-out',
    category: 'logic',
    difficulty: difficulty,
    title: 'Find the Imposter',
    correctAnswer: oddIndex,
    
    render(contentContainer, answerContainer) {
      // Calculate grid columns based on count
      const cols = itemCount === 9 ? 3 : 4;
      
      contentContainer.innerHTML = `
        <style>
          .imposter-grid {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: 10px;
            max-width: 350px;
            margin: 0 auto;
          }
          .emoji-item {
            aspect-ratio: 1;
            background: white;
            border-radius: 12px;
            font-size: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 0 #eee;
            border: 1px solid #ddd;
            transition: transform 0.1s;
          }
          .emoji-item:active { transform: translateY(4px); box-shadow: none; }
        </style>
        <div class="imposter-grid">
          ${Array.from({length: itemCount}).map((_, i) => `
            <div class="emoji-item" data-index="${i}">
              ${i === oddIndex ? theme.odd : theme.base}
            </div>
          `).join('')}
        </div>
      `;
      
      answerContainer.innerHTML = '<p style="text-align:center; color:#888;">Tap the different item</p>';
      
      const items = contentContainer.querySelectorAll('.emoji-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('challengeAnswer', { 
            detail: { answer: parseInt(item.dataset.index) } 
          }));
        });
      });
    },
    check(a) { return a === this.correctAnswer; }, cleanup() {}
  };
}

/**
 * 7. True/False Logic (Fact Card UI)
 */
export function createTrueFalseLogicChallenge(difficulty) {
  // Simple syllogisms
  const statements = [
    { p: ['All A are B', 'Some B are C'], c: 'All A are C', correct: false },
    { p: ['All Cats are Mammals', 'All Mammals breathe'], c: 'All Cats breathe', correct: true },
    { p: ['No Fish walk', 'Sharks are Fish'], c: 'No Sharks walk', correct: true },
    { p: ['Some Birds fly', 'Penguins are Birds'], c: 'Penguins can fly', correct: false },
    { p: ['If it rains, grass gets wet', 'The grass is wet'], c: 'It rained', correct: false } // Logic trap!
  ];
  
  const logic = randomChoice(statements);
  
  return {
    id: 'true-false-logic',
    category: 'logic',
    difficulty: difficulty,
    title: 'Logic Validator',
    correctAnswer: logic.correct,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <style>
          .logic-card {
            background: white;
            border-left: 5px solid #3742fa;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: left;
            margin: 0 auto;
            max-width: 350px;
            min-width: 280px;
          }
          .premise { color: #57606f; margin-bottom: 8px; font-style: italic; }
          .conclusion-box { 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 2px dashed #eee; 
            font-weight: bold; 
            color: #2f3542; 
            font-size: 1.2rem;
          }
          .tf-btn-group { display: flex; gap: 15px; justify-content: center; margin-top: 20px; }
          .tf-btn {
            flex: 1;
            padding: 15px;
            border-radius: 10px;
            border: none;
            font-size: 1.2rem;
            font-weight: bold;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          }
          .btn-true { background: #2ed573; }
          .btn-false { background: #ff4757; }
          .tf-btn:active { transform: translateY(4px); box-shadow: none; }
        </style>
        <div class="logic-card">
          <div class="label" style="font-size:0.8rem; text-transform:uppercase; color:#ccc; margin-bottom:10px;">Premises</div>
          ${logic.p.map(l => `<div class="premise">• ${l}</div>`).join('')}
          <div class="conclusion-box">
            <span style="font-weight:normal; font-size:0.9rem; color:#ccc;">CONCLUSION:</span><br>
            ${logic.c}
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="tf-btn-group">
          <button class="tf-btn btn-true" data-val="true">VALID</button>
          <button class="tf-btn btn-false" data-val="false">INVALID</button>
        </div>
      `;
      
      answerContainer.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('challengeAnswer', { 
            detail: { answer: btn.dataset.val === 'true' } 
          }));
        });
      });
    },
    check(a) { return a === this.correctAnswer; }, cleanup() {}
  };
}

/**
 * 8. Spatial Reasoning (3D Block View)
 * UPGRADE: Uses CSS 3D to show a block structure, asks for Top/Side view
 */
export function createSpatialReasoningChallenge(difficulty) {
  // We will generate a simple 2x2x2 block structure where some blocks are missing
  // Then ask: "Which is the TOP view?"
  
  // 1 = block, 0 = empty. 
  // Simple map: 4 positions (TL, TR, BL, BR)
  const structure = [
    randomInt(0,1), 1, // Back row
    1, randomInt(0,1)  // Front row
  ];
  // Ensure at least 3 blocks for visibility
  if(structure.reduce((a,b)=>a+b,0) < 3) structure[0] = 1;

  // Correct Top View (Flat representation of structure)
  // 1 means there is a block, 0 means empty space
  const correctAnswerIndex = 0; // We'll put correct answer in slot 0 then shuffle visuals

  return {
    id: 'spatial-reasoning',
    category: 'logic',
    difficulty: difficulty,
    title: 'Identify the TOP View',
    correctAnswer: 0, // We will map the click to the correct index
    
    render(contentContainer, answerContainer) {
      // CSS 3D Scene
      contentContainer.innerHTML = `
        <style>
          .scene-3d {
            width: 120px; height: 120px;
            margin: 20px auto;
            perspective: 600px;
          }
          .pivot {
            width: 100%; height: 100%;
            transform-style: preserve-3d;
            transform: rotateX(60deg) rotateZ(45deg); /* Isometric-ish view */
            position: relative;
          }
          .block {
            position: absolute;
            width: 50px; height: 50px;
            background: #ffa502;
            border: 1px solid #e58e26;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
          }
          .block::before {
             content:''; position: absolute; width:100%; height:20px;
             background: #c67618; top:100%; left:0; transform-origin: top; transform: rotateX(-90deg);
          }
          .block::after {
             content:''; position: absolute; width:20px; height:100%;
             background: #aa6210; top:0; left:100%; transform-origin: left; transform: rotateY(90deg);
          }
          
          /* Positioning 2x2 Grid */
          .b-0 { top: 0; left: 0; }
          .b-1 { top: 0; left: 50px; }
          .b-2 { top: 50px; left: 0; }
          .b-3 { top: 50px; left: 50px; }

          .options-grid { display: flex; gap: 15px; justify-content: center; margin-top: 20px; }
          .opt-card {
            width: 60px; height: 60px;
            background: #eee;
            border: 2px solid #ccc;
            border-radius: 8px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 4px;
            gap: 2px;
            cursor: pointer;
          }
          .opt-cell { background: #ccc; border-radius: 2px; }
          .opt-cell.fill { background: #3742fa; }
        </style>
        
        <div class="scene-3d">
          <div class="pivot">
            ${structure[0] ? '<div class="block b-0"></div>' : ''}
            ${structure[1] ? '<div class="block b-1"></div>' : ''}
            ${structure[2] ? '<div class="block b-2"></div>' : ''}
            ${structure[3] ? '<div class="block b-3"></div>' : ''}
          </div>
        </div>
      `;
      
      // Generate Options
      // Option 0: Correct
      // Option 1: Inverted
      // Option 2: Full
      
      const generateGrid = (arr) => `
        <div class="opt-card" data-id="${arr === structure ? 0 : 1}">
          ${arr.map(v => `<div class="opt-cell ${v?'fill':''}"></div>`).join('')}
        </div>
      `;
      
      // Distractors
      const distractor1 = structure.map(x => x === 0 ? 1 : 0); // Invert
      const distractor2 = [1,1,1,1]; // All full
      
      // Shuffle display order
      const options = [
        { html: generateGrid(structure), val: 0 },
        { html: generateGrid(distractor1), val: 1 }, // Wrong
        { html: generateGrid(distractor2), val: 2 }  // Wrong
      ];
      shuffleArray(options);
      
      answerContainer.innerHTML = `
        <div class="options-grid">
          ${options.map(o => o.html).join('')}
        </div>
      `;
      
      // Correct the data-ids after shuffle logic
      const cards = answerContainer.querySelectorAll('.opt-card');
      cards.forEach((c, i) => {
        // We need to re-bind the click to the actual object value we shuffled
        c.onclick = () => window.dispatchEvent(new CustomEvent('challengeAnswer', { 
           detail: { answer: options[i].val } // 0 is always correct in this setup
        }));
      });
    },
    check(a) { return a === 0; }, cleanup() {}
  };
}

/**
 * 9. Number Grid Pattern (Matrix)
 * Upgrade: Uses Numpad + Cleaner CSS
 */
export function createNumberGridChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Grid Patterns
  const patterns = [
    { name: 'Row Sum', gen: () => {
        const g = [[1,2,3], [4,5,9], [2,3,5]]; // A+B=C
        // Randomize
        const m = randomInt(1,5);
        return g.map(row => row.map(x => x * m));
      }, solve: (g) => g[2][0] + g[2][1] 
    },
    { name: 'Col Increment', gen: () => {
        const start = randomInt(1,10);
        return [[start, start+1, start+2], [start+3, start+4, start+5], [start+6, start+7, start+8]];
      }, solve: (g) => g[2][2]
    }
  ];
  
  const pat = randomChoice(patterns);
  const grid = pat.gen();
  const answer = pat.solve(grid);
  
  // Hide bottom right for consistency in this simplified version, 
  // or logic to hide specific cell
  grid[2][2] = null; 
  
  return {
    id: 'number-grid',
    category: 'logic',
    difficulty: difficulty,
    title: 'Find the Pattern',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <style>
          .matrix-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            background: #2f3542;
            padding: 10px;
            border-radius: 8px;
            width: 200px; margin: 0 auto;
          }
          .matrix-cell {
            background: #dfe4ea;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: #2f3542;
            border-radius: 4px;
          }
          .matrix-cell.missing { background: #3742fa; color: white; }
        </style>
        <div class="matrix-grid">
          ${grid.flat().map(v => `
            <div class="matrix-cell ${v===null?'missing':''}">${v===null?'?':v}</div>
          `).join('')}
        </div>
      `;
      createNumpad(answerContainer, (v) => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: v } }));
      });
    },
    check(a) { return validateNumber(a, this.correctAnswer); }, cleanup() {}
  };
}


// --- Registry ---
registerChallenge('sequence-prediction', 'logic', createSequencePredictionChallenge, {
  name: 'Sequence', description: 'Next number?', minDifficulty: 1, baseTime: 40
});
registerChallenge('odd-one-out', 'logic', createOddOneOutChallenge, {
  name: 'Odd One Out', description: 'Find the imposter', minDifficulty: 1, baseTime: 15
});
registerChallenge('true-false-logic', 'logic', createTrueFalseLogicChallenge, {
  name: 'Logic Check', description: 'True or False?', minDifficulty: 2, baseTime: 30
});
// registerChallenge('spatial-reasoning', 'logic', createSpatialReasoningChallenge, {
//   name: 'Spatial View', description: 'Top view match', minDifficulty: 3, baseTime: 35
// });
registerChallenge('number-grid', 'logic', createNumberGridChallenge, {
  name: 'Matrix Pattern', description: 'Fill the grid', minDifficulty: 2, baseTime: 45
});