"""
ZENIUS LOAD CALCULATION CONSTANTS & FORMULA (Python)

This file defines the centralized business logic for calculating user workload and burnout risk.
Used across the entire application (backend, reasoning engine, API).

FORMULA:
--------
totalLoad = taskScore + sentimentPenalty

Where:
  taskScore = Σ(priority × difficulty) for all non-completed tasks
  difficulty = 1.5 if task category is 'Professional', 1.0 otherwise
  sentimentPenalty = (1 - sentimentScore) × 10

CONSTRAINTS & THRESHOLDS:
-------------------------
- A sentiment_score below 0.3 indicates HIGH BURNOUT RISK (avoid task reassignment)
- Task capacity is defined per user (team member) - actual capacity varies
- When load > capacity, user is "overwhelmed" and needs task offloading

EXAMPLE CALCULATION:
-------------------
User: Sarah (sentiment_score: 0.85)
Tasks:
  - Task 1: priority=4, category='Professional' → 4 × 1.5 = 6.0
  - Task 2: priority=3, category='Administrative' → 3 × 1.0 = 3.0

taskScore = 6.0 + 3.0 = 9.0
sentimentPenalty = (1 - 0.85) × 10 = 1.5
totalLoad = 9.0 + 1.5 = 10.5
"""

# Task difficulty multiplier by category
DIFFICULTY_MULTIPLIER = {
    "PROFESSIONAL": 1.5,
    "ADMINISTRATIVE": 1.0,
    "DEFAULT": 1.0
}

# Sentiment score thresholds
BURNOUT_RISK_THRESHOLD = 0.3  # Below this = HIGH BURNOUT RISK
SENTIMENT_PENALTY_FACTOR = 10  # Multiplier for sentiment penalty calculation

# Status filters
EXCLUDED_STATUS = "completed"  # Don't count completed tasks in load


def get_difficulty_multiplier(category):
    """
    Get difficulty multiplier for a task
    
    Args:
        category (str): Task category (e.g., 'Professional', 'Administrative')
    
    Returns:
        float: Difficulty multiplier (1.0 or 1.5)
    """
    return DIFFICULTY_MULTIPLIER.get(category, DIFFICULTY_MULTIPLIER["DEFAULT"])


def is_burnout_risk(sentiment_score):
    """
    Check if a user is at burnout risk
    
    Args:
        sentiment_score (float): User sentiment score (0-1)
    
    Returns:
        bool: True if sentiment score is below burnout threshold
    """
    return sentiment_score < BURNOUT_RISK_THRESHOLD


def calculate_sentiment_penalty(sentiment_score):
    """
    Calculate sentiment penalty component
    
    Args:
        sentiment_score (float): User sentiment score (0-1)
    
    Returns:
        float: Penalty value to add to total load
    """
    normalized_sentiment = sentiment_score if sentiment_score is not None else 1.0
    return (1 - normalized_sentiment) * SENTIMENT_PENALTY_FACTOR


def calculate_task_score(tasks):
    """
    Calculate task score component (pure calculation)
    
    Args:
        tasks (list): List of task dictionaries with 'priority' and 'category' keys
    
    Returns:
        float: Sum of (priority × difficulty) for all tasks
    """
    return sum(
        task.get("priority", 0) * get_difficulty_multiplier(task.get("category", "ADMINISTRATIVE"))
        for task in tasks
    )


def calculate_total_load(tasks, sentiment_score):
    """
    Calculate total load (pure calculation, no database access)
    
    Args:
        tasks (list): List of task dictionaries with 'priority' and 'category' keys
        sentiment_score (float): User sentiment score (0-1)
    
    Returns:
        float: Total calculated load value
    """
    task_score = calculate_task_score(tasks)
    sentiment_penalty = calculate_sentiment_penalty(sentiment_score)
    return task_score + sentiment_penalty
