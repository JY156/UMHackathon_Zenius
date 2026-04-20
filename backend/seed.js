const { db } = require('./config/firebase-admin');

const seedZenius = async () => {
    console.log("🌱 Starting Zenius deep seed process...");
    const batch = db.batch();

    // 1. Mock Users (5 Users)
    const users = [
        { uid: "user_nc", data: { name: "NC", email: "nc@zenius.ai", skills: ["Firebase", "System Design"], task_capacity: 30, current_load: 18, status: "overwhelmed", sentiment_score: 0.4, timezone: "Asia/Kuala_Lumpur" }},
        { uid: "user_xw", data: { name: "XWei", email: "xw@zenius.ai", skills: ["LLM Prompting", "Logic"], task_capacity: 25, current_load: 12, status: "active", sentiment_score: 0.9, timezone: "Asia/Kuala_Lumpur" }},
        { uid: "user_sy", data: { name: "SY", email: "sy@zenius.ai", skills: ["Python", "APIs"], task_capacity: 25, current_load: 10, status: "active", sentiment_score: 0.8, timezone: "Asia/Kuala_Lumpur" }},
        { uid: "user_jyuen", data: { name: "Jing Yuen", email: "jy@zenius.ai", skills: ["React", "UI/UX"], task_capacity: 20, current_load: 8, status: "active", sentiment_score: 0.85, timezone: "Asia/Kuala_Lumpur" }},
        { uid: "user_jying", data: { name: "JYing", email: "jying@zenius.ai", skills: ["Jira API", "Integration"], task_capacity: 20, current_load: 5, status: "active", sentiment_score: 0.95, timezone: "Asia/Kuala_Lumpur" }}
    ];

    users.forEach(u => batch.set(db.collection('users').doc(u.uid), u.data));

    // 2. Mock Tasks (10 Tasks - linked to users)
    const tasks = [
        { tid: "task_001", data: { title: "Firestore Schema Fix", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 5, category: "Professional", status: "in-progress" }},
        { tid: "task_002", data: { title: "API Documentation", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 2, category: "Administrative", status: "todo" }},
        { tid: "task_003", data: { title: "Prompt Engineering", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 4, category: "Professional", status: "in-progress" }},
        { tid: "task_004", data: { title: "Slack Webhook Setup", assignedTo: "user_sy", previousAssignee: ["user_nc"], moveCount: 1, priority: 3, category: "Professional", status: "done" }},
        { tid: "task_005", data: { title: "Dashboard Heatmap", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 4, category: "Professional", status: "todo" }},
        { tid: "task_006", data: { title: "Jira OAuth Bridge", assignedTo: "user_jying", previousAssignee: [], moveCount: 0, priority: 5, category: "Professional", status: "in-progress" }},
        { tid: "task_007", data: { title: "Team Sync Notes", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 1, category: "Administrative", status: "todo" }},
        { tid: "task_008", data: { title: "Logo Branding", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 2, category: "Administrative", status: "done" }},
        { tid: "task_009", data: { title: "Unit Testing Logic", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 3, category: "Professional", status: "todo" }},
        { tid: "task_010", data: { title: "Email Parser", assignedTo: "user_sy", previousAssignee: [], moveCount: 0, priority: 4, category: "Professional", status: "in-progress" }}
    ];

    tasks.forEach(t => batch.set(db.collection('tasks').doc(t.tid), t.data));

    // 3. Mock Approvals (3 Approvals)
    const approvals = [
        { id: "app_001", data: { suggestedTid: "task_001", fromUid: "user_nc", toUid: "user_xw", reasoning: "NC is overwhelmed; XWei has spare capacity and logic skills.", status: "pending", priority: 5, createdAt: new Date() }},
        { id: "app_002", data: { suggestedTid: "task_007", fromUid: "user_nc", toUid: "user_jyuen", reasoning: "Offloading admin work to free up the Architect.", status: "approved", priority: 1, createdAt: new Date() }},
        { id: "app_003", data: { suggestedTid: "task_003", fromUid: "user_xw", toUid: "user_sy", reasoning: "Cross-training attempt.", status: "rejected", priority: 4, createdAt: new Date() }}
    ];

    approvals.forEach(a => batch.set(db.collection('approvals').doc(a.id), a.data));

    // 4. Mock Logs (2 Logs)
    const logs = [
        { id: "log_001", data: { timestamp: new Date(), type: "Alert", severity: "Critical", detail: { tid: "task_001", fromUser: "user_nc", reason: "System Architect capacity exceeded 120%." }}},
        { id: "log_002", data: { timestamp: new Date(), type: "Reassignment", severity: "Info", detail: { tid: "task_007", fromUser: "user_nc", toUser: "user_jyuen", reason: "Manual load balancing." }}}
    ];

    logs.forEach(l => batch.set(db.collection('logs').doc(l.id), l.data));

    // 5. Inputs (5 Entries)
    const inputs = [
        { 
            id: "in_001", 
            data: { 
                source: "Slack", 
                content: "Hey team, I'm feeling quite unwell. Going to see a doctor and might be out for the next 2 days.", 
                processed: false, 
                sentiment: { score: 0.2 }, 
                timestamp: new Date() 
            }
        },
        { 
            id: "in_002", 
            data: { 
                source: "Email", 
                content: "The client just bumped up the deadline for the Jira integration. Needs to be done by tomorrow EOD.", 
                processed: false, 
                sentiment: { score: 0.4 }, 
                timestamp: new Date() 
            }
        },
        { 
            id: "in_003", 
            data: { 
                source: "Slack", 
                content: "I've been working until 3 AM for three nights straight. I'm hitting a wall and need a break.", 
                processed: false, 
                sentiment: { score: 0.1 }, 
                timestamp: new Date() 
            }
        },
        { 
            id: "in_004", 
            data: { 
                source: "Meeting Minutes", 
                content: "Summary: NC is currently handling the bulk of the database work. Project risk is high due to single-point failure.", 
                processed: false, 
                sentiment: { score: 0.5 }, 
                timestamp: new Date() 
            }
        },
        { 
            id: "in_005", 
            data: { 
                source: "Slack", 
                content: "Does anyone know how to fix the Vercel deployment? I've been stuck on this for 6 hours.", 
                processed: false, 
                sentiment: { score: 0.3 }, 
                timestamp: new Date() 
            }
        }
    ];

    inputs.forEach(i => batch.set(db.collection('inputs').doc(i.id), i.data));

    try {
        await batch.commit();
        console.log("✅ Zenius database seeded: 5 Users, 10 Tasks, 3 Approvals, 2 Logs, 2 Inputs.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedZenius();