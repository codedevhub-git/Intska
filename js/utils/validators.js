/**
 * Answer validation helpers
 * Used to check player responses across different challenge types
 */

export function validateNumber(answer, correct, tolerance = 0.01) {
  const numAnswer = Number(answer);
  const numCorrect = Number(correct);
  
  console.log('Validating:', {
    answer,
    correct,
    numAnswer,
    numCorrect,
    isNaN: isNaN(numAnswer),
    diff: Math.abs(numAnswer - numCorrect)
  });
  
  if (isNaN(numAnswer) || isNaN(numCorrect)) {
    return false;
  }
  
  return Math.abs(numAnswer - numCorrect) <= tolerance;
}

/**
 * Check if string answer is correct (case-insensitive, trimmed)
 */
export function validateString(answer, correct, caseSensitive = false) {
  const strAnswer = String(answer).trim();
  const strCorrect = String(correct).trim();
  
  if (caseSensitive) {
    return strAnswer === strCorrect;
  }
  
  return strAnswer.toLowerCase() === strCorrect.toLowerCase();
}

/**
 * Check if arrays are equal (order matters)
 */
export function validateArray(answer, correct) {
  if (!Array.isArray(answer) || !Array.isArray(correct)) {
    return false;
  }
  
  if (answer.length !== correct.length) {
    return false;
  }
  
  return answer.every((val, idx) => val === correct[idx]);
}

/**
 * Check if arrays contain same elements (order doesn't matter)
 */
export function validateSet(answer, correct) {
  if (!Array.isArray(answer) || !Array.isArray(correct)) {
    return false;
  }
  
  if (answer.length !== correct.length) {
    return false;
  }
  
  const sortedAnswer = [...answer].sort();
  const sortedCorrect = [...correct].sort();
  
  return sortedAnswer.every((val, idx) => val === sortedCorrect[idx]);
}

/**
 * Validate comparison operator answer
 */
export function validateComparison(value1, value2, operator) {
  switch (operator) {
    case '<':
    case 'less':
      return value1 < value2;
    case '>':
    case 'greater':
      return value1 > value2;
    case '=':
    case 'equal':
      return value1 === value2;
    default:
      return false;
  }
}

/**
 * Check if answer is within valid range
 */
export function validateRange(answer, min, max) {
  const num = Number(answer);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate multiple choice answer (index or value)
 */
export function validateChoice(answer, correct, choices = null) {
  // If answer is index
  if (typeof answer === 'number' && choices) {
    return choices[answer] === correct;
  }
  
  // If answer is direct value
  return answer === correct;
}

/**
 * Validate pattern match (for sequences, grids)
 */
export function validatePattern(answer, pattern) {
  if (answer.length !== pattern.length) {
    return false;
  }
  
  return answer.every((row, i) => {
    if (!Array.isArray(row) || !Array.isArray(pattern[i])) {
      return row === pattern[i];
    }
    return row.every((cell, j) => cell === pattern[i][j]);
  });
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  return String(input).trim().replace(/[^\w\s.-]/gi, '');
}

/**
 * Parse numeric input (handles fractions, decimals, negatives)
 */
export function parseNumericInput(input) {
  const sanitized = sanitizeInput(input);
  
  // Check for fraction (e.g., "3/4")
  if (sanitized.includes('/')) {
    const [num, den] = sanitized.split('/').map(Number);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
    return NaN;
  }
  
  return Number(sanitized);
}