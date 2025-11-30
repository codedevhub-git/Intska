/**
 * Challenge Registry System
 * Manages all challenge types and provides random selection
 */

class ChallengeRegistry {
  constructor() {
    this.challenges = new Map();
    this.categories = new Set();
  }

  /**
   * Register a challenge factory function
   * @param {string} id - Unique identifier for the challenge
   * @param {string} category - 'math', 'logic', 'memory', 'puzzle'
   * @param {Function} factory - Function that creates challenge instance
   * @param {Object} metadata - Optional metadata (name, description, minDifficulty)
   */
  register(id, category, factory, metadata = {}) {
    if (this.challenges.has(id)) {
      console.warn(`Challenge "${id}" already registered. Overwriting.`);
    }

    this.challenges.set(id, {
      id,
      category,
      factory,
      metadata: {
        name: metadata.name || id,
        description: metadata.description || '',
        minDifficulty: metadata.minDifficulty || 1,
        maxDifficulty: metadata.maxDifficulty || Infinity
      }
    });

    this.categories.add(category);
  }

  /**
   * Get a random challenge factory
   * @param {number} difficulty - Current difficulty level
   * @returns {Object} Challenge instance
   */
  getRandomChallenge(difficulty) {
    // Filter challenges available at current difficulty
    const available = Array.from(this.challenges.values()).filter(challenge => {
      const { minDifficulty, maxDifficulty } = challenge.metadata;
      return difficulty >= minDifficulty && difficulty <= maxDifficulty;
    });

    if (available.length === 0) {
      throw new Error('No challenges available at this difficulty level');
    }

    // Pick random challenge
    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];

    // Create instance using factory
    return selected.factory(difficulty);
  }

  /**
   * Get challenge by ID
   */
  getChallenge(id, difficulty) {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error(`Challenge "${id}" not found`);
    }
    return challenge.factory(difficulty);
  }

  /**
   * Get all challenges in a category
   */
  getChallengesByCategory(category, difficulty) {
    return Array.from(this.challenges.values())
      .filter(c => c.category === category)
      .filter(c => {
        const { minDifficulty, maxDifficulty } = c.metadata;
        return difficulty >= minDifficulty && difficulty <= maxDifficulty;
      });
  }

  /**
   * Get total number of registered challenges
   */
  getCount() {
    return this.challenges.size;
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories);
  }

  /**
   * Get all challenge IDs
   */
  getAllIds() {
    return Array.from(this.challenges.keys());
  }

  /**
   * Check if challenge exists
   */
  hasChallenge(id) {
    return this.challenges.has(id);
  }

  /**
   * Unregister a challenge
   */
  unregister(id) {
    return this.challenges.delete(id);
  }

  /**
   * Clear all challenges
   */
  clear() {
    this.challenges.clear();
    this.categories.clear();
  }

  /**
   * Get statistics about registered challenges
   */
  getStats() {
    const stats = {
      total: this.challenges.size,
      byCategory: {}
    };

    for (const category of this.categories) {
      stats.byCategory[category] = Array.from(this.challenges.values())
        .filter(c => c.category === category)
        .length;
    }

    return stats;
  }
}

// Create singleton instance
export const registry = new ChallengeRegistry();

/**
 * Helper function to register a challenge
 */
export function registerChallenge(id, category, factory, metadata) {
  registry.register(id, category, factory, metadata);
}

/**
 * Initialize all challenges
 * This will be called when challenge modules are loaded
 */
export function initializeRegistry() {
  console.log('Challenge registry initialized');
  console.log('Total challenges:', registry.getCount());
  console.log('Categories:', registry.getCategories());
  console.log('Stats:', registry.getStats());
}