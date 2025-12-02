/**
 * Math Challenges (Fixed: Bulletproof Rendering + Mobile Numpad)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice } from '../utils/random.js';
import { validateNumber } from '../utils/validators.js';
import { registerChallenge } from './registry.js';

// --- 1. Bulletproof Math Renderer ---
// If KaTeX fails to load (offline/mobile), this manual fallback takes over.
function renderMath(latex) {
  // Check if KaTeX is loaded and working
  if (window.katex) {
    try {
      return window.katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true
      });
    } catch (e) {
      console.warn("KaTeX error, using fallback", e);
    }
  }

  // FALLBACK: Manual HTML replacement for common symbols
  let html = latex
    .replace(/\\div/g, '÷')
    .replace(/\\times/g, '×')
    .replace(/\\,/g, ' ')
    .replace(/\\quad/g, '<span style="display:inline-block; width:20px"></span>')
    .replace(/\\boxed{\?}/g, '<span class="math-box">?</span>');

  // Manual Fraction Renderer: \frac{A}{B} -> HTML
  html = html.replace(/\\frac{([0-9]+)}{([0-9]+)}/g, (match, num, den) => {
    return `
      <span class="math-fraction">
        <span class="math-num">${num}</span>
        <span class="math-den">${den}</span>
      </span>
    `;
  });

  // CSS for the fallback (injected directly to ensure it works)
  const fallbackStyles = `
    <style>
      .math-fallback { 
        font-size: 2.2rem; 
        font-family: sans-serif; 
        font-weight: bold; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 8px; 
        color: #2c3e50;
        min-height: 80px;
      }
      .math-fraction { 
        display: inline-flex; 
        flex-direction: column; 
        text-align: center; 
        vertical-align: middle; 
        font-size: 0.85em; 
        margin: 0 8px; 
      }
      .math-num { 
        border-bottom: 2px solid currentColor; 
        padding-bottom: 2px; 
        display: block; 
      }
      .math-den { 
        padding-top: 2px; 
        display: block; 
      }
      .math-box {
        border: 2px dashed #bbb;
        padding: 2px 12px;
        border-radius: 6px;
        color: #888;
        background: rgba(0,0,0,0.05);
      }
    </style>
  `;

  return `${fallbackStyles}<div class="math-fallback">${html}</div>`;
}

// --- 2. Mobile Numpad ---
function createNumpad(container, onSubmit) {
  let currentValue = '';

  const styles = `
    <style>
      .math-display-area {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 15px;
        text-align: right;
        font-family: 'Courier New', monospace;
        font-size: 2.2rem;
        min-height: 60px;
        color: #333;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        overflow: hidden;
      }
      .math-numpad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        width: 100%;
        max-width: 400px; /* Constraints width for nice mobile layout */
        margin: 0 auto;
      }
      .num-btn {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 10px;
        padding: 15px 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #495057;
        cursor: pointer;
        box-shadow: 0 4px 0 #ced4da;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .num-btn:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 #ced4da;
      }
      .btn-submit { background-color: #2ecc71; color: white; border-color: #27ae60; box-shadow: 0 4px 0 #27ae60; }
      .btn-clear { background-color: #ff6b6b; color: white; border-color: #fa5252; box-shadow: 0 4px 0 #fa5252; }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div class="math-display-area" id="calc-display">?</div>
    <div class="math-numpad">
      <button class="num-btn" data-val="1">1</button>
      <button class="num-btn" data-val="2">2</button>
      <button class="num-btn" data-val="3">3</button>
      
      <button class="num-btn" data-val="4">4</button>
      <button class="num-btn" data-val="5">5</button>
      <button class="num-btn" data-val="6">6</button>
      
      <button class="num-btn" data-val="7">7</button>
      <button class="num-btn" data-val="8">8</button>
      <button class="num-btn" data-val="9">9</button>
      
      <button class="num-btn btn-clear" data-action="clear">C</button>
      <button class="num-btn" data-val="0">0</button>
      <button class="num-btn btn-submit" data-action="submit">↵</button>
    </div>
  `;

  const display = container.querySelector('#calc-display');
  const buttons = container.querySelectorAll('.num-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const action = btn.dataset.action;

      if (val !== undefined) {
        if (currentValue.length < 8) {
          currentValue += val;
          display.textContent = currentValue;
          display.style.color = "#333";
        }
      } else if (action === 'clear') {
        currentValue = '';
        display.textContent = '?';
        display.style.color = "#ccc";
      } else if (action === 'submit') {
        if (currentValue === '') return;
        onSubmit(parseInt(currentValue, 10));
      }
    });
  });
}

// ... (Create challenges using renderMath and createNumpad)

export function createArithmeticChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const operations = params.operations.filter(op => op !== '/');
  const operation = randomChoice(operations);
  
  let num1, num2, answer, latexExpression;
  
  switch (operation) {
    case '+':
      num1 = randomInt(params.minNumber, params.maxNumber);
      num2 = randomInt(params.minNumber, params.maxNumber);
      answer = num1 + num2;
      latexExpression = `${num1} + ${num2} = \\,?`;
      break;
    case '-':
      num1 = randomInt(params.minNumber, params.maxNumber);
      num2 = randomInt(params.minNumber, num1);
      answer = num1 - num2;
      latexExpression = `${num1} - ${num2} = \\,?`;
      break;
    case '*':
      const maxFactor = 12; 
      num1 = randomInt(2, maxFactor);
      num2 = randomInt(2, Math.max(2, Math.min(12, Math.floor(params.maxNumber / num1))));
      answer = num1 * num2;
      latexExpression = `${num1} \\times ${num2} = \\,?`;
      break;
  }
  
  return {
    id: 'arithmetic', category: 'math', difficulty, title: 'Solve', correctAnswer: answer,
    render(c, a) { c.innerHTML = `<div>${renderMath(latexExpression)}</div>`; createNumpad(a, v => window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: v } }))); },
    check(a) { return validateNumber(a, this.correctAnswer); }, cleanup() {}
  };
}

export function createDivisionChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const divisor = randomInt(2, params.divisorMax || 10);
  const quotient = randomInt(2, 12);
  const dividend = divisor * quotient;
  const useFraction = Math.random() > 0.5;
  const latexExpression = useFraction ? `\\frac{${dividend}}{${divisor}} = \\,?` : `${dividend} \\div ${divisor} = \\,?`;

  return {
    id: 'division', category: 'math', difficulty, title: 'Division', correctAnswer: quotient,
    render(c, a) { c.innerHTML = `<div>${renderMath(latexExpression)}</div>`; createNumpad(a, v => window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: v } }))); },
    check(a) { return validateNumber(a, this.correctAnswer); }, cleanup() {}
  };
}

export function createFractionComparisonChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const den1 = randomInt(2, params.maxDenominator || 12);
  const num1 = randomInt(1, den1);
  const den2 = randomInt(2, params.maxDenominator || 12);
  const num2 = randomInt(1, den2);
  const val1 = num1/den1; const val2 = num2/den2;
  const ans = Math.abs(val1 - val2) < 0.0001 ? '=' : (val1 < val2 ? '<' : '>'); 
  
  const latex = `\\frac{${num1}}{${den1}} \\quad \\boxed{?} \\quad \\frac{${num2}}{${den2}}`;

  return {
    id: 'fraction-comparison', category: 'math', difficulty, title: 'Compare', correctAnswer: ans,
    render(c, a) {
      c.innerHTML = `<div>${renderMath(latex)}</div>`;
      a.innerHTML = `
        <div style="display:flex; gap:10px; justify-content:center; width:100%; margin-top:10px;">
          <button class="num-btn" style="flex:1" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'<'}}))">&lt;</button>
          <button class="num-btn" style="flex:1" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'='}}))">=</button>
          <button class="num-btn" style="flex:1" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'>'}}))">&gt;</button>
        </div>`;
    },
    check(a) { return a === this.correctAnswer; }, cleanup() {}
  };
}

export function createWordProblemChallenge(difficulty) {
    // (Keep the existing Word Problem logic, it was fine, just use createNumpad)
    // ... Copy from previous response ...
     const params = getDifficultyParams('math', difficulty);
  
  const templates = [
    {
      text: (name, item, price, quantity) => 
        `${name} buys <b>${quantity}</b> ${item}${quantity > 1 ? 's' : ''} for <b>$${price}</b> each.<br>Total cost?`,
      calculate: (price, quantity) => price * quantity
    },
    {
      text: (name, item, total, removed) =>
        `A box has <b>${total}</b> ${item}s.<br>You take <b>${removed}</b>.<br>How many left?`,
      calculate: (total, removed) => total - removed
    },
    {
      text: (name, item, perDay, days) =>
        `${name} earns <b>$${perDay}</b>/day.<br>Total in <b>${days}</b> days?`,
      calculate: (perDay, days) => perDay * days
    },
    {
      text: (name, item, total, people) =>
        `<b>${total}</b> ${item}s shared by <b>${people}</b> friends.<br>How many each?`,
      calculate: (total, people) => total / people
    }
  ];
  
  const template = randomChoice(templates);
  const names = ['Alex', 'Sam', 'Jo', 'Max'];
  const items = ['apple', 'book', 'toy', 'pen'];
  
  const name = randomChoice(names);
  const item = randomChoice(items);
  
  let num1, num2, answer, problemText;
  
  if (template.calculate.length === 2) {
    num1 = randomInt(params.minNumber, Math.min(params.maxNumber, 20));
    
    if (template.text.toString().includes('shared')) {
      const divisor = randomInt(2, 9);
      num2 = divisor;
      const quotient = randomInt(2, 10);
      num1 = divisor * quotient;
      answer = quotient;
    } else {
      num2 = randomInt(2, 10); 
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
        <div style="
          padding: 15px; 
          font-size: 1.3rem; 
          line-height: 1.5; 
          color: #2c3e50; 
          text-align: center;
          font-family: sans-serif;">
          ${problemText}
        </div>
      `;
      createNumpad(answerContainer, (val) => {
        window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: val } }));
      });
    },
    
    check(answer) { return validateNumber(answer, this.correctAnswer); },
    cleanup() {}
  };
}

registerChallenge('arithmetic', 'math', createArithmeticChallenge, { name: 'Arithmetic', description: 'Solve', minDifficulty: 1, baseTime: 30 });
registerChallenge('division', 'math', createDivisionChallenge, { name: 'Division', description: 'Divide', minDifficulty: 3, baseTime: 40 });
registerChallenge('fraction-comparison', 'math', createFractionComparisonChallenge, { name: 'Fractions', description: 'Compare', minDifficulty: 1, baseTime: 35 });
registerChallenge('word-problem', 'math', createWordProblemChallenge, { name: 'Word Problems', description: 'Solve', minDifficulty: 1, baseTime: 45 });