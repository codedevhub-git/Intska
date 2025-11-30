/**
 * Timer Component
 * Visual countdown timer with progress bar
 */

export class Timer {
  constructor(containerElement) {
    this.container = containerElement;
    this.progressBar = null;
    this.timeDisplay = null;
    this.isWarning = false;
    this.isCritical = false;
    
    this.init();
  }

  /**
   * Initialize timer UI
   */
  init() {
    this.container.innerHTML = `
      <div class="timer-wrapper">
        <div class="timer-display">
          <span class="timer-icon">⏱</span>
          <span class="timer-text">15.0</span>
        </div>
        <div class="timer-bar-container">
          <div class="timer-bar-fill"></div>
        </div>
      </div>
    `;

    this.progressBar = this.container.querySelector('.timer-bar-fill');
    this.timeDisplay = this.container.querySelector('.timer-text');
    this.timerWrapper = this.container.querySelector('.timer-wrapper');
  }

  /**
   * Update timer display
   * @param {number} timeRemaining - Seconds remaining
   * @param {number} baseTime - Total time for challenge
   */
  update(timeRemaining, baseTime) {
    const percentage = (timeRemaining / baseTime) * 100;
    
    // Update text display
    this.timeDisplay.textContent = timeRemaining.toFixed(1);
    
    // Update progress bar width
    this.progressBar.style.width = `${percentage}%`;
    
    // Update color based on time remaining
    this.updateColor(percentage);
    
    // Add animations for warnings
    this.updateWarnings(percentage);
  }

  /**
   * Update timer color based on percentage
   */
  updateColor(percentage) {
    this.progressBar.classList.remove('timer-warning', 'timer-critical');
    
    if (percentage <= 25) {
      this.progressBar.classList.add('timer-critical');
    } else if (percentage <= 50) {
      this.progressBar.classList.add('timer-warning');
    }
  }

  /**
   * Add warning animations
   */
  updateWarnings(percentage) {
    // Warning pulse at 50%
    if (percentage <= 50 && percentage > 25 && !this.isWarning) {
      this.isWarning = true;
      this.timerWrapper.classList.add('pulse-warning');
    } else if (percentage > 50) {
      this.isWarning = false;
      this.timerWrapper.classList.remove('pulse-warning');
    }
    
    // Critical pulse at 25%
    if (percentage <= 25 && !this.isCritical) {
      this.isCritical = true;
      this.timerWrapper.classList.add('pulse-critical');
      this.timerWrapper.classList.remove('pulse-warning');
    } else if (percentage > 25) {
      this.isCritical = false;
      this.timerWrapper.classList.remove('pulse-critical');
    }
  }

  /**
   * Reset timer to initial state
   */
  reset(baseTime = 15) {
    this.isWarning = false;
    this.isCritical = false;
    this.timerWrapper.classList.remove('pulse-warning', 'pulse-critical');
    this.progressBar.classList.remove('timer-warning', 'timer-critical');
    this.progressBar.style.width = '100%';
    this.timeDisplay.textContent = baseTime.toFixed(1);
  }

  /**
   * Hide timer
   */
  hide() {
    this.container.style.display = 'none';
  }

  /**
   * Show timer
   */
  show() {
    this.container.style.display = 'block';
  }

  /**
   * Destroy timer
   */
  destroy() {
    this.container.innerHTML = '';
  }
}