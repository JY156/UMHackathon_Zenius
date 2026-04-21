# Product Requirement Document (PRD) - Reasoning Engine

## Overview
The Reasoning Engine is the core component of Task 2, responsible for analyzing absence triggers, querying team data, and using AI (GLM) to determine optimal task reassignments. The engine must output structured JSON for Task 3 execution and include burnout detection logic.

## Functional Requirements

### 1. Absence Trigger Processing
- **Input**: Receives an absence trigger containing user ID, role, reason, and timestamp.
- **Query Database**: Fetch all tasks assigned to the absent user where status != 'completed'.
- **Team Data Retrieval**: Fetch all other users' data including skills, current_load, and sentiment_score.

### 2. AI Reasoning with GLM
- **System Instruction**: Strict prompt to ensure GLM outputs only JSON without extraneous text.
- **Constraints**:
  1. Match task skills to member skills.
  2. Prioritize members with lowest current_load.
  3. Avoid members with sentiment_score below 0.3 (Burnout Risk).
- **Output Format**: JSON with fields: suggestedTid, fromUid, toUid, reasoning.

### 3. Burnout Warning Logic
- **Definition**: A 'Burnout Warning' is triggered when a team member's Individual Load Score exceeds 80.
- **Load Score Formula**:
  - Base Score: Sum of (Task Priority * Task Difficulty) for all assigned tasks.
  - Sentiment Penalty: +20 points if GLM detects 'stressed' tone in chat logs (from Task 1 data).
- **Late Night Activity Flag**: Any communication sent between 12 AM and 5 AM is automatically flagged as high-risk burnout indicator.
- **Detection**: The engine must analyze chat logs and timestamps to apply penalties and flags.

### 4. Data Persistence
- Save reasoning results to the Approvals collection in the database.
- Include timestamp and full reasoning for audit trails.

### 5. Error Handling
- Fallback to default logic if AI call fails.
- Log errors and provide status updates.

## Non-Functional Requirements
- **Performance**: Response time < 5 seconds for typical team sizes.
- **Accuracy**: >90% correct reassignments based on constraints.
- **Scalability**: Handle teams up to 50 members.
- **Security**: No sensitive data exposure in logs or outputs.

## Acceptance Criteria
- Engine processes absence triggers correctly.
- Outputs valid JSON matching Task 3 expectations.
- Burnout warnings are accurately flagged based on defined logic.
- Integration with database and AI API works seamlessly.