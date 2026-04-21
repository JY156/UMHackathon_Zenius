# Database Setup Guide for Task 2: Reasoning Engine

## What Does the Database Do for Task 2?

The database (Firebase Firestore) is the **data foundation** for the Reasoning Engine. Here's what it provides:

### 1. **Users Collection** - Team Member Information
- Stores all team members' data.
- The reasoning module queries this to find potential replacements.
- Fields: uid, name, skills, current_load, sentiment_score, email.

### 2. **Tasks Collection** - Work Items to be Reassigned
- Stores all project tasks.
- The reasoning module queries this to find orphaned tasks (from absent user).
- Fields: tid, title, description, assignedTo, skills (required), priority, difficulty, status.

### 3. **Inputs Collection** - Chat Logs & Sentiment Data (from Task 1)
- Stores unprocessed inputs (messages, emails, chat logs).
- Used for sentiment analysis to detect burnout (stressed tone).
- Fields: source, content, processed, sentiment, timestamp, metadata.

### 4. **Approvals Collection** - Reasoning Results
- Stores the output of the Reasoning Engine (reassignment decisions).
- Created after GLM reasoning completes.
- Fields: suggestedTid, fromUid, toUid, reasoning, timestamp.

### 5. **Chat Logs Collection** (Optional) - Late Night Activity Tracking
- Tracks when team members are communicating (for 12 AM - 5 AM burnout flag).
- Fields: uid, message, timestamp, sentiment.

---

## Step 1: Firebase Project Setup

### If You Already Have Firebase Project:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your existing project.
3. Go to **Firestore Database** → Create Database.
4. Choose **Production Mode** (or Start in Test Mode for development).
5. Select your region.

### If You Need a New Firebase Project:
1. Create a new project in Firebase Console.
2. Add your app (Web + Node.js).
3. Download the service account key:
   - Go to **Project Settings** → **Service Accounts**.
   - Click **Generate New Private Key**.
   - Save the JSON file to ackend/serviceAccountKey.json (already in .gitignore).

---

## Step 2: Create Collections and Seed Data

### Collections Structure:

#### **Collection: users**
`json
{
  "uid": "user_01",
  "name": "Sarah Chen",
  "email": "sarah@company.com",
  "skills": ["Python", "API Design", "Database"],
  "sentiment_score": 0.85,
  "current_load": 25,
  "role": "Senior Developer"
}
`

#### **Collection: tasks**
`json
{
  "tid": "TASK-001",
  "title": "Build REST API Endpoint",
  "description": "Create new endpoint for user authentication",
  "assignedTo": "user_01",
  "skills": ["Python", "API Design"],
  "priority": 3,
  "difficulty": 2,
  "status": "in_progress",
  "dueDate": "2026-04-25"
}
`

#### **Collection: inputs** (Chat logs for sentiment)
`json
{
  "source": "slack",
  "content": "I'm feeling stressed with the deadline",
  "processed": false,
  "sentiment": {
    "score": 0.4,
    "tone": "stressed"
  },
  "timestamp": "2026-04-21T10:30:00Z",
  "metadata": {
    "userId": "user_01",
    "channelId": "dev-team"
  }
}
`

#### **Collection: approvals** (Output from Task 2)
`json
{
  "suggestedTid": "TASK-001",
  "fromUid": "user_01",
  "toUid": "user_02",
  "reasoning": "Skill match (Python) and lowest current_load (15). Sentiment score 0.8 (no burnout risk).",
  "timestamp": "2026-04-21T11:00:00Z",
  "status": "pending"
}
`

---

## Step 3: Manual Setup via Firebase Console

1. **Create 'users' Collection**:
   - Go to Firestore Console.
   - Click **Start Collection** → Name it "users".
   - Add documents with the structure above.

2. **Create 'tasks' Collection**:
   - Add collection → Name it "tasks".
   - Add sample tasks.

3. **Create 'inputs' Collection**:
   - Add collection → Name it "inputs".
   - Add sample chat logs.

4. **Create 'approvals' Collection**:
   - Add collection → Name it "approvals".
   - Leave empty for now (Task 2 will populate it).

---

## Step 4: Automated Setup via Script

Run this Node.js script to auto-populate test data:

### File: backend/seedDatabase.js

\\\javascript
const { db } = require('./config/firebase-admin');

async function seedDatabase() {
    console.log('Seeding Firestore database...');

    // Seed users
    const users = [
        {
            uid: 'user_01',
            name: 'Sarah Chen',
            email: 'sarah@company.com',
            skills: ['Python', 'API Design'],
            sentiment_score: 0.85,
            current_load: 25,
            role: 'Senior Developer'
        },
        {
            uid: 'user_02',
            name: 'John Smith',
            email: 'john@company.com',
            skills: ['React', 'Frontend'],
            sentiment_score: 0.7,
            current_load: 15,
            role: 'Frontend Developer'
        },
        {
            uid: 'user_03',
            name: 'Mike Johnson',
            email: 'mike@company.com',
            skills: ['Python', 'API Design', 'Database'],
            sentiment_score: 0.4,
            current_load: 45,
            role: 'Senior Backend Developer'
        }
    ];

    for (const user of users) {
        await db.collection('users').doc(user.uid).set(user);
        console.log(\Created user: \\);
    }

    // Seed tasks
    const tasks = [
        {
            tid: 'TASK-001',
            title: 'Build REST API Endpoint',
            description: 'Create new endpoint for authentication',
            assignedTo: 'user_01',
            skills: ['Python', 'API Design'],
            priority: 3,
            difficulty: 2,
            status: 'in_progress',
            dueDate: '2026-04-25'
        },
        {
            tid: 'TASK-002',
            title: 'Database Schema Design',
            description: 'Design schema for user management',
            assignedTo: 'user_01',
            skills: ['Database', 'Python'],
            priority: 2,
            difficulty: 3,
            status: 'pending',
            dueDate: '2026-04-28'
        },
        {
            tid: 'TASK-003',
            title: 'Frontend Dashboard UI',
            description: 'Build admin dashboard',
            assignedTo: 'user_02',
            skills: ['React', 'Frontend'],
            priority: 2,
            difficulty: 2,
            status: 'in_progress',
            dueDate: '2026-04-30'
        }
    ];

    for (const task of tasks) {
        await db.collection('tasks').doc(task.tid).set(task);
        console.log(\Created task: \\);
    }

    // Seed inputs (chat logs)
    const inputs = [
        {
            source: 'slack',
            content: 'I am feeling overwhelmed with the workload',
            processed: false,
            sentiment: { score: 0.3, tone: 'stressed' },
            timestamp: new Date('2026-04-21T02:30:00Z'), // Late night
            metadata: { userId: 'user_03', channelId: 'dev-team' }
        },
        {
            source: 'email',
            content: 'All tasks on track. Feeling good!',
            processed: false,
            sentiment: { score: 0.85, tone: 'positive' },
            timestamp: new Date('2026-04-21T10:00:00Z'),
            metadata: { userId: 'user_01', email: 'team@company.com' }
        }
    ];

    for (const input of inputs) {
        await db.collection('inputs').add(input);
        console.log(\Created input from \\);
    }

    console.log('Database seeding complete!');
}

seedDatabase().catch(console.error);
\\\

**Run it**:
\\\ash
node backend/seedDatabase.js
\\\

---

## Step 5: Verify Database Setup

Run the connection test:

\\\ash
node backend/test-api.js
\\\

You should see output confirming Firestore connection.

---

## Next: Testing Task 2

See TESTING_GUIDE_TASK2.md for complete testing procedures.