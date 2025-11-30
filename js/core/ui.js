/**
 * UI Manager
 * Handles all DOM updates, animations, and user interactions
 */

import { Timer } from './timer.js';
import { 
  pulseElement, 
  shakeElement, 
  flashSuccess, 
  flashError,
  fadeIn,
  fadeOut,
  bounceElement 
} from '../utils/animations.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.timer = null;
    this.hearts = [];
    
    this.initElements();
    this.initTimer();
    this.initHearts();
  }

  /**
   * Cache DOM elements
   */
  initElements() {
    this.elements = {
      // Game container
      gameContainer: document.getElementById('game-container'),
      
      // Header elements
      scoreDisplay: document.getElementById('score'),
      livesContainer: document.getElementById('lives'),
      difficultyDisplay: document.getElementById('difficulty'),
      timerContainer: document.getElementById('timer-container'),
      
      // Challenge area
      challengeContainer: document.getElementById('challenge'),
      challengeTitle: document.getElementById('challenge-title'),
      challengeContent: document.getElementById('challenge-content'),
      
      // Input/interaction area
      answerContainer: document.getElementById('answer-container'),
      
      // Feedback
      feedbackContainer: document.getElementById('feedback'),
      
      // Modals
      gameOverModal: document.getElementById('game-over-modal'),
      pauseModal: document.getElementById('pause-modal')
    };
  }

  /**
   * Initialize timer component
   */
  initTimer() {
    if (this.elements.timerContainer) {
      this.timer = new Timer(this.elements.timerContainer);
    }
  }

  /**
   * Initialize hearts display
   */
  initHearts() {
    if (!this.elements.livesContainer) return;
    
    this.elements.livesContainer.innerHTML = '';
    this.hearts = [];
    
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart heart-full';
      heart.innerHTML = '❤️';
      this.elements.livesContainer.appendChild(heart);
      this.hearts.push(heart);
    }
  }

  /**
   * Update score display
   */
  updateScore(score) {
    if (this.elements.scoreDisplay) {
      this.elements.scoreDisplay.textContent = score;
      pulseElement(this.elements.scoreDisplay);
    }
  }

  /**
   * Update difficulty display
   */
  updateDifficulty(difficulty) {
    if (this.elements.difficultyDisplay) {
      this.elements.difficultyDisplay.textContent = `Level ${difficulty}`;
    }
  }

  /**
   * Update lives display
   */
  updateLives(lives, wasGained = false) {
    this.hearts.forEach((heart, index) => {
      if (index < lives) {
        heart.classList.remove('heart-empty');
        heart.classList.add('heart-full');
        if (wasGained && index === lives - 1) {
          bounceElement(heart);
        }
      } else {
        heart.classList.remove('heart-full');
        heart.classList.add('heart-empty');
        if (index === lives) {
          shakeElement(heart);
        }
      }
    });
  }

  /**
   * Update timer
   */
  updateTimer(timeRemaining, baseTime) {
    if (this.timer) {
      this.timer.update(timeRemaining, baseTime);
    }
  }

  /**
   * Reset timer
   */
  resetTimer(baseTime) {
    if (this.timer) {
      this.timer.reset(baseTime);
    }
  }

  /**
   * Render challenge
   */
  async renderChallenge(challenge) {
    if (!this.elements.challengeContent) return;
    
    // Clear previous challenge
    this.elements.challengeContent.innerHTML = '';
    this.elements.answerContainer.innerHTML = '';
    
    // Set title if available
    if (this.elements.challengeTitle && challenge.title) {
      this.elements.challengeTitle.textContent = challenge.title;
    }
    
    // Render challenge content
    if (challenge.render) {
      await challenge.render(this.elements.challengeContent, this.elements.answerContainer);
    }
    
    // Fade in
    await fadeIn(this.elements.challengeContainer);
  }

  /**
   * Show correct answer feedback
   */
  async showCorrectFeedback() {
    if (this.elements.feedbackContainer) {
      this.elements.feedbackContainer.textContent = '✓ Correct!';
      this.elements.feedbackContainer.className = 'feedback feedback-correct';
      await fadeIn(this.elements.feedbackContainer);
      
      setTimeout(async () => {
        await fadeOut(this.elements.feedbackContainer);
      }, 800);
    }
    
    // Flash challenge container green
    if (this.elements.challengeContainer) {
      flashSuccess(this.elements.challengeContainer);
    }
  }

  /**
   * Show wrong answer feedback
   */
  async showWrongFeedback(correctAnswer = null) {
    if (this.elements.feedbackContainer) {
      let message = '✗ Wrong!';
      if (correctAnswer !== null) {
        message += ` (Answer: ${correctAnswer})`;
      }
      
      this.elements.feedbackContainer.textContent = message;
      this.elements.feedbackContainer.className = 'feedback feedback-wrong';
      await fadeIn(this.elements.feedbackContainer);
      
      setTimeout(async () => {
        await fadeOut(this.elements.feedbackContainer);
      }, 1200);
    }
    
    // Flash challenge container red
    if (this.elements.challengeContainer) {
      flashError(this.elements.challengeContainer);
      shakeElement(this.elements.challengeContainer);
    }
  }

  /**
   * Show timeout feedback
   */
  async showTimeoutFeedback(correctAnswer = null) {
    if (this.elements.feedbackContainer) {
      let message = '⏱ Time\'s Up!';
      if (correctAnswer !== null) {
        message += ` (Answer: ${correctAnswer})`;
      }
      
      this.elements.feedbackContainer.textContent = message;
      this.elements.feedbackContainer.className = 'feedback feedback-timeout';
      await fadeIn(this.elements.feedbackContainer);
      
      setTimeout(async () => {
        await fadeOut(this.elements.feedbackContainer);
      }, 1200);
    }
    
    // Shake challenge container
    if (this.elements.challengeContainer) {
      shakeElement(this.elements.challengeContainer);
    }
  }

  /**
   * Show life gained notification
   */
  async showLifeGainedNotification() {
    if (this.elements.feedbackContainer) {
      this.elements.feedbackContainer.textContent = '💚 Life Restored!';
      this.elements.feedbackContainer.className = 'feedback feedback-life-gained';
      await fadeIn(this.elements.feedbackContainer);
      
      setTimeout(async () => {
        await fadeOut(this.elements.feedbackContainer);
      }, 1000);
    }
  }

  /**
   * Show game over modal
   */
  showGameOver(data) {
    if (!this.elements.gameOverModal) return;
    
    const isNewHighScore = data.isNewHighScore;
    
    this.elements.gameOverModal.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">Game Over!</h2>
        
        ${isNewHighScore ? '<div class="new-high-score">🎉 New High Score! 🎉</div>' : ''}
        
        <div class="game-over-stats">
          <div class="stat-item">
            <div class="stat-label">Final Score</div>
            <div class="stat-value">${data.score}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value">${data.accuracy}%</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Challenges</div>
            <div class="stat-value">${data.totalChallenges}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Time</div>
            <div class="stat-value">${data.duration}s</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Rank</div>
            <div class="stat-value rank-badge">${data.rank}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">High Score</div>
            <div class="stat-value">${data.highScore}</div>
          </div>
        </div>
        
        <div class="modal-buttons">
          <button id="play-again-btn" class="btn btn-primary">Play Again</button>
          <button id="back-home-btn" class="btn btn-secondary">Home</button>
        </div>
      </div>
    `;
    
    this.elements.gameOverModal.style.display = 'flex';
    fadeIn(this.elements.gameOverModal);
  }

  /**
   * Hide game over modal
   */
  hideGameOver() {
    if (this.elements.gameOverModal) {
      fadeOut(this.elements.gameOverModal).then(() => {
        this.elements.gameOverModal.style.display = 'none';
      });
    }
  }

  /**
   * Show pause modal
   */
  showPause() {
    if (!this.elements.pauseModal) return;
    
    this.elements.pauseModal.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">Paused</h2>
        <div class="modal-buttons">
          <button id="resume-btn" class="btn btn-primary">Resume</button>
          <button id="quit-btn" class="btn btn-secondary">Quit</button>
        </div>
      </div>
    `;
    
    this.elements.pauseModal.style.display = 'flex';
    fadeIn(this.elements.pauseModal);
  }

  /**
   * Hide pause modal
   */
  hidePause() {
    if (this.elements.pauseModal) {
      fadeOut(this.elements.pauseModal).then(() => {
        this.elements.pauseModal.style.display = 'none';
      });
    }
  }

  /**
   * Clear challenge display
   */
  clearChallenge() {
    if (this.elements.challengeContent) {
      this.elements.challengeContent.innerHTML = '';
    }
    if (this.elements.answerContainer) {
      this.elements.answerContainer.innerHTML = '';
    }
  }

  /**
   * Reset UI to initial state
   */
  reset() {
    this.updateScore(0);
    this.updateDifficulty(1);
    this.initHearts();
    this.resetTimer(15);
    this.clearChallenge();
    this.hideGameOver();
    this.hidePause();
  }

  /**
   * Destroy UI manager
   */
  destroy() {
    if (this.timer) {
      this.timer.destroy();
    }
  }
}

// Create singleton instance
export const ui = new UIManager();