# Task 2: Reasoning Engine - Quick Start Guide

## 📋 What You Now Have

✅ **Reasoning Module**: ackend/reasoning.py
✅ **PRD Document**: PRD_Reasoning_Engine.md
✅ **Pitch Deck**: Pitch_Deck_Reasoning_Engine.md
✅ **Database Setup Guide**: DATABASE_SETUP_GUIDE.md
✅ **Testing Guide**: TESTING_GUIDE_TASK2.md
✅ **Unit Test**: ackend/test_reasoning_unit.py
✅ **Burnout Logic Test**: ackend/test_burnout_logic.py
✅ **Database Seed Script**: ackend/seedDatabase.js

---

## 🚀 Quick Start (Next 15 Minutes)

### Step 1: Run Unit Tests (No Database Needed)
This tests the reasoning logic with mock data:

\\\ash
cd backend
python test_reasoning_unit.py
\\\

✅ Expected Output: JSON with suggestedTid, fromUid, toUid, reasoning

---

### Step 2: Test Burnout Logic
Validate the burnout detection calculations:

\\\ash
cd backend
python test_burnout_logic.py
\\\

✅ Expected Output: 6 test cases, all passing

---

### Step 3: Setup Database (If Not Done)

#### Option A: Manual Setup in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open your Firestore Database
3. Create collections: **users**, **tasks**, **inputs**, **approvals**
4. Add test data manually (see DATABASE_SETUP_GUIDE.md)

#### Option B: Automated Setup (Recommended)
If you have your Firebase service account key in \ackend/serviceAccountKey.json\:

\\\ash
cd backend
node seedDatabase.js
\\\

✅ Expected Output:
\\\
✅ DATABASE SEEDING COMPLETE!
  • Users: 4
  • Tasks: 5
  • Inputs (Chat logs): 4
\\\

---

### Step 4: Test with Database (Integration Test)
This tests the full workflow with real Firebase data:

\\\ash
cd backend
python test_reasoning_integration.py
\\\

✅ Expected Output: Orphaned tasks, team load, burnout detection, late night activity

---

### Step 5: End-to-End Test
This runs the complete absence → reasoning → save workflow:

\\\ash
cd backend
python test_reasoning_e2e.py
\\\

✅ Expected Output:
\\\
ABSENCE TRIGGER: {...}
ORPHANED TASKS: [{...}]
TEAM LOAD MAP: [{...}]
REASONING OUTPUT: {\"suggestedTid\": \"...\", ...}
SAVED TO APPROVALS: Document created
🎉 E2E TEST PASSED
\\\

---

## 🔑 Key Database Collections

### Users
`json
{
  "uid": "user_01",
  "name": "Sarah Chen",
  "email": "sarah@company.com",
  "skills": ["Python", "API Design"],
  "sentiment_score": 0.85,
  "current_load": 25,
  "role": "Senior Developer"
}
`

### Tasks
`json
{
  "tid": "TASK-001",
  "title": "Build REST API",
  "assignedTo": "user_01",
  "skills": ["Python", "API"],
  "priority": 3,
  "difficulty": 2,
  "status": "in_progress"
}
`

### Inputs (Chat Logs)
`json
{
  "source": "slack",
  "content": "I'm feeling overwhelmed",
  "sentiment": { "score": 0.3, "tone": "stressed" },
  "timestamp": "2026-04-21T02:30:00Z",
  "metadata": { "userId": "user_03" }
}
`

### Approvals (Output)
`json
{
  "suggestedTid": "TASK-001",
  "fromUid": "user_01",
  "toUid": "user_02",
  "reasoning": "Skill match and low load",
  "timestamp": "2026-04-21T11:00:00Z",
  "status": "pending"
}
`

---

## 🧠 How the Reasoning Engine Works

### Input
- **Absence Trigger**: User is absent (from Task 1)
- **Orphaned Tasks**: All tasks assigned to absent user
- **Team Load Map**: Skills, load, sentiment for all team members

### Process
1. **System Instruction** constrains GLM behavior
2. **Constraints Applied**:
   - Match task skills to member skills
   - Prioritize lowest current_load
   - Avoid members with sentiment < 0.3 (burnout risk)
3. **Output**: Structured JSON

### Output
`json
{
  "suggestedTid": "TASK-001",
  "fromUid": "absent_user",
  "toUid": "best_replacement",
  "reasoning": "Why this reassignment"
}
`

---

## 🔴 Burnout Detection Logic

| Trigger | Threshold | Effect |
|---------|-----------|--------|
| High Load | Load Score > 80 | ⚠️ Burnout Flag |
| Low Sentiment | sentiment_score < 0.3 | ⚠️ Burnout Flag |
| Late Night | 12 AM - 5 AM activity | 🚨 High Risk Alert |
| Stressed Tone | Chat tone = "stressed" | +20 Load Penalty |

---

## 📝 Files to Present

### For Judges:
1. **PRD_Reasoning_Engine.md** - Functional requirements
2. **Pitch_Deck_Reasoning_Engine.md** - Explain proprietary logic
3. **backend/reasoning.py** - Core code
4. **backend/test_reasoning_unit.py** - Working demo

### For Integration with Task 3:
- Output format: JSON with suggestedTid, fromUid, toUid, reasoning
- Location: Approvals collection in Firebase
- Status field: \"pending\" (Task 3 will execute and change to \"approved\"/\"rejected\")

---

## 🔗 Integration Points

### With Task 1 (Input Processing)
- Input sentiment data populates Inputs collection
- Chat logs with timestamps help detect late-night activity
- \"stressed\" tone is detected and adds burnout penalty

### With Task 3 (Execution)
- Task 2 outputs JSON to Approvals collection
- Task 3 reads the JSON and executes reassignments
- Task 3 updates status in Approvals

---

## ✅ Pre-Competition Checklist

- [ ] Unit tests pass (mock data)
- [ ] Burnout tests pass (all 6 cases)
- [ ] Database seeded with test data
- [ ] Integration tests pass (Firebase connected)
- [ ] E2E test passes (full workflow)
- [ ] JSON output has all required fields
- [ ] No errors in logs
- [ ] PRD document reviewed
- [ ] Pitch deck slides ready
- [ ] Code is clean and commented

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| ImportError: No module named 'openai' | Run: pip install openai firebase-admin |
| Firebase connection error | Check serviceAccountKey.json path in .env |
| No orphaned tasks found | Verify assignedTo field matches user_01 |
| Burnout logic test fails | Check thresholds: Load > 80, Sentiment < 0.3 |
| JSON validation error | Ensure all 4 fields present: suggestedTid, fromUid, toUid, reasoning |

---

## 🎯 What Makes This \"Proprietary\"

✅ **Custom Prompt Engineering** - System instruction ensures logical output
✅ **Burnout Detection** - Combines load, sentiment, and late-night activity
✅ **Skill Matching** - Ensures task relevance
✅ **Load Balancing** - Distributes work fairly
✅ **Future-Proof** - GLM-5 compatible OpenAI SDK

---

## 📞 Quick Reference

**Reasoning Module**: ackend/reasoning.py
**Test Unit**: python backend/test_reasoning_unit.py
**Test Burnout**: python backend/test_burnout_logic.py
**Seed DB**: 
ode backend/seedDatabase.js
**Check Firebase**: [Firebase Console](https://console.firebase.google.com)

---

## 🎉 You're Ready!

Task 2 is fully implemented and testable. Now:
1. Run the tests to verify everything works
2. Present the PRD and pitch deck
3. Integrate with Task 3 (Execution Layer)
4. Show the judges how the system reasons about reassignments

Good luck! 🚀