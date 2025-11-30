/**
 * LocalStorage wrapper for game data persistence
 * Handles scores, stats, rank, and game history
 */

const STORAGE_KEY = 'brainChallengeData';

/**
 * Default data structure
 */
const defaultData = {
  highScore: 0,
  totalGames: 0,
  rank: 'Beginner',
  stats: {
    totalCorrect: 0,
    totalAttempts: 0,
    accuracy: 0,
    avgScorePerGame: 0,
    favoriteCategory: null,
    currentStreak: 0,
    bestStreak: 0
  },
  categoryStats: {
    math: { correct: 0, attempts: 0 },
    logic: { correct: 0, attempts: 0 },
    memory: { correct: 0, attempts: 0 },
    puzzle: { correct: 0, attempts: 0 }
  },
  history: [] // Last 10 games
};

/**
 * Rank thresholds based on high score
 */
const RANK_THRESHOLDS = {
  0: 'Beginner',
  10: 'Novice',
  25: 'Skilled',
  50: 'Expert',
  100: 'Master',
  200: 'Legend'
};

/**
 * Get all data from localStorage
 */
export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...defaultData };
    }
    
    const data = JSON.parse(stored);
    // Merge with defaults in case new fields were added
    return {
      ...defaultData,
      ...data,
      stats: { ...defaultData.stats, ...data.stats },
      categoryStats: { ...defaultData.categoryStats, ...data.categoryStats }
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { ...defaultData };
  }
}

/**
 * Save data to localStorage
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

/**
 * Calculate rank based on high score
 */
export function calculateRank(score) {
  const thresholds = Object.keys(RANK_THRESHOLDS)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (score >= threshold) {
      return RANK_THRESHOLDS[threshold];
    }
  }
  
  return RANK_THRESHOLDS[0];
}

/**
 * Update stats after game ends
 */
export function updateGameStats(score, correctAnswers, totalAnswers, categoryBreakdown) {
  const data = loadData();
  
  // Update high score
  if (score > data.highScore) {
    data.highScore = score;
  }
  
  // Update rank
  data.rank = calculateRank(data.highScore);
  
  // Update total games
  data.totalGames++;
  
  // Update stats
  data.stats.totalCorrect += correctAnswers;
  data.stats.totalAttempts += totalAnswers;
  data.stats.accuracy = Math.round((data.stats.totalCorrect / data.stats.totalAttempts) * 100);
  data.stats.avgScorePerGame = Math.round(
    ((data.stats.avgScorePerGame * (data.totalGames - 1)) + score) / data.totalGames
  );
  
  // Update current streak
  if (score > 0) {
    data.stats.currentStreak++;
    if (data.stats.currentStreak > data.stats.bestStreak) {
      data.stats.bestStreak = data.stats.currentStreak;
    }
  } else {
    data.stats.currentStreak = 0;
  }
  
  // Update category stats
  if (categoryBreakdown) {
    for (const [category, stats] of Object.entries(categoryBreakdown)) {
      if (data.categoryStats[category]) {
        data.categoryStats[category].correct += stats.correct;
        data.categoryStats[category].attempts += stats.attempts;
      }
    }
  }
  
  // Calculate favorite category
  let bestCategory = null;
  let bestAccuracy = 0;
  
  for (const [category, stats] of Object.entries(data.categoryStats)) {
    if (stats.attempts > 0) {
      const accuracy = stats.correct / stats.attempts;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestCategory = category;
      }
    }
  }
  
  data.stats.favoriteCategory = bestCategory;
  
  // Update history (keep last 10 games)
  data.history.unshift({
    date: new Date().toISOString(),
    score: score,
    correct: correctAnswers,
    total: totalAnswers
  });
  
  if (data.history.length > 10) {
    data.history = data.history.slice(0, 10);
  }
  
  saveData(data);
  return data;
}

/**
 * Get current stats
 */
export function getStats() {
  return loadData();
}

/**
 * Reset all data
 */
export function resetData() {
  const confirmed = confirm('Are you sure you want to reset all data? This cannot be undone.');
  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
  return false;
}

/**
 * Export data as JSON (for backup)
 */
export function exportData() {
  const data = loadData();
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `brain-challenge-backup-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveData(data);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Get rank color for UI
 */
export function getRankColor(rank) {
  const colors = {
    'Beginner': '#9E9E9E',
    'Novice': '#8BC34A',
    'Skilled': '#4CAF50',
    'Expert': '#2196F3',
    'Master': '#9C27B0',
    'Legend': '#FF9800'
  };
  
  return colors[rank] || colors['Beginner'];
}

/**
 * Get next rank info
 */
export function getNextRank(currentScore) {
  const thresholds = Object.keys(RANK_THRESHOLDS)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const threshold of thresholds) {
    if (currentScore < threshold) {
      return {
        rank: RANK_THRESHOLDS[threshold],
        scoreNeeded: threshold - currentScore,
        threshold: threshold
      };
    }
  }
  
  return null; // Already at max rank
}