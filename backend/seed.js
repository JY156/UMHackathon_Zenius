const { db } = require('./config/firebase-admin');

const seedZenius = async () => {
    console.log("🌱 Starting Zenius deep seed process...");
    const batch = db.batch();
    const now = Date.now();
    const oneDay = 86400000;

    // 1. Mock Users
    const users = [
        { uid: "user_nc", data: { name: "NC", email: "nc@zenius.ai", skills: ["Firebase", "System Design"], task_capacity: 30, current_load: 28, status: "overwhelmed", sentiment_score: 0.3, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_xw", data: { name: "XWei", email: "xw@zenius.ai", skills: ["LLM Prompting", "Logic"], task_capacity: 25, current_load: 12, status: "active", sentiment_score: 0.9, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_sy", data: { name: "SY", email: "sy@zenius.ai", skills: ["Python", "APIs"], task_capacity: 25, current_load: 10, status: "active", sentiment_score: 0.8, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_jyuen", data: { name: "Jing Yuen", email: "jy@zenius.ai", skills: ["React", "UI/UX", "Management"], task_capacity: 20, current_load: 8, status: "active", sentiment_score: 0.85, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_jying", data: { name: "JYing", email: "jying@zenius.ai", skills: ["Jira API", "Integration"], task_capacity: 20, current_load: 5, status: "active", sentiment_score: 0.95, timezone: "Asia/Kuala_Lumpur" } }
    ];
    users.forEach(u => batch.set(db.collection('users').doc(u.uid), u.data));

    // 2. Mock Tasks (Expanded to 10)
    const tasks = [
        { tid: "task_001", data: { title: "Firestore Schema Fix", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 10, createdAt: new Date(now - oneDay * 2), completedAt: null } },
        { tid: "task_002", data: { title: "API Documentation", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 2, status: "todo", estimatedEffort: 5, createdAt: new Date(now - oneDay), completedAt: null } },
        { tid: "task_003", data: { title: "Prompt Engineering", projectId: "proj_ai", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 4, status: "in-progress", estimatedEffort: 5, createdAt: new Date(now - oneDay * 2), completedAt: null } },
        { tid: "task_004", data: { title: "Slack Webhook Setup", projectId: "proj_core", assignedTo: "user_sy", previousAssignee: ["user_nc"], moveCount: 1, priority: 3, status: "done", estimatedEffort: 3, createdAt: new Date(now - oneDay * 3), completedAt: new Date(now - oneDay) } },
        { tid: "task_005", data: { title: "Manager Dashboard UI", projectId: "proj_frontend", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 8, createdAt: new Date(now - oneDay), completedAt: null } },
        { tid: "task_006", data: { title: "Jira OAuth Bridge", projectId: "proj_core", assignedTo: "user_jying", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 6, createdAt: new Date(now - oneDay * 2), completedAt: null } },
        { tid: "task_007", data: { title: "Agent Reasoning Logic", projectId: "proj_ai", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 4, status: "todo", estimatedEffort: 7, createdAt: new Date(), completedAt: null } },
        { tid: "task_008", data: { title: "Python File Parser", projectId: "proj_backend", assignedTo: "user_sy", previousAssignee: [], moveCount: 0, priority: 3, status: "todo", estimatedEffort: 4, createdAt: new Date(), completedAt: null } },
        { tid: "task_009", data: { title: "Approval State Buttons", projectId: "proj_frontend", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 3, status: "todo", estimatedEffort: 3, createdAt: new Date(), completedAt: null } },
        { tid: "task_010", data: { title: "Database Deployment", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 4, status: "todo", estimatedEffort: 5, createdAt: new Date(), completedAt: null } }
    ];
    tasks.forEach(t => batch.set(db.collection('tasks').doc(t.tid), t.data));

    // 3. Mock Historical Stats
    const userStats = [
        { id: "stat_001", data: { userId: "user_nc", load_score: 10, sentiment: 0.8, trigger: "task_assigned", timestamp: new Date(now - oneDay * 3) } },
        { id: "stat_002", data: { userId: "user_nc", load_score: 20, sentiment: 0.5, trigger: "task_assigned", timestamp: new Date(now - oneDay * 2) } },
        { id: "stat_003", data: { userId: "user_nc", load_score: 28, sentiment: 0.3, trigger: "deadline_updated", timestamp: new Date(now - oneDay) } },
        { id: "stat_004", data: { userId: "user_xw", load_score: 12, sentiment: 0.9, trigger: "task_completed", timestamp: new Date(now - oneDay * 2) } }
    ];
    userStats.forEach(s => batch.set(db.collection('user_stats').doc(s.id), s.data));

    // 4. Mock Approvals
    const approvals = [
        { id: "app_001", data: { suggestedTid: "task_001", fromUid: "user_nc", toUid: "user_xw", reasoning: "NC is overwhelmed; XWei has spare capacity and logic skills.", status: "pending", priority: 5, createdAt: new Date() } }
    ];
    approvals.forEach(a => batch.set(db.collection('approvals').doc(a.id), a.data));

    // 5. Inputs (All Emails, Matching Your Schema)
    const inputs = [
        {
            id: "in_001",
            data: {
                source: "Email",
                subject: "Medical Leave - SY",
                content: "Boss, I'm feeling quite unwell. Going to see a doctor.", 
                processed: false,
                timestamp: new Date(),
                metadata: { subject: "Medical Leave - SY", sender: "sy@zenius.ai", threadId: "thread_mc_01" },
                hasAttachments: true,
                fileUrl: "https://storage.googleapis.com/mock-bucket/mc_slip.pdf",
                fileName: "mc_slip.pdf",
                parsedFileContent: "MEDICAL CERTIFICATE\nName: SY\nDays: 2",
                batchId: "batch_Medical_Leave_-_SY"
            } 
        },
        { 
            id: "in_002", 
            data: { 
                source: "Email", 
                subject: "URGENT: Jira Integration Deadline",
                content: "The client just bumped up the deadline for the Jira integration. Needs to be done by tomorrow EOD.", 
                processed: false, 
                timestamp: new Date(),
                metadata: { subject: "URGENT: Jira Integration Deadline", sender: "client@company.com", threadId: "thread_client_02" },
                hasAttachments: false,
                fileUrl: null,
                fileName: null,
                parsedFileContent: null,
                batchId: "batch_URGENT:_Jira_Integration_Deadline"
            } 
        },
        { 
            id: "in_003", 
            data: { 
                source: "Email", 
                subject: "New Feature Request - Heatmap",
                content: "Please review the attached brief for the new dashboard heatmap feature.", 
                processed: false, 
                timestamp: new Date(),
                metadata: { subject: "New Feature Request - Heatmap", sender: "product@zenius.ai", threadId: "thread_prod_03" },
                hasAttachments: true,
                fileUrl: "https://storage.googleapis.com/mock-bucket/feature_brief.pdf",
                fileName: "feature_brief.pdf",
                parsedFileContent: "FEATURE BRIEF\nGoal: Visualize team burnout using color-coded components.",
                batchId: "batch_New_Feature_Request_-_Heatmap"
            } 
        }
    ];
    inputs.forEach(i => batch.set(db.collection('inputs').doc(i.id), i.data));

    try {
        await batch.commit();
        console.log("✅ Zenius database seeded successfully with 10 tasks and formatted emails.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedZenius();