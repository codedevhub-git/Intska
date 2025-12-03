/**
 * Math Challenges (VISUALLY ENHANCED + Shows Correct Answers)
 */

import { getDifficultyParams } from '../core/difficulty.js';
import { randomInt, randomChoice } from '../utils/random.js';
import { validateNumber } from '../utils/validators.js';
import { registerChallenge } from './registry.js';

// --- 1. Enhanced Math Renderer with Beautiful Styling ---
function renderMath(latex) {
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

  // Enhanced Fallback with better styling
  let html = latex
    .replace(/\\div/g, '÷')
    .replace(/\\times/g, '×')
    .replace(/\\,/g, ' ')
    .replace(/\\quad/g, '<span style="display:inline-block; width:20px"></span>')
    .replace(/\\boxed{\?}/g, '<span class="math-box">?</span>');

  html = html.replace(/\\frac{([0-9]+)}{([0-9]+)}/g, (match, num, den) => {
    return `
      <span class="math-fraction">
        <span class="math-num">${num}</span>
        <span class="math-den">${den}</span>
      </span>
    `;
  });

  const fallbackStyles = `
    <style>
      .math-fallback { 
        font-size: 2.8rem; 
        font-family: 'SF Pro Display', -apple-system, sans-serif; 
        font-weight: 700; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 12px; 
        color: #1e293b;
        min-height: 100px;
        padding: 20px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      .math-fraction { 
        display: inline-flex; 
        flex-direction: column; 
        text-align: center; 
        vertical-align: middle; 
        font-size: 0.9em; 
        margin: 0 10px; 
      }
      .math-num { 
        border-bottom: 3px solid #1e293b; 
        padding-bottom: 4px; 
        display: block; 
      }
      .math-den { 
        padding-top: 4px; 
        display: block; 
      }
      .math-box {
        border: 3px dashed #94a3b8;
        padding: 4px 16px;
        border-radius: 8px;
        color: #64748b;
        background: rgba(255,255,255,0.5);
      }
    </style>
  `;

  return `${fallbackStyles}<div class="math-fallback">${html}</div>`;
}

// --- 2. Enhanced Numpad with Better Visual Design ---
function createNumpad(container, onSubmit) {
  let currentValue = '';

  const styles = `
    <style>
      .math-display-area {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 16px;
        padding: 18px 20px;
        margin-bottom: 16px;
        text-align: right;
        font-family: 'SF Mono', 'Courier New', monospace;
        font-size: 2.2rem;
        min-height: 60px;
        color: white;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        overflow: hidden;
        font-weight: 700;
      }
      .math-numpad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
      }
      .num-btn {
        background: white;
        border: none;
        border-radius: 12px;
        padding: 16px 0;
        font-size: 1.4rem;
        font-weight: 700;
        color: #1e293b;
        cursor: pointer;
        box-shadow: 0 4px 0 #cbd5e1, 0 4px 12px rgba(0,0,0,0.1);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition: all 0.1s;
      }
      .num-btn:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 #cbd5e1, 0 2px 8px rgba(0,0,0,0.1);
      }
      .btn-submit { 
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white; 
        box-shadow: 0 4px 0 #047857, 0 4px 12px rgba(16, 185, 129, 0.3);
        font-size: 1.2rem;
      }
      .btn-submit:active {
        box-shadow: 0 0 0 #047857, 0 2px 8px rgba(16, 185, 129, 0.3);
      }
      .btn-clear { 
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white; 
        box-shadow: 0 4px 0 #b91c1c, 0 4px 12px rgba(239, 68, 68, 0.3);
      }
      .btn-clear:active {
        box-shadow: 0 0 0 #b91c1c, 0 2px 8px rgba(239, 68, 68, 0.3);
      }
      .btn-special {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 0 #1d4ed8, 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .btn-special:active {
        box-shadow: 0 0 0 #1d4ed8, 0 2px 8px rgba(59, 130, 246, 0.3);
      }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div class="math-display-area" id="calc-display">?</div>
    <div class="math-numpad">
      <button class="num-btn" data-val="7">7</button>
      <button class="num-btn" data-val="8">8</button>
      <button class="num-btn" data-val="9">9</button>
      
      <button class="num-btn" data-val="4">4</button>
      <button class="num-btn" data-val="5">5</button>
      <button class="num-btn" data-val="6">6</button>
      
      <button class="num-btn" data-val="1">1</button>
      <button class="num-btn" data-val="2">2</button>
      <button class="num-btn" data-val="3">3</button>
      
      <button class="num-btn btn-special" data-val=".">.</button>
      <button class="num-btn" data-val="0">0</button>
      <button class="num-btn btn-special" data-val="-">−</button>
      
      <button class="num-btn btn-clear" data-action="clear">C</button>
      <button class="num-btn btn-submit" data-action="submit" style="grid-column: span 2;">✓ Submit</button>
    </div>
  `;

  const display = container.querySelector('#calc-display');
  const buttons = container.querySelectorAll('.num-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const action = btn.dataset.action;

      if (val !== undefined) {
        if (val === '.' && currentValue.includes('.')) return;
        if (val === '-' && currentValue.length > 0) return;
        if (currentValue.length >= 10) return;
        
        currentValue += val;
        display.textContent = currentValue;
      } else if (action === 'clear') {
        currentValue = '';
        display.textContent = '?';
      } else if (action === 'submit') {
        if (currentValue === '' || currentValue === '.' || currentValue === '-') return;
        onSubmit(parseFloat(currentValue));
      }
    });
  });
}

// --- 3. Arithmetic Challenge (Enhanced) ---
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
    id: 'arithmetic', 
    category: 'math', 
    difficulty, 
    title: '🧮 Quick Math', 
    correctAnswer: answer,
    
    render(c, a) { 
      c.innerHTML = `
        <div style="padding: 20px;">
          ${renderMath(latexExpression)}
        </div>
      `; 
      createNumpad(a, v => window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: v } }))); 
    },
    check(a) { return validateNumber(a, this.correctAnswer); }, 
    cleanup() {}
  };
}

// --- 4. Division Challenge (Enhanced) ---
export function createDivisionChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const divisor = randomInt(2, params.divisorMax || 10);
  const quotient = randomInt(2, 12);
  const dividend = divisor * quotient;
  const useFraction = Math.random() > 0.5;
  const latexExpression = useFraction ? `\\frac{${dividend}}{${divisor}} = \\,?` : `${dividend} \\div ${divisor} = \\,?`;

  return {
    id: 'division', 
    category: 'math', 
    difficulty, 
    title: '➗ Division', 
    correctAnswer: quotient,
    
    render(c, a) { 
      c.innerHTML = `
        <div style="padding: 20px;">
          ${renderMath(latexExpression)}
        </div>
      `; 
      createNumpad(a, v => window.dispatchEvent(new CustomEvent('challengeAnswer', { detail: { answer: v } }))); 
    },
    check(a) { return validateNumber(a, this.correctAnswer); }, 
    cleanup() {}
  };
}

// --- 5. Fraction Comparison (Enhanced with Better Buttons) ---
export function createFractionComparisonChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  const den1 = randomInt(2, params.maxDenominator || 12);
  const num1 = randomInt(1, den1);
  const den2 = randomInt(2, params.maxDenominator || 12);
  const num2 = randomInt(1, den2);
  const val1 = num1/den1; 
  const val2 = num2/den2;
  const ans = Math.abs(val1 - val2) < 0.0001 ? '=' : (val1 < val2 ? '<' : '>'); 
  
  const latex = `\\frac{${num1}}{${den1}} \\quad \\boxed{?} \\quad \\frac{${num2}}{${den2}}`;

  return {
    id: 'fraction-comparison', 
    category: 'math', 
    difficulty, 
    title: '⚖️ Compare Fractions', 
    correctAnswer: ans,
    
    render(c, a) {
      c.innerHTML = `
        <div style="padding: 20px;">
          ${renderMath(latex)}
        </div>
      `;
      a.innerHTML = `
        <style>
          .comparison-btn {
            flex: 1;
            padding: 20px 0;
            font-size: 2rem;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            background: white;
            color: #1e293b;
            box-shadow: 0 4px 0 #cbd5e1, 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.1s;
            touch-action: manipulation;
          }
          .comparison-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0 0 #cbd5e1, 0 2px 8px rgba(0,0,0,0.1);
          }
        </style>
        <div style="display:flex; gap:12px; justify-content:center; width:100%; max-width:320px; margin:0 auto;">
          <button class="comparison-btn" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'<'}}))">&lt;</button>
          <button class="comparison-btn" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'='}}))">=</button>
          <button class="comparison-btn" onclick="window.dispatchEvent(new CustomEvent('challengeAnswer', {detail:{answer:'>'}}))">&gt;</button>
        </div>
      `;
    },
    check(a) { return a === this.correctAnswer; }, 
    cleanup() {}
  };
}

// --- 6. Word Problem (VISUALLY ENHANCED) ---
export function createWordProblemChallenge(difficulty) {
  const params = getDifficultyParams('math', difficulty);
  
  const templates = [
    {
      text: (name, item, price, quantity) => 
        `<div class="word-icon">🛒</div>
        <strong>${name}</strong> buys <span class="highlight">${quantity} ${item}${quantity > 1 ? 's' : ''}</span> for <span class="highlight-price">$${price}</span> each.
        <div class="question">What's the total cost?</div>`,
      calculate: (price, quantity) => price * quantity
    },
    {
      text: (name, item, total, removed) =>
        `<div class="word-icon">📦</div>
        A box has <span class="highlight">${total} ${item}s</span>.
        You take out <span class="highlight">${removed}</span>.
        <div class="question">How many are left?</div>`,
      calculate: (total, removed) => total - removed
    },
    {
      text: (name, item, perDay, days) =>
        `<div class="word-icon">💰</div>
        <strong>${name}</strong> earns <span class="highlight-price">$${perDay}</span> per day.
        <div class="question">How much in ${days} days?</div>`,
      calculate: (perDay, days) => perDay * days
    },
    {
      text: (name, item, total, people) =>
        `<div class="word-icon">🎁</div>
        <span class="highlight">${total} ${item}s</span> shared equally by <span class="highlight">${people} friends</span>.
        <div class="question">How many does each get?</div>`,
      calculate: (total, people) => total / people
    }
  ];
  
  const template = randomChoice(templates);
  const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Riley'];
  const items = ['apple', 'cookie', 'toy', 'book', 'candy'];
  
  const name = randomChoice(names);
  const item = randomChoice(items);
  
  let num1, num2, answer, problemText;
  
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
  
  return {
    id: 'word-problem',
    category: 'math',
    difficulty: difficulty,
    title: '📖 Word Problem',
    correctAnswer: answer,
    
    render(contentContainer, answerContainer) {
      contentContainer.innerHTML = `
        <style>
          .word-problem-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            font-size: 1.2rem;
            line-height: 1.8;
            color: #78350f;
            text-align: center;
            font-family: 'SF Pro Display', -apple-system, sans-serif;
          }
          .word-icon {
            font-size: 3rem;
            margin-bottom: 12px;
          }
          .highlight {
            background: rgba(251, 191, 36, 0.5);
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
            color: #92400e;
          }
          .highlight-price {
            background: rgba(34, 197, 94, 0.3);
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
            color: #14532d;
          }
          .question {
            margin-top: 16px;
            font-size: 1.3rem;
            font-weight: 700;
            color: #92400e;
          }
        </style>
        <div class="word-problem-card">
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

// --- Registration ---
registerChallenge('arithmetic', 'math', createArithmeticChallenge, { 
  name: 'Arithmetic', 
  description: 'Quick calculations', 
  minDifficulty: 1, 
  baseTime: 30 
});

registerChallenge('division', 'math', createDivisionChallenge, { 
  name: 'Division', 
  description: 'Divide numbers', 
  minDifficulty: 3, 
  baseTime: 40 
});

registerChallenge('fraction-comparison', 'math', createFractionComparisonChallenge, { 
  name: 'Fractions', 
  description: 'Compare fractions', 
  minDifficulty: 1, 
  baseTime: 35 
});

registerChallenge('word-problem', 'math', createWordProblemChallenge, { 
  name: 'Word Problems', 
  description: 'Story math', 
  minDifficulty: 1, 
  baseTime: 45 
});