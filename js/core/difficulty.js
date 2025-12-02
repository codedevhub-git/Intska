/**
 * Difficulty scaling system
 * Centralizes all difficulty parameters for each challenge type
 */

/**
 * Get difficulty parameters for a specific challenge type
 * @param {string} challengeType - 'math', 'logic', 'memory', 'puzzle'
 * @param {number} difficulty - Current difficulty level (starts at 1, increases per correct answer)
 */
export function getDifficultyParams(challengeType, difficulty) {
  const configs = {
    math: getMathDifficulty(difficulty),
    logic: getLogicDifficulty(difficulty),
    memory: getMemoryDifficulty(difficulty),
    puzzle: getPuzzleDifficulty(difficulty)
  };
  
  return configs[challengeType] || configs.math;
}

/**
 * Math challenge difficulty
 */
function getMathDifficulty(level) {
  return {
    // Number ranges
    minNumber: Math.max(1, level),
    maxNumber: 10 + (level * 5),
    
    // Operations (unlock as difficulty increases)
    operations: getOperations(level),
    
    // Word problem complexity
    wordProblemSteps: Math.min(1 + Math.floor(level / 5), 3),
    
    // Fraction denominators
    maxDenominator: Math.min(5 + level, 20),
    
    // Division (always whole numbers)
    divisorMax: Math.min(5 + level, 15),
    
    // Time limit (decreases with difficulty)
    timeLimit: Math.max(8, 15 - Math.floor(level / 3))
  };
}

/**
 * Logic challenge difficulty
 */
function getLogicDifficulty(level) {
  return {
    // Sequence complexity
    sequenceLength: 4 + Math.floor(level / 2),
    sequenceStep: 1 + Math.floor(level / 3),
    
    // Pattern complexity (how many rules)
    patternRules: Math.min(1 + Math.floor(level / 4), 3),
    
    // Odd one out - number of items to choose from
    itemCount: Math.min(4 + Math.floor(level / 2), 12),
    
    // True/false logic layers
    logicLayers: Math.min(1 + Math.floor(level / 3), 4),
    
    // Spatial reasoning grid size
    gridSize: Math.min(3 + Math.floor(level / 4), 6),
    
    // Multiple choice options
    choiceCount: Math.min(3 + Math.floor(level / 5), 6),
    
    // Time limit
    timeLimit: Math.max(10, 20 - Math.floor(level / 2))
  };
}

/**
 * Memory challenge difficulty
 */
function getMemoryDifficulty(level) {
  return {
    // Color sequence length
    sequenceLength: 3 + Math.floor(level / 2),
    
    // Flash speed (ms per item)
    flashSpeed: Math.max(300, 800 - (level * 30)),
    
    // Grid size for pattern memory
    gridRows: Math.min(3 + Math.floor(level / 3), 6),
    gridCols: Math.min(3 + Math.floor(level / 3), 6),
    
    // Number of active cells in grid
    activeCells: Math.min(3 + level, 20),
    
    // Pattern matching - number of unique items
    uniqueItems: Math.min(4 + Math.floor(level / 2), 10),
    
    // Total items to search through
    totalItems: Math.min(12 + (level * 2), 50),
    
    // Number of matches to find
    matchesToFind: Math.min(1 + Math.floor(level / 5), 5),
    
    // Time limit
    timeLimit: Math.max(15, 25 - Math.floor(level / 2))
  };
}

/**
 * Puzzle challenge difficulty
 */
function getPuzzleDifficulty(level) {
  return {
    // Drag-drop sorting - number of items
    itemCount: Math.min(4 + level, 15),
    
    // Categories (2 = binary sort, increases to 3-4)
    categoryCount: Math.min(2 + Math.floor(level / 8), 4),
    
    // Tile shuffle grid size
    tileGridSize: Math.min(3 + Math.floor(level / 5), 5),
    
    // Cup shuffle
    cupCount: Math.min(3 + Math.floor(level / 4), 7),
    shuffleMoves: Math.min(3 + level, 15),
    shuffleSpeed: Math.max(300, 800 - (level * 25)),
    
    // Water levels - containers
    containerCount: Math.min(3 + Math.floor(level / 3), 8),
    
    // Shape rotation precision (degrees tolerance)
    rotationTolerance: Math.max(5, 15 - level),
    
    // Word unscramble
    wordLength: Math.min(4 + Math.floor(level / 3), 10),
    
    // Cube counting
    cubeStackSize: Math.min(3 + Math.floor(level / 2), 8),
    
    // Same game (color cluster)
    colorCount: Math.min(3 + Math.floor(level / 4), 6),
    gridSize: Math.min(8 + Math.floor(level / 3), 15),
    
    // Time limit
    timeLimit: Math.max(12, 20 - Math.floor(level / 2))
  };
}

/**
 * Get available operations based on difficulty
 */
function getOperations(level) {
  if (level < 3) return ['+', '-'];
  if (level < 6) return ['+', '-', '*'];
  return ['+', '-', '*', '/'];
}

// In core/difficulty.js

/**
 * Get timer reduction per difficulty level
 */
export function getTimerReduction(difficulty) {
  // Reduces by 0.5 seconds every 3 levels (this logic remains the same)
  return Math.floor(difficulty / 3) * 0.5;
}

/**
 * Calculate challenge timer based on its static base time and difficulty reduction.
 * @param {number} challengeBaseTime - The fixed, non-scaling base time for this specific challenge (e.g., 60 seconds).
 * @param {number} difficulty - The current difficulty level.
 * @returns {number} The actual time limit for the challenge in seconds.
 */
export function getBaseTimer(challengeBaseTime, difficulty) {
  const reduction = getTimerReduction(difficulty);
  const calculatedTime = challengeBaseTime - reduction;

  // Set a hard minimum time limit (e.g., 5 seconds) to prevent impossible challenges
  return Math.max(calculatedTime, 5); 
}

// NOTE: The previous logic in getBaseTimer which relied on getDifficultyParams
// and params.timeLimit is now obsolete.

/**
 * Check if new challenge types should unlock
 */
export function shouldUnlockChallenges(difficulty) {
  const unlocks = {
    5: ['division', 'spatial-reasoning'],
    10: ['word-unscramble', 'cube-counting'],
    15: ['same-game', 'complex-logic'],
    20: ['all-advanced']
  };
  
  return unlocks[difficulty] || [];
}

/**
 * Get difficulty label for UI
 */
export function getDifficultyLabel(difficulty) {
  if (difficulty < 5) return 'Easy';
  if (difficulty < 10) return 'Medium';
  if (difficulty < 20) return 'Hard';
  if (difficulty < 30) return 'Expert';
  return 'Insane';
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty) {
  if (difficulty < 5) return '#4CAF50';   // Green
  if (difficulty < 10) return '#8BC34A';  // Light green
  if (difficulty < 20) return '#FF9800';  // Orange
  if (difficulty < 30) return '#F44336';  // Red
  return '#9C27B0';                        // Purple
}

/**
 * Adjust timer based on performance
 * Bonus time for fast correct answers
 */
export function calculateTimerBonus(timeRemaining, baseTime) {
  const percentRemaining = (timeRemaining / baseTime) * 100;
  
  if (percentRemaining > 75) {
    return 2; // +2 seconds bonus
  }
  if (percentRemaining > 50) {
    return 1; // +1 second bonus
  }
  
  return 0;
}