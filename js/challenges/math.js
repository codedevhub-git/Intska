/**
 * Math Challenges
 * 1. Simple Arithmetic
 * 2. Division
 * 3. Fraction Comparison
 * 4. Word Problems
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice } from '../utils/random.js';
import { validateNumber, validateComparison, parseNumericInput } from '../utils/validators.js';

/**
 * 1. Simple Arithmetic Challenge
 */
export function createArithmeticChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const operation = randomChoice(params.operations);
  
  let num1, num2, answer, question;
  
  switch (operation) {
    case '+':
      num1 = randomInt(params.minNumber, params.maxNumber);
      num2 = randomInt(params.minNumber, params.maxNumber);
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
      
    case '-':
      num1 = randomInt(params.minNumber, params.maxNumber);
      num2 = randomInt(params.minNumber, num1); // Ensure positive result
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
      
    case '*':
      num1 = randomInt(2, Math.min(12, params.maxNumber / 2));
      num2 = randomInt(2, Math.min(12, params.maxNumber / 2));
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
      
    case '/':
      // Division handled by separate challenge
      num2 = randomInt(2, 10);
      answer = randomInt(2, params.maxNumber / num2);
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2}`;
      break;
  }
  
  return {
    id: 'arithmetic',
    category: 'math',
    difficulty: difficulty,
    title: 'Solve',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="math-question">
          <div class="math-expression">${question} = ?</div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Answer"
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
        const answer = parseNumericInput(input.value);
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
      console.log('Arithmetic check:', {
        playerAnswer: answer,
        correctAnswer: this.correctAnswer,
        type: typeof answer,
        parsed: parseNumericInput(answer)
      });
      return validateNumber(answer, this.correctAnswer);
    },
    
    cleanup() {}
  };
}

/**
 * 2. Division Challenge (always whole numbers)
 */
export function createDivisionChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  
  const divisor = randomInt(2, params.divisorMax);
  const quotient = randomInt(2, Math.floor(params.maxNumber / divisor));
  const dividend = divisor * quotient;
  
  return {
    id: 'division',
    category: 'math',
    difficulty: difficulty,
    title: 'Division',
    correctAnswer: quotient,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="math-question">
          <div class="math-expression">${dividend} ÷ ${divisor} = ?</div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Answer"
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
        const answer = parseNumericInput(input.value);
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
 * 3. Fraction Comparison Challenge
 */
export function createFractionComparisonChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  
  const num1 = randomInt(1, params.maxDenominator - 1);
  const den1 = randomInt(num1 + 1, params.maxDenominator);
  
  const num2 = randomInt(1, params.maxDenominator - 1);
  const den2 = randomInt(num2 + 1, params.maxDenominator);
  
  const val1 = num1 / den1;
  const val2 = num2 / den2;
  
  let correctAnswer;
  if (val1 < val2) correctAnswer = '<';
  else if (val1 > val2) correctAnswer = '>';
  else correctAnswer = '=';
  
  return {
    id: 'fraction-comparison',
    category: 'math',
    difficulty: difficulty,
    title: 'Compare Fractions',
    correctAnswer: correctAnswer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="fraction-comparison">
          <div class="fraction">
            <div class="numerator">${num1}</div>
            <div class="fraction-bar"></div>
            <div class="denominator">${den1}</div>
          </div>
          <div class="comparison-symbol">?</div>
          <div class="fraction">
            <div class="numerator">${num2}</div>
            <div class="fraction-bar"></div>
            <div class="denominator">${den2}</div>
          </div>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <div class="comparison-buttons">
          <button class="choice-btn" data-value="<">&lt;</button>
          <button class="choice-btn" data-value="=">=</button>
          <button class="choice-btn" data-value=">">&gt;</button>
        </div>
      `;
      
      this.setupEventListeners(answerContainer);
    },
    
    setupEventListeners(answerContainer) {
      const buttons = answerContainer.querySelectorAll('.choice-btn');
      
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const answer = btn.dataset.value;
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
 * 4. Word Problem Challenge
 */
export function createWordProblemChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  
  const templates = [
    {
      text: (name, item, price, quantity) => 
        `${name} buys ${quantity} ${item}${quantity > 1 ? 's' : ''} for $${price} each. How much total?`,
      calculate: (price, quantity) => price * quantity
    },
    {
      text: (name, item, total, removed) =>
        `A ${item} has ${total} items. You remove ${removed}. How many are left?`,
      calculate: (total, removed) => total - removed
    },
    {
      text: (name, item, perDay, days) =>
        `${name} earns $${perDay} per day. How much in ${days} days?`,
      calculate: (perDay, days) => perDay * days
    },
    {
      text: (name, item, total, people) =>
        `${total} ${item}s are shared equally among ${people} people. How many each?`,
      calculate: (total, people) => total / people
    }
  ];
  
  const template = randomChoice(templates);
  const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor'];
  const items = ['apple', 'book', 'cookie', 'pencil', 'sticker', 'toy'];
  
  const name = randomChoice(names);
  const item = randomChoice(items);
  
  let num1, num2, answer, problemText;
  
  if (template.calculate.length === 2) {
    num1 = randomInt(params.minNumber, Math.min(params.maxNumber, 20));
    
    if (template.text.toString().includes('shared equally')) {
      // Ensure division results in whole number
      const divisor = randomInt(2, 10);
      num2 = divisor;
      const quotient = randomInt(2, 15);
      num1 = divisor * quotient;
      answer = quotient;
    } else {
      num2 = randomInt(params.minNumber, Math.min(params.maxNumber, 20));
      answer = template.calculate(num1, num2);
    }
    
    problemText = template.text(name, item, num1, num2);
  }
  
  return {
    id: 'word-problem',
    category: 'math',
    difficulty: difficulty,
    title: 'Word Problem',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <div class="word-problem">
          <p class="problem-text">${problemText}</p>
        </div>
      `;
      
      answerContainer.innerHTML = `
        <input 
          type="number" 
          id="answer-input" 
          class="answer-input"
          placeholder="Answer"
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
        const answer = parseNumericInput(input.value);
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
 * Register all math challenges
 */
import { registerChallenge } from './registry.js';

// Register all 4 math challenges check
registerChallenge('arithmetic', 'math', createArithmeticChallenge, {
  name: 'Arithmetic',
  description: 'Basic math operations',
  minDifficulty: 1
});

registerChallenge('division', 'math', createDivisionChallenge, {
  name: 'Division',
  description: 'Whole number division',
  minDifficulty: 3
});

registerChallenge('fraction-comparison', 'math', createFractionComparisonChallenge, {
  name: 'Fraction Comparison',
  description: 'Compare two fractions',
  minDifficulty: 1
});

registerChallenge('word-problem', 'math', createWordProblemChallenge, {
  name: 'Word Problem',
  description: 'Solve math word problems',
  minDifficulty: 1
});