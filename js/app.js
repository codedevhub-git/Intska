/**
 * Main Application Controller
 * Initializes the game and handles navigation
 */

import { engine } from './core/engine.js';
import { ui } from './core/ui.js';
import { getStats } from './storage.js';

// Import all challenge modules to trigger registration
import './challenges/math.js';
import './challenges/logic.js';
import './challenges/memory.js';
import './challenges/puzzles.js';
import { initializeRegistry } from './challenges/registry.js';

class App {
  constructor() {
    this.currentPage = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    console.log('🧠 Brain Challenge Engine - Initializing...');

    // Initialize challenge registry
    initializeRegistry();

    // Detect current page
    this.detectPage();

    // Initialize based on page
    if (this.currentPage === 'landing') {
      this.initLandingPage();
    } else if (this.currentPage === 'game') {
      this.initGamePage();
    }

    // Register service worker for PWA
    this.registerServiceWorker();

    this.isInitialized = true;
    console.log('✅ App initialized');
  }

  /**
   * Detect which page we're on
   */
  detectPage() {
    const path = window.location.pathname;
    
    if (path.includes('game.html')) {
      this.currentPage = 'game';
    } else {
      this.currentPage = 'landing';
    }
  }

  /**
   * Initialize landing page
   */
  initLandingPage() {
    console.log('📱 Initializing landing page...');

    // Load and display stats
    this.displayStats();

    // Set up start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.location.href = 'game.html';
      });
    }

    // Set up reset button (if exists)
    const resetBtn = document.getElementById('reset-stats-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all stats? This cannot be undone.')) {
          localStorage.clear();
          location.reload();
        }
      });
    }
  }

  /**
   * Display stats on landing page
   */
  displayStats() {
    const stats = getStats();

    // Update high score
    const highScoreEl = document.getElementById('high-score');
    if (highScoreEl) {
      highScoreEl.textContent = stats.highScore;
    }

    // Update rank
    const rankEl = document.getElementById('rank');
    if (rankEl) {
      rankEl.textContent = stats.rank;
      rankEl.className = `rank rank-${stats.rank.toLowerCase()}`;
    }

    // Update total games
    const totalGamesEl = document.getElementById('total-games');
    if (totalGamesEl) {
      totalGamesEl.textContent = stats.totalGames;
    }

    // Update accuracy
    const accuracyEl = document.getElementById('accuracy');
    if (accuracyEl) {
      accuracyEl.textContent = `${stats.stats.accuracy}%`;
    }

    // Update average score
    const avgScoreEl = document.getElementById('avg-score');
    if (avgScoreEl) {
      avgScoreEl.textContent = stats.stats.avgScorePerGame;
    }

    // Update current streak
    const streakEl = document.getElementById('current-streak');
    if (streakEl) {
      streakEl.textContent = stats.stats.currentStreak;
    }

    // Update recent games (if container exists)
    this.displayRecentGames(stats.history);
  }

  /**
   * Display recent games
   */
  displayRecentGames(history) {
    const container = document.getElementById('recent-games');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = '<p class="no-games">No games played yet</p>';
      return;
    }

    container.innerHTML = history.slice(0, 5).map(game => {
      const date = new Date(game.date);
      const dateStr = date.toLocaleDateString();
      const accuracy = Math.round((game.correct / game.total) * 100);

      return `
        <div class="recent-game-item">
          <div class="game-date">${dateStr}</div>
          <div class="game-score">Score: ${game.score}</div>
          <div class="game-accuracy">${accuracy}% accuracy</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Initialize game page
   */
  initGamePage() {
    console.log('🎮 Initializing game page...');

    // Set up engine event listeners
    this.setupEngineEvents();

    // Set up UI event listeners
    this.setupUIEvents();

    // Auto-start game
    setTimeout(() => {
      engine.startGame();
    }, 500);
  }

  /**
   * Set up engine event listeners
   */
  setupEngineEvents() {
    // Game start
    engine.on('gameStart', (state) => {
      console.log('Game started', state);
      ui.reset();
    });

    // Challenge ready
    engine.on('challengeReady', async (data) => {
      console.log('Challenge ready:', data.challenge.id);
      
      ui.updateDifficulty(data.difficulty);
      ui.resetTimer(data.timeLimit);
      
      await ui.renderChallenge(data.challenge);
    });

    // Timer tick
    engine.on('timerTick', (data) => {
      ui.updateTimer(data.timeRemaining, data.baseTime);
    });

    // Correct answer
    engine.on('answerCorrect', async (data) => {
      console.log('✓ Correct!', data);
      
      ui.updateScore(data.score);
      ui.updateDifficulty(data.difficulty);
      
      await ui.showCorrectFeedback();
    });

    // Wrong answer
    engine.on('answerWrong', async (data) => {
      console.log('✗ Wrong', data);
      
      ui.updateLives(data.lives, false);
      
      await ui.showWrongFeedback(data.correctAnswer);
    });

    // Timeout
    engine.on('timeout', async (data) => {
      console.log('⏱ Timeout', data);
      
      await ui.showTimeoutFeedback(data.correctAnswer);
    });

    // Life gained
    engine.on('lifeGained', async (data) => {
      console.log('💚 Life gained!', data);
      
      ui.updateLives(data.lives, true);
      await ui.showLifeGainedNotification();
    });

    // Game over
    engine.on('gameOver', (data) => {
      console.log('Game over', data);
      
      ui.showGameOver(data);
    });
  }

  /**
   * Set up UI event listeners
   */
  setupUIEvents() {
    // Listen for challenge answers
    window.addEventListener('challengeAnswer', (e) => {
      const { answer } = e.detail;
      console.log('Answer submitted:', answer);
      engine.submitAnswer(answer);
    });

    // Play again button (delegated event)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'play-again-btn') {
        ui.hideGameOver();
        setTimeout(() => {
          engine.startGame();
        }, 300);
      }

      if (e.target.id === 'back-home-btn') {
        window.location.href = 'index.html';
      }

      if (e.target.id === 'pause-btn') {
        engine.pauseGame();
        ui.showPause();
      }

      if (e.target.id === 'resume-btn') {
        ui.hidePause();
        engine.resumeGame();
      }

      if (e.target.id === 'quit-btn') {
        if (confirm('Quit current game?')) {
          window.location.href = 'index.html';
        }
      }
    });

    // Pause on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && engine.state.isPlaying && !engine.state.isPaused) {
        engine.pauseGame();
        ui.showPause();
      }
    });
  }

  /**
   * Register service worker for PWA
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.log('❌ Service Worker registration failed:', error);
      }
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}

// Export for debugging
window.app = App;
window.engine = engine;
window.ui = ui;