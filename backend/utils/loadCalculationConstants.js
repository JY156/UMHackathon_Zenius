/**
 * ZENIUS LOAD CALCULATION CONSTANTS & FORMULA
 * 
 * This file defines the centralized business logic for calculating user workload and burnout risk.
 * Used across the entire application (backend, reasoning engine, API).
 * 
 * FORMULA:
 * --------
 * totalLoad = taskScore + sentimentPenalty
 * 
 * Where:
 *   taskScore = Σ(priority × difficulty) for all non-completed tasks
 *   difficulty = 1.5 if task category is 'Professional', 1.0 otherwise
 *   sentimentPenalty = (1 - sentimentScore) × 10
 * 
 * CONSTRAINTS & THRESHOLDS:
 * -------------------------
 * - A sentiment_score below 0.3 indicates HIGH BURNOUT RISK (avoid task reassignment)
 * - Task capacity is defined per user (team member) - actual capacity varies
 * - When load > capacity, user is "overwhelmed" and needs task offloading
 * 
 * EXAMPLE CALCULATION:
 * -------------------
 * User: Sarah (sentiment_score: 0.85)
 * Tasks:
 *   - Task 1: priority=4, category='Professional' → 4 × 1.5 = 6.0
 *   - Task 2: priority=3, category='Administrative' → 3 × 1.0 = 3.0
 * 
 * taskScore = 6.0 + 3.0 = 9.0
 * sentimentPenalty = (1 - 0.85) × 10 = 1.5
 * totalLoad = 9.0 + 1.5 = 10.5
 */

const LOAD_CALCULATION = {
  // Task difficulty multiplier by category
  DIFFICULTY_MULTIPLIER: {
    PROFESSIONAL: 1.5,
    ADMINISTRATIVE: 1.0,
    DEFAULT: 1.0
  },

  // Sentiment score thresholds
  BURNOUT_RISK_THRESHOLD: 0.3, // Below this = HIGH BURNOUT RISK
  SENTIMENT_PENALTY_FACTOR: 10, // Multiplier for sentiment penalty calculation

  // Status filters
  EXCLUDED_STATUS: 'completed', // Don't count completed tasks in load

  /**
   * Get difficulty multiplier for a task
   * @param {string} category - Task category (e.g., 'Professional', 'Administrative')
   * @returns {number} Difficulty multiplier (1.0 or 1.5)
   */
  getDifficultyMultiplier: (category) => {
    return LOAD_CALCULATION.DIFFICULTY_MULTIPLIER[category] ||
           LOAD_CALCULATION.DIFFICULTY_MULTIPLIER.DEFAULT;
  },

  /**
   * Check if a user is at burnout risk
   * @param {number} sentimentScore - User sentiment score (0-1)
   * @returns {boolean} True if sentiment score is below burnout threshold
   */
  isBurnoutRisk: (sentimentScore) => {
    return sentimentScore < LOAD_CALCULATION.BURNOUT_RISK_THRESHOLD;
  },

  /**
   * Calculate sentiment penalty component
   * @param {number} sentimentScore - User sentiment score (0-1)
   * @returns {number} Penalty value to add to total load
   */
  calculateSentimentPenalty: (sentimentScore) => {
    const normalizedSentiment = sentimentScore !== undefined ? sentimentScore : 1.0;
    return (1 - normalizedSentiment) * LOAD_CALCULATION.SENTIMENT_PENALTY_FACTOR;
  },

  /**
   * Calculate task score component (pure calculation)
   * @param {Array} tasks - Array of task objects with {priority, category} properties
   * @returns {number} Sum of (priority × difficulty) for all tasks
   */
  calculateTaskScore: (tasks) => {
    return tasks.reduce((acc, task) => {
      const difficulty = LOAD_CALCULATION.getDifficultyMultiplier(task.category);
      return acc + (task.priority * difficulty);
    }, 0);
  },

  /**
   * Calculate total load (pure calculation, no database access)
   * @param {Array} tasks - Array of task objects with {priority, category} properties
   * @param {number} sentimentScore - User sentiment score (0-1)
   * @returns {number} Total calculated load value
   */
  calculateTotalLoad: (tasks, sentimentScore) => {
    const taskScore = LOAD_CALCULATION.calculateTaskScore(tasks);
    const sentimentPenalty = LOAD_CALCULATION.calculateSentimentPenalty(sentimentScore);
    return taskScore + sentimentPenalty;
  }
};

module.exports = LOAD_CALCULATION;
