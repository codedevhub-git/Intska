/**
 * Game Engine - Main game loop and state management
 */

import { registry } from '../challenges/registry.js';
import { getDifficultyParams, getBaseTimer } from './difficulty.js';
import { updateGameStats } from '../storage.js';

export class GameEngine {
  constructor() {
    this.state = this.getInitialState();
    this.currentChallenge = null;
    this.eventHandlers = {};
  }

  /**
   * Initial game state
   */
  getInitialState() {
    return {
      isPlaying: false,
      isPaused: false,
      
      // Player stats
      lives: 5,
      maxLives: 5,
      score: 0,
      winStreak: 0,
      
      // Difficulty
      difficulty: 1,
      
      // Challenge tracking
      currentChallengeType: null,
      totalChallenges: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      
      // Category breakdown for stats
      categoryStats: {
        math: { correct: 0, attempts: 0 },
        logic: { correct: 0, attempts: 0 },
        memory: { correct: 0, attempts: 0 },
        puzzle: { correct: 0, attempts: 0 }
      },
      
      // Timer
      timeRemaining: 0,
      baseTime: 20,
      timerInterval: null,
      
      // Game started timestamp
      startTime: null
    };
  }

  /**
   * Start new game
   */
  startGame() {
    this.state = this.getInitialState();
    this.state.isPlaying = true;
    this.state.startTime = Date.now();
    
    this.emit('gameStart', this.state);
    this.nextChallenge();
  }



/**
 * DEBUGGING: Load next challenge with optional forced challenge ID and difficulty
*/

// async nextChallenge() {
//     if (!this.state.isPlaying) return;

//     // SAFEGUARD: Don't load new challenge if no lives left
//     if (this.state.lives <= 0) {
//       this.endGame();
//       return;
//     }

//     // Clean up previous challenge
//     if (this.currentChallenge && this.currentChallenge.cleanup) {
//       this.currentChallenge.cleanup();
//     }

//     // Stop existing timer
//     this.stopTimer();

//     try {


//       // ============================================================
//       // 🛠️ DEBUG CONFIGURATION  Water Levels
//       // Change 'active' to true to force a specific game/level
//       // ============================================================
//       const debugConfig = {
//         active: true,           // <--- Set to TRUE to enable
//         id: 'number-grid',       // ID of the game you want to test
//         forceDifficulty: 1     // Set a number to force level, or null to keep natural progression
//       };
//       // ============================================================

//       let challengeFactory;
//       console.log('challage registry:', registry.challenges);
//       // Logic to choose between Debug or Random
//       if (debugConfig.active && debugConfig.id) {
//         if (registry.hasChallenge(debugConfig.id)) {
//           console.log(`🐞 DEBUG MODE: Forcing challenge "${debugConfig.id}"`);
          
//           // Get the specific challenge directly from the registry map
//           challengeFactory = registry.challenges.get(debugConfig.id); //

//           // Override difficulty if set
//           if (debugConfig.forceDifficulty !== null) {
//             this.state.difficulty = debugConfig.forceDifficulty;
//             console.log(`🐞 DEBUG MODE: Forcing difficulty to Level ${this.state.difficulty}`);
//           }
//         } else {
//           console.error(`❌ Debug Error: Challenge ID "${debugConfig.id}" not found. Falling back to random.`);
//           challengeFactory = registry.getRandomChallenge(this.state.difficulty); 
//         }
//       } else {
//         // Standard Behavior: Get random challenge
//         challengeFactory = registry.getRandomChallenge(this.state.difficulty); 
//       }
      
//       // ------------------------------------------------------------
//       // The rest of the function remains the same...
//       // ------------------------------------------------------------

//       // 2. Extract the specific challenge base time from the metadata
//       const challengeBaseTime = challengeFactory.metadata.baseTime;

//       // 3. INSTANTIATE the actual challenge object using the factory function
//       this.currentChallenge = challengeFactory.factory(this.state.difficulty); 

//       // 4. Update state
//       this.state.currentChallengeType = this.currentChallenge.category;
//       this.state.totalChallenges++;

//       // 5. Get the scaled timer for this challenge using its specific base time
//       this.state.baseTime = getBaseTimer(
//         challengeBaseTime, 
//         this.state.difficulty
//       );
//       this.state.timeRemaining = this.state.baseTime;

//       // Emit challenge ready event
//       this.emit('challengeReady', {
//         challenge: this.currentChallenge,
//         difficulty: this.state.difficulty,
//         timeLimit: this.state.baseTime
//       });

//       // ADD DELAY - Give 2.5 seconds to read instructions before timer starts
//       await new Promise(resolve => setTimeout(resolve, 2500));

//       // Start timer AFTER delay
//       this.startTimer();

//     } catch (error) {
//       console.error('Error loading challenge:', error);
//       this.endGame();
//     }
// }



/**
 * Load next random challenge
 */
async nextChallenge() {
  if (!this.state.isPlaying) return;
  
  // SAFEGUARD: Don't load new challenge if no lives left
  if (this.state.lives <= 0) {
    this.endGame();
    return;
  }

  // Clean up previous challenge
  if (this.currentChallenge && this.currentChallenge.cleanup) {
    this.currentChallenge.cleanup();
  }

  // Stop existing timer
  this.stopTimer();

  try {
    // 1. Get random challenge FACTORY from registry (includes metadata)
    const challengeFactory = registry.getRandomChallenge(this.state.difficulty); 
    
    // 2. Extract the specific challenge base time from the metadata
    const challengeBaseTime = challengeFactory.metadata.baseTime;

    // 3. INSTANTIATE the actual challenge object using the factory function
    // The previous code was missing this crucial step!
    this.currentChallenge = challengeFactory.factory(this.state.difficulty); 

    // 4. Update state
    this.state.currentChallengeType = this.currentChallenge.category;
    this.state.totalChallenges++;

    // 5. Get the scaled timer for this challenge using its specific base time
    this.state.baseTime = getBaseTimer(
      challengeBaseTime, // <-- NOW PASSING THE CHALLENGE'S SPECIFIC BASE TIME (e.g., 60s)
      this.state.difficulty
    );
    this.state.timeRemaining = this.state.baseTime;

    // Emit challenge ready event
    this.emit('challengeReady', {
      challenge: this.currentChallenge, // Now correctly emitting the INSTANCE
      difficulty: this.state.difficulty,
      timeLimit: this.state.baseTime
    });

    // ADD DELAY - Give 2.5 seconds to read instructions before timer starts
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Start timer AFTER delay
    this.startTimer();

  } catch (error) {
    console.error('Error loading challenge:', error);
    this.endGame();
  }
}

/**
 * Start countdown timer
 */
startTimer() {
  this.stopTimer(); // Clear any existing timer

  this.state.timerInterval = setInterval(() => {
    // Stop if game ended
    if (!this.state.isPlaying || this.state.lives <= 0) {
      this.stopTimer();
      return;
    }
    
    this.state.timeRemaining -= 0.1;

    if (this.state.timeRemaining <= 0) {
      this.state.timeRemaining = 0;
      this.stopTimer(); // Stop timer before handling timeout
      this.handleTimeout();
      return;
    }

    this.emit('timerTick', {
      timeRemaining: this.state.timeRemaining,
      baseTime: this.state.baseTime,
      percentage: (this.state.timeRemaining / this.state.baseTime) * 100
    });
  }, 100);
}

  /**
   * Stop timer
   */
  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  }

  /**
   * Handle player answer
   */
  submitAnswer(answer) {
    if (!this.state.isPlaying || !this.currentChallenge) return;

    this.stopTimer();

    const isCorrect = this.currentChallenge.check(answer);
    const category = this.currentChallenge.category;

    // Update category stats
    this.state.categoryStats[category].attempts++;

    if (isCorrect) {
      this.handleCorrectAnswer();
    } else {
      this.handleWrongAnswer();
    }
  }

  /**
   * Handle correct answer
   */
  handleCorrectAnswer() {
    const category = this.currentChallenge.category;
    
    // Update stats
    this.state.score++;
    this.state.correctAnswers++;
    this.state.winStreak++;
    this.state.categoryStats[category].correct++;

    // Increase difficulty
    this.state.difficulty++;

    // Check for life gain (every 3 wins)
    if (this.state.winStreak === 3) {
      if (this.state.lives < this.state.maxLives) {
        this.state.lives++;
        this.emit('lifeGained', { lives: this.state.lives });
      }
      this.state.winStreak = 0;
    }

    this.emit('answerCorrect', {
      score: this.state.score,
      difficulty: this.state.difficulty,
      winStreak: this.state.winStreak,
      lives: this.state.lives
    });

    // Next challenge after short delay
    setTimeout(() => {
      this.nextChallenge();
    }, 800);
  }

/**
 * Handle wrong answer
 */
handleWrongAnswer() {
  this.state.wrongAnswers++;
  this.state.winStreak = 0;
  this.state.lives--;

  this.emit('answerWrong', {
    lives: this.state.lives,
    correctAnswer: this.currentChallenge.correctAnswer
  });

  // Check for game over IMMEDIATELY
  if (this.state.lives <= 0) {
    setTimeout(() => {
      this.endGame();
    }, 1000);
    return; // CRITICAL: Stop here, don't load next challenge
  }

  // Only load next challenge if still alive
  setTimeout(() => {
    this.nextChallenge();
  }, 1200);
}

/**
 * Handle timeout 
 */
handleTimeout() {
  // Don't handle timeout if already dead or game ended
  if (this.state.lives <= 0 || !this.state.isPlaying) {
    return;
  }
  
  this.emit('timeout', {
    correctAnswer: this.currentChallenge.correctAnswer
  });

  this.handleWrongAnswer();
}

  /**
   * Pause game
   */
  pauseGame() {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.state.isPaused = true;
    this.stopTimer();
    this.emit('gamePaused', this.state);
  }

  /**
   * Resume game
   */
  resumeGame() {
    if (!this.state.isPlaying || !this.state.isPaused) return;

    this.state.isPaused = false;
    this.startTimer();
    this.emit('gameResumed', this.state);
  }

/**
 * End game
 */
endGame() {
  if (!this.state.isPlaying) return; // Already ended
  
  this.state.isPlaying = false;
  this.stopTimer();

  // Clean up current challenge
  if (this.currentChallenge && this.currentChallenge.cleanup) {
    this.currentChallenge.cleanup();
  }

  // Calculate game duration
  const duration = Date.now() - this.state.startTime;

  // Save stats to localStorage
  const savedData = updateGameStats(
    this.state.score,
    this.state.correctAnswers,
    this.state.totalChallenges,
    this.state.categoryStats
  );

  this.emit('gameOver', {
    score: this.state.score,
    correctAnswers: this.state.correctAnswers,
    totalChallenges: this.state.totalChallenges,
    accuracy: Math.round((this.state.correctAnswers / this.state.totalChallenges) * 100),
    duration: Math.round(duration / 1000), // seconds
    highScore: savedData.highScore,
    isNewHighScore: this.state.score === savedData.highScore,
    rank: savedData.rank
  });
}

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Event system
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  emit(event, data) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach(handler => handler(data));
  }

  /**
   * Destroy engine
   */
  destroy() {
    this.stopTimer();
    if (this.currentChallenge && this.currentChallenge.cleanup) {
      this.currentChallenge.cleanup();
    }
    this.eventHandlers = {};
    this.state = this.getInitialState();
  }
}

// Create singleton instance
export const engine = new GameEngine();