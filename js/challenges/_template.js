/**
 * Challenge Template
 * Use this as a starting point for creating new challenges
 * 
 * To add a new challenge:
 * 1. Copy this file
 * 2. Implement the required methods
 * 3. Register in the appropriate category file (math.js, logic.js, etc.)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice } from '../utils/random.js';
import { validateNumber } from '../utils/validators.js';

/**
 * Example Challenge Factory
 * @param {number} difficulty - Current difficulty level
 * @returns {Object} Challenge instance
 */
export function createExampleChallenge(difficulty) {
  // Get difficulty parameters for this challenge type
  const params = getDifficultyParams('math', difficulty); // or 'logic', 'memory', 'puzzle'
  
  // Generate challenge data
  const challengeData = generateChallengeData(params);
  
  return {
    // Required properties
    id: 'example-challenge',
    category: 'math', // 'math', 'logic', 'memory', 'puzzle'
    difficulty: difficulty,
    title: 'Example Challenge',
    
    // The correct answer (stored for validation)
    correctAnswer: challengeData.answer,
    
    /**
     * Render the challenge UI
     * @param {HTMLElement} contentContainer - Where to render the challenge question/content
     * @param {HTMLElement} answerContainer - Where to render answer inputs/buttons
     */
    render(contentContainer, answerContainer) {
      // Render challenge content
      contentContainer.innerHTML = `
        <div class="challenge-question">
          <p>What is ${challengeData.num1} + ${challengeData.num2}?</p>
        </div>
      `;
      
      // Render answer input
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Your answer"
          autocomplete="off"
        />
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      // Set up event listeners
      this.setupEventListeners(answerContainer);
    },
    
    /**
     * Set up event listeners for answer submission
     */
    setupEventListeners(answerContainer) {
      const input = answerContainer.querySelector('#answer-input');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      // Focus input
      if (input) {
        input.focus();
      }
      
      // Submit on button click
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const answer = input.value;
          // This will be handled by the engine
          window.dispatchEvent(new CustomEvent('challengeAnswer', { 
            detail: { answer } 
          }));
        });
      }
      
      // Submit on Enter key
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const answer = input.value;
            window.dispatchEvent(new CustomEvent('challengeAnswer', { 
              detail: { answer } 
            }));
          }
        });
      }
    },
    
    /**
     * Check if the player's answer is correct
     * @param {any} answer - Player's answer
     * @returns {boolean} True if correct
     */
    check(answer) {
      return validateNumber(answer, this.correctAnswer);
    },
    
    /**
     * Clean up (remove event listeners, intervals, etc.)
     */
    cleanup() {
      // Remove any event listeners, intervals, or timers created by this challenge
      // This is called when moving to the next challenge
    }
  };
}

/**
 * Generate challenge data based on difficulty
 */
function generateChallengeData(params) {
  const num1 = randomInt(params.minNumber, params.maxNumber);
  const num2 = randomInt(params.minNumber, params.maxNumber);
  const answer = num1 + num2;
  
  return { num1, num2, answer };
}

/**
 * ALTERNATIVE: Multiple Choice Challenge Template
 */
export function createMultipleChoiceTemplate(difficulty) {
  const params = getDifficultyParams('logic', difficulty);
  const challengeData = generateMultipleChoiceData(params);
  
  return {
    id: 'multiple-choice-example',
    category: 'logic',
    difficulty: difficulty,
    title: 'Choose the Correct Answer',
    correctAnswer: challengeData.correctIndex,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="challenge-question">
          <p>${challengeData.question}</p>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="choices-grid">
          ${challengeData.choices.map((choice, index) => `
            <button class="choice-btn" data-index="${index}">
              ${choice}
            </button>
          `).join('')}
        </div>
      `;
      
      this.setupChoiceListeners(answerContainer);
    },
    
    setupChoiceListeners(answerContainer) {
      const choices = answerContainer.querySelectorAll('.choice-btn');
      
      choices.forEach((btn) => {
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

function generateMultipleChoiceData(params) {
  return {
    question: 'What is 2 + 2?',
    choices: ['3', '4', '5', '6'],
    correctIndex: 1
  };
}

/**
 * ALTERNATIVE: Interactive/Drag-Drop Challenge Template
 */
export function createInteractiveTemplate(difficulty) {
  const params = getDifficultyParams('puzzle', difficulty);
  let selectedItems = [];
  
  return {
    id: 'interactive-example',
    category: 'puzzle',
    difficulty: difficulty,
    title: 'Drag Items to Sort',
    correctAnswer: [0, 2, 4], // Example: indices of correct items
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="challenge-question">
          <p>Click all even numbers</p>
        </div>
        <div class="interactive-items">
          ${[1, 2, 3, 4, 5].map((num, index) => `
            <div class="draggable-item" data-value="${num}" data-index="${index}">
              ${num}
            </div>
          `).join('')}
        </div>
      `;
      
      answerContainer.innerHTML = `
        <button id="submit-btn" class="btn btn-primary">Submit</button>
      `;
      
      this.setupInteractiveListeners(contentContainer, answerContainer);
    },
    
    setupInteractiveListeners(contentContainer, answerContainer) {
      const items = contentContainer.querySelectorAll('.draggable-item');
      const submitBtn = answerContainer.querySelector('#submit-btn');
      
      selectedItems = [];
      
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.index);
          const value = parseInt(item.dataset.value);
          
          if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            selectedItems = selectedItems.filter(i => i !== index);
          } else {
            item.classList.add('selected');
            selectedItems.push(index);
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
      if (!Array.isArray(answer)) return false;
      return JSON.stringify(answer.sort()) === JSON.stringify(this.correctAnswer.sort());
    },
    
    cleanup() {
      selectedItems = [];
    }
  };
}