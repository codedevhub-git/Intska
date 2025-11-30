/**
 * Logic Challenges
 * 5. Sequence Prediction
 * 6. Odd One Out
 * 7. True/False Logic
 * 8. Spatial Reasoning (Pyramid View)
 * 9. Number Grid Patterns
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice, shuffleArray, randomColor } from '../utils/random.js';
import { validateNumber } from '../utils/validators.js';

/**
 * 5. Sequence Prediction Challenge
 */
export function createSequencePredictionChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Different sequence types
  const sequenceTypes = [
    { name: 'arithmetic', generate: (start, step, length) => 
      Array.from({ length }, (_, i) => start + (i * step)) },
    { name: 'geometric', generate: (start, step, length) => 
      Array.from({ length }, (_, i) => start * Math.pow(step, i)) },
    { name: 'squares', generate: (start, _, length) => 
      Array.from({ length }, (_, i) => Math.pow(start + i, 2)) },
    { name: 'fibonacci', generate: (a, b, length) => {
      const seq = [a, b];
      for (let i = 2; i < length; i++) {
        seq.push(seq[i-1] + seq[i-2]);
      }
      return seq;
    }}
  ];
  
  const type = randomChoice(sequenceTypes);
  const start = randomInt(1, 10);
  const step = randomInt(2, params.sequenceStep + 2);
  const length = params.sequenceLength;
  
  const fullSequence = type.generate(start, step, length);
  const displaySequence = fullSequence.slice(0, -1);
  const answer = fullSequence[fullSequence.length - 1];
  
  return {
    id: 'sequence-prediction',
    category: 'logic',
    difficulty: difficulty,
    title: 'Find the Next Number',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="sequence-challenge">
          <div class="sequence-display">
            ${displaySequence.map(num => `
              <div class="sequence-item">${num}</div>
            `).join('')}
            <div class="sequence-item sequence-missing">?</div>
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Next number"
          autocomplete="off"
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
 * 6. Odd One Out Challenge
 */
export function createOddOneOutChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  const itemCount = params.itemCount;
  const baseColor = randomColor();
  const baseSize = randomInt(40, 60);
  const baseShape = randomChoice(['circle', 'square', 'triangle']);
  
  // Choose what makes the odd one different
  const differenceType = randomChoice(['color', 'size', 'shape', 'rotation']);
  
  const items = [];
  const oddIndex = randomInt(0, itemCount - 1);
  
  for (let i = 0; i < itemCount; i++) {
    const item = {
      color: baseColor,
      size: baseSize,
      shape: baseShape,
      rotation: 0
    };
    
    // Make one item different
    if (i === oddIndex) {
      switch (differenceType) {
        case 'color':
          item.color = randomColor();
          while (item.color === baseColor) {
            item.color = randomColor();
          }
          break;
        case 'size':
          item.size = baseSize * (randomChoice([0.6, 1.4]));
          break;
        case 'shape':
          const shapes = ['circle', 'square', 'triangle'];
          item.shape = randomChoice(shapes.filter(s => s !== baseShape));
          break;
        case 'rotation':
          item.rotation = 45;
          break;
      }
    }
    
    items.push(item);
  }
  
  return {
    id: 'odd-one-out',
    category: 'logic',
    difficulty: difficulty,
    title: 'Find the Odd One Out',
    correctAnswer: oddIndex,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="odd-one-out-grid">
          ${items.map((item, index) => `
            <div class="odd-item-wrapper" data-index="${index}">
              <div class="odd-item shape-${item.shape}" style="
                background-color: ${item.color};
                width: ${item.size}px;
                height: ${item.size}px;
                transform: rotate(${item.rotation}deg);
              "></div>
            </div>
          `).join('')}
        </div>
      `;
      
      answerContainer.innerHTML = `
        <p class="instruction">Click the different one</p>
      `;
      
      this.setupEventListeners(contentContainer);
    },
    
    setupEventListeners(contentContainer) {
      const items = contentContainer.querySelectorAll('.odd-item-wrapper');
      
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const answer = parseInt(item.dataset.index);
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
 * 7. True/False Logic Challenge
 */
export function createTrueFalseLogicChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  const statements = [
    {
      premises: ['All bloops are zargs', 'Some zargs are flins'],
      conclusion: 'All bloops are flins',
      correct: false
    },
    {
      premises: ['All cats are animals', 'All animals need water'],
      conclusion: 'All cats need water',
      correct: true
    },
    {
      premises: ['Some birds can fly', 'All penguins are birds'],
      conclusion: 'All penguins can fly',
      correct: false
    },
    {
      premises: ['No fish can walk', 'All sharks are fish'],
      conclusion: 'No sharks can walk',
      correct: true
    },
    {
      premises: ['All squares have 4 sides', 'All rectangles have 4 sides'],
      conclusion: 'All squares are rectangles',
      correct: true
    }
  ];
  
  const statement = randomChoice(statements);
  
  return {
    id: 'true-false-logic',
    category: 'logic',
    difficulty: difficulty,
    title: 'Is This Statement True or False?',
    correctAnswer: statement.correct,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="logic-statement">
          <div class="premises">
            ${statement.premises.map(p => `
              <p class="premise">• ${p}</p>
            `).join('')}
          </div>
          <div class="conclusion-divider">Therefore:</div>
          <div class="conclusion">${statement.conclusion}</div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="true-false-buttons">
          <button class="choice-btn" data-value="true">TRUE</button>
          <button class="choice-btn" data-value="false">FALSE</button>
        </div>
      `;
      
      this.setupEventListeners(answerContainer);
    },
    
    setupEventListeners(answerContainer) {
      const buttons = answerContainer.querySelectorAll('.choice-btn');
      
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const answer = btn.dataset.value === 'true';
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
 * 8. Spatial Reasoning (Pyramid View) Challenge
 */
export function createSpatialReasoningChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Generate a simple 3D pyramid configuration
  const pyramidColor = randomColor();
  const correctView = randomInt(0, 3); // 0=top, 1=front, 2=side, 3=back
  
  const views = {
    top: '▲',
    front: '△',
    side: '◁',
    back: '▽'
  };
  
  const viewNames = ['Top View', 'Front View', 'Side View', 'Back View'];
  const correctAnswer = correctView;
  
  return {
    id: 'spatial-reasoning',
    category: 'logic',
    difficulty: difficulty,
    title: 'Which View is This?',
    correctAnswer: correctAnswer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="spatial-challenge">
          <div class="pyramid-display">
            <div class="pyramid-3d" style="color: ${pyramidColor};">
              ${Object.values(views)[correctView]}
            </div>
            <p class="spatial-hint">This is one view of a pyramid</p>
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="view-options">
          ${viewNames.map((name, index) => `
            <button class="choice-btn" data-index="${index}">
              ${name}
            </button>
          `).join('')}
        </div>
      `;
      
      this.setupEventListeners(answerContainer);
    },
    
    setupEventListeners(answerContainer) {
      const buttons = answerContainer.querySelectorAll('.choice-btn');
      
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const answer = parseInt(btn.dataset.index);
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
 * 9. Number Grid Pattern Challenge
 */
export function createNumberGridChallenge(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  
  // Create a 3x3 grid with a pattern
  const patterns = [
    {
      name: 'squares',
      generate: () => {
        const start = randomInt(1, 5);
        return [
          [Math.pow(start, 2), Math.pow(start+1, 2), Math.pow(start+2, 2)],
          [Math.pow(start+3, 2), null, Math.pow(start+5, 2)],
          [Math.pow(start+6, 2), Math.pow(start+7, 2), Math.pow(start+8, 2)]
        ];
      },
      answer: (grid) => Math.pow(grid[0][0]/Math.pow(Math.sqrt(grid[0][0]), 2) + 4, 2)
    },
    {
      name: 'multiplication',
      generate: () => {
        const row1 = [1, 4, 7];
        const row2 = [2, null, 8];
        const row3 = [3, 6, 9];
        return [row1, row2, row3];
      },
      answer: () => 5
    },
    {
      name: 'addition',
      generate: () => {
        const step = randomInt(2, 5);
        const start = randomInt(1, 10);
        return [
          [start, start + step, start + step*2],
          [start + step*3, null, start + step*5],
          [start + step*6, start + step*7, start + step*8]
        ];
      },
      answer: (grid) => grid[0][0] + ((grid[0][1] - grid[0][0]) * 4)
    }
  ];
  
  const pattern = randomChoice(patterns);
  const grid = pattern.generate();
  const answer = pattern.answer(grid);
  
  // Replace null with answer for storage
  let missingRow = -1, missingCol = -1;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i][j] === null) {
        missingRow = i;
        missingCol = j;
        grid[i][j] = answer;
      }
    }
  }
  
  return {
    id: 'number-grid',
    category: 'logic',
    difficulty: difficulty,
    title: 'Find the Missing Number',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="number-grid">
          ${grid.map((row, i) => `
            <div class="grid-row">
              ${row.map((num, j) => `
                <div class="grid-cell ${i === missingRow && j === missingCol ? 'grid-missing' : ''}">
                  ${i === missingRow && j === missingCol ? '?' : num}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Missing number"
          autocomplete="off"
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
 * Register all logic challenges
 */
import { registerChallenge } from './registry.js';

registerChallenge('sequence-prediction', 'logic', createSequencePredictionChallenge, {
  name: 'Sequence Prediction',
  description: 'Find the next number in sequence',
  minDifficulty: 1
});

registerChallenge('odd-one-out', 'logic', createOddOneOutChallenge, {
  name: 'Odd One Out',
  description: 'Find the different item',
  minDifficulty: 1
});

registerChallenge('true-false-logic', 'logic', createTrueFalseLogicChallenge, {
  name: 'True/False Logic',
  description: 'Logical reasoning',
  minDifficulty: 2
});

registerChallenge('spatial-reasoning', 'logic', createSpatialReasoningChallenge, {
  name: 'Spatial Reasoning',
  description: 'Identify different views',
  minDifficulty: 3
});

registerChallenge('number-grid', 'logic', createNumberGridChallenge, {
  name: 'Number Grid',
  description: 'Find missing number in pattern',
  minDifficulty: 2
});