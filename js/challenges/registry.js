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
   * @param {Object} metadata - Optional metadata (name, description, minDifficulty, baseTime)
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
        maxDifficulty: metadata.maxDifficulty || Infinity,
        // FIX: Ensure 'baseTime' is always defined, defaulting to 20 seconds.
        baseTime: metadata.baseTime || 20 
      }
    });

    this.categories.add(category);
  }

  /**
   * Get a random challenge factory object (not the instance!)
   * @param {number} difficulty - Current difficulty level
   * @returns {Object} Challenge factory object {id, category, factory, metadata}
   */
  getRandomChallenge(difficulty) {
    // Filter challenges available at current difficulty
    const available = Array.from(this.challenges.values()).filter(challenge => {
      const { minDifficulty, maxDifficulty } = challenge.metadata;
      return difficulty >= minDifficulty && difficulty <= maxDifficulty;
    });

    if (available.length === 0) {
      // NOTE: This throws an error, which the engine catches and ends the game.
      throw new Error('No challenges available at this difficulty level');
    }

    // Pick random challenge factory object
    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];

    // FIX: Return the factory object, not the instantiated challenge.
    // The GameEngine needs the metadata (including baseTime) before it calls .factory().
    return selected;
  }

  /**
   * Get challenge by ID
   * @returns {Object} Challenge instance
   */
  getChallenge(id, difficulty) {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error(`Challenge "${id}" not found`);
    }
    // Correctly return the instantiated challenge here, as requested by ID
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