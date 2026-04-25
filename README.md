# 🚀 Zenius

> **AI-Powered Task Orchestration for High-Performing Engineering Teams**

[![Hackathon](https://img.shields.io/badge/Hackathon-UM%20Hackathon%202026-blue)](https://umhackathon.com)
[![AI](https://img.shields.io/badge/AI-Z.AI%20GLM--5.1-purple)](https://z.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Zenius is an intelligent task management platform that **listens to your inbox**, **understands intent with AI**, and **orchestrates work** across your team — automatically. Built for the UMHackathon 2026 with sponsor-mandated Z.AI integration.

---

## Pitching Video
https://drive.google.com/file/d/1F6u2QLx_9OYlG1CZgi0S7B8S-ABrIGAq/view?usp=sharing

---

## ✨ Key Features

### 🤖 AI-Powered Email Intelligence
- **Auto-categorization**: Detects 4 intent types using Z.AI (`ilmu-glm-5.1`):
  - 🏖️ `LEAVE_RESIGNATION` → Triggers approval-based task reassignment
  - 😓 `WORKLOAD_STRESS` → Detects burnout risk + suggests load balancing
  - 📋 `NEW_TASK_REQUEST` → Extracts requirements + auto-assigns by skill fit
- **Multi-file attachment parsing**: PDF, DOCX, TXT, PPTX, XLSX (with OCR support)
- **Fallback logic**: Score-based assignment if AI is unavailable

### 👥 Human-in-the-Loop Workflow
- **Approval system**: Managers review & approve reassignments before execution
- **Transparent audit trail**: Every AI decision logged with reasoning
- **Override capability**: Managers can modify assignments or skip AI suggestions

### 📊 Real-Time Dashboards
#### Manager View
- **Project Snapshot**: Top 5 urgent tasks with completion progress bars
- **Triage Inbox**: Unprocessed inputs awaiting AI review
- **System Event Log**: Live feed of state transitions (reassignments, sentiment updates)
- **Task Assignments**: Stalled task detector + project-grouped task board
- **Team Overview**: 
  - Status badges (🟢 Balanced / 🟡 At Risk / 🔴 Overwhelmed) via sentiment + load calculation
  - Personal Kanban per employee
  - Resilience & Load History curve chart (workload over time)
- **Approval Center**: One-click approve/modify reassignment requests

#### Employee View
- **Capacity Gauge**: Visual load vs. capacity indicator
- **Personal Taskboard**: Drag-and-drop todo/in-progress/done columns
- **AI-Action Log**: Transparent feed of reassignments affecting the user

### 🔐 Production-Ready Architecture
- **Modular agents**: Router → Helper → TaskManagement (separation of concerns)
- **Service layer**: `taskService`, `approvalService`, `userService` for clean data access
- **Multi-provider AI**: Z.AI primary + Gemini fallback (configurable via `.env`)
- **Firestore-native**: Denormalized schema for fast queries, no JOINs

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Gmail Sensor  │────▶│   Zenius Backend│────▶│  Firebase       │
│   (Python/FastAPI)│     │   (Node/Express) │     │  Firestore      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   AI Provider Layer     │
                    │  • Z.AI (ilmu-glm-5.1)  │
                    │  • Gemini (fallback)    │
                    │  • OpenAI (optional)    │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Agent Services        │
                    │  • RouterAgent          │
                    │  • HelperAgent          │
                    │  • TaskManagementAgent  │
                    └─────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 18+, Express.js, Firebase Admin SDK |
| **Sensor** | Python 3.10+, FastAPI, Google Gmail API |
| **Database** | Firebase Firestore (NoSQL) |
| **Storage** | Firebase Storage (attachments) |
| **AI** | Z.AI (`ilmu-glm-5.1`), Google Gemini (`gemini-2.5-flash`) |
| **Auth** | Firebase Authentication (optional) |
| **Logging** | Winston + Firestore `logs` collection |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & `uv` or `pip`
- Firebase project with Firestore + Storage enabled
- Z.AI API key (sponsor-provided)
- Google Cloud project with Gmail API enabled (for sensor)

### 1. Clone & Install
```bash
# Backend
cd backend
npm install

# Sensor
cd ../sensor
pip install -r requirements.txt
# Or with uv: uv sync
```

### 2. Configure Environment
```bash
# backend/.env
ZAI_API_KEY=your_zai_key_here
GEMINI_API_KEY=your_gemini_key_here  # Optional fallback
AI_PRIMARY=zai
AI_FALLBACK=gemini
AI_TIMEOUT_MS=20000
firebase_service_account_key={"type":"service_account",...}

# sensor/.env
BACKEND_API_URL=http://localhost:5000/api
BACKEND_API_KEY=dev-key-123
REDIS_URL=redis://localhost:6379
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### 3. Seed Test Data
```bash
cd backend
node seed.js  # Creates mock users, tasks, inputs
```

### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
node index.js
# → 🚀 Zenius Backend running on http://localhost:5000

# Terminal 2: Sensor (optional for live Gmail)
cd sensor
uvicorn app.main:app --reload
# → 🤖 Zenius Gmail Sensor started...
```

### 5. Test the Flow
```bash
# Process a seeded input manually
curl -X POST http://localhost:5000/api/agents/process-input \
  -H "Content-Type: application/json" \
  -d '{"inputId": "in_001"}'

# Or trigger via sensor (if Gmail connected)
# → Send email to sensor Gmail account → auto-processes every 60s
```

---

## 📡 API Endpoints

### Agent Endpoints (`/api/agents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/process-input` | Process single input by ID or raw email data |
| `POST` | `/process-all-inputs` | Process all unprocessed inputs |
| `POST` | `/find-assignee` | Find best assignee for skills (Helper Agent) |
| `POST` | `/create-task` | Create new task with auto-assignment |
| `POST` | `/reassign-task` | Reassign task with approval workflow |
| `GET` | `/check-overwhelmed` | List users at burnout risk |
| `POST` | `/update-sentiment` | Manually update user sentiment |

### Data Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `GET` | `/api/tasks/user/:uid` | Get tasks by assignee |
| `PATCH` | `/api/tasks/:tid/status` | Update task status |
| `PATCH` | `/api/tasks/:tid/reassign` | Manual reassign (bypass approval) |
| `GET` | `/api/users` | List team members |
| `GET` | `/api/users/team-state` | Get team workload overview |
| `GET` | `/api/approvals` | List approval requests |
| `PATCH` | `/api/approvals/:id` | Approve/reject reassignment |

---

## 📁 Project Structure

```
UMHackathon_Zenius/
├── backend/
│   ├── config/
│   │   └── firebase-admin.js      # Firebase initialization
│   ├── routes/
│   │   ├── agentRoutes.js         # AI agent endpoints
│   │   ├── taskRoutes.js          # Task CRUD
│   │   ├── userRoutes.js          # User management
│   │   └── approvalRoutes.js      # Approval workflow
│   ├── services/
│   │   ├── aiProvider.js          # Multi-provider AI abstraction
│   │   ├── routerAgent.js         # Email categorization + routing
│   │   ├── helperAgent.js         # Skill matching + burnout detection
│   │   ├── taskManagementAgent.js # Task CRUD + assignment logic
│   │   ├── taskService.js         # Firestore task operations
│   │   ├── approvalService.js     # Approval workflow service
│   │   └── userService.js         # User operations + load calc
│   ├── utils/
│   │   └── loadCalculationConstants.js  # Burnout logic (shared)
│   ├── index.js                   # Express server entry
│   ├── seed.js                    # Mock data seeding
│   └── package.json
│
├── sensor/
│   ├── app/
│   │   ├── clients/
│   │   │   ├── backend_client.py  # Two-step ingest + process
│   │   │   └── gmail_client.py    # Gmail API wrapper
│   │   ├── parsers/
│   │   │   └── gmail_parser.py    # Email + attachment parsing
│   │   ├── utils/
│   │   │   ├── attachment_parser.py  # Multi-format text extraction
│   │   │   └── gmail_auth.py      # OAuth2 handling
│   │   ├── config.py              # Environment config
│   │   ├── main.py                # FastAPI app + polling loop
│   │   └── models.py              # Pydantic models
│   ├── requirements.txt
│   └── pyproject.toml
│
├── README.md
└── LICENSE
```

---

## 🎯 Hackathon Demo Guide

### Pre-Demo Setup
```bash
# 1. Seed clean test data
node backend/seed.js

# 2. Start backend with stable config
AI_FALLBACK=none AI_TIMEOUT_MS=20000 node backend/index.js

# 3. (Optional) Start sensor for live Gmail demo
cd sensor && uvicorn app.main:app
```

### Live Demo Flow (4-5 Minutes)
1. **Gmail Inbox** (0:00-0:45)
   - Show 3 unread emails: leave request, stress complaint, new task
   - Explain AI categorization types

2. **Manager Dashboard** (0:45-2:00)
   - Project Snapshot: Top 5 urgent tasks + progress bars
   - Triage Inbox + System Event Log: Real-time processing feed

3. **Task Assignments + Team Overview** (2:00-3:00)
   - Stalled task detector + project-grouped tasks
   - Team status badges + workload history chart

4. **Approval Workflow + Employee View** (3:00-4:00)
   - Approve a reassignment request
   - Show employee drag-and-drop taskboard + AI-action log

### Fallback Plan (If AI Is Slow)
- Use pre-processed inputs (`processed: true`) for guaranteed demo flow
- Mention "live Gmail integration" as production feature
- Trigger ONE live email as bonus if Z.AI responds quickly

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Coding Standards**:
- Backend: ESLint + Prettier config included
- Sensor: Black + isort for Python formatting
- Commit messages: Conventional Commits format

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- **UMHackathon 2026** organizers and sponsors
- **Z.AI** for providing `ilmu-glm-5.1` API access
- Firebase team for generous free tier
- Open-source libraries that made this possible: Express, FastAPI, PyPDF2, python-docx

---

> 💡 **Pro Tip**: For fastest demo setup, use `DEMO_MODE=true` in `.env` to skip AI calls and use mock responses. Perfect for unreliable conference Wi-Fi!

**Built with ❤️ by What Group Name?** 🚀