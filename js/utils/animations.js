/**
 * Animation utilities
 * CSS class-based animations for game events
 */

/**
 * Add animation class temporarily
 */
export function animateElement(element, animationClass, duration = 600) {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    
    setTimeout(() => {
      element.classList.remove(animationClass);
      resolve();
    }, duration);
  });
}

/**
 * Shake animation (for wrong answers)
 */
export function shakeElement(element) {
  return animateElement(element, 'shake', 500);
}

/**
 * Pulse animation (for correct answers, hearts gained)
 */
export function pulseElement(element) {
  return animateElement(element, 'pulse', 400);
}

/**
 * Bounce animation (for UI feedback)
 */
export function bounceElement(element) {
  return animateElement(element, 'bounce', 600);
}

/**
 * Fade in element
 */
export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.display = 'block';
  
  return new Promise((resolve) => {
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '1';
      
      setTimeout(resolve, duration);
    }, 10);
  });
}

/**
 * Fade out element
 */
export function fadeOut(element, duration = 300) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

/**
 * Slide in from direction
 */
export function slideIn(element, direction = 'left', duration = 400) {
  const transforms = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)'
  };
  
  element.style.transform = transforms[direction];
  element.style.display = 'block';
  
  return new Promise((resolve) => {
    setTimeout(() => {
      element.style.transition = `transform ${duration}ms ease`;
      element.style.transform = 'translate(0, 0)';
      
      setTimeout(resolve, duration);
    }, 10);
  });
}

/**
 * Flash background color
 */
export function flashColor(element, color, duration = 300) {
  const originalBg = element.style.backgroundColor;
  
  element.style.transition = 'background-color 150ms ease';
  element.style.backgroundColor = color;
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
  }, duration);
}

/**
 * Success flash (green)
 */
export function flashSuccess(element) {
  flashColor(element, '#4CAF50', 400);
}

/**
 * Error flash (red)
 */
export function flashError(element) {
  flashColor(element, '#f44336', 400);
}

/**
 * Scale animation (grow/shrink)
 */
export function scaleElement(element, scale = 1.1, duration = 300) {
  return new Promise((resolve) => {
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `scale(${scale})`;
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      setTimeout(resolve, duration);
    }, duration);
  });
}

/**
 * Rotate animation
 */
export function rotateElement(element, degrees, duration = 400) {
  return new Promise((resolve) => {
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `rotate(${degrees}deg)`;
    
    setTimeout(resolve, duration);
  });
}

/**
 * Remove all active animations from element
 */
export function clearAnimations(element) {
  element.classList.remove('shake', 'pulse', 'bounce');
  element.style.transition = '';
  element.style.transform = '';
}

/**
 * Stagger animations across multiple elements
 */
export function staggerAnimation(elements, animationFn, delay = 100) {
  return Promise.all(
    Array.from(elements).map((el, i) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          animationFn(el).then(resolve);
        }, i * delay);
      });
    })
  );
}