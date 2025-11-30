/**
 * Random utility functions
 * Used across all challenge types for randomization
 */

/**
 * Get random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random float between min and max
 */
export function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Pick random element from array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick multiple random elements from array (no duplicates)
 */
export function randomChoices(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate array of unique random integers
 */
export function uniqueRandomInts(min, max, count) {
  if (count > (max - min + 1)) {
    throw new Error('Count cannot exceed range size');
  }
  
  const numbers = [];
  while (numbers.length < count) {
    const num = randomInt(min, max);
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

/**
 * Random boolean with optional probability
 */
export function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate random color (hex)
 */
export function randomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#52B788', '#E63946', '#457B9D', '#E76F51'
  ];
  return randomChoice(colors);
}

/**
 * Generate array of distinct colors
 */
export function generateColors(count) {
  const baseColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#52B788', '#E63946', '#457B9D', '#E76F51',
    '#06FFA5', '#FFBE0B', '#FB5607', '#8338EC'
  ];
  
  if (count <= baseColors.length) {
    return randomChoices(baseColors, count);
  }
  
  // If need more colors, repeat with variations
  return Array.from({ length: count }, () => randomColor());
}

/**
 * Random position within bounds (for drag-drop, animations)
 */
export function randomPosition(maxWidth, maxHeight, padding = 0) {
  return {
    x: randomInt(padding, maxWidth - padding),
    y: randomInt(padding, maxHeight - padding)
  };
}