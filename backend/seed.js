const { admin, db } = require('./config/firebase-admin');

const seedZenius = async () => {
    console.log("🌱 Starting Zenius deep seed process...");
    const batch = db.batch();
    const now = Date.now();
    const oneDay = 86400000;

    // 1. Mock Users
    const users = [
        { uid: "user_nc", data: { name: "Nicol", email: "nicolhengsiyi@gmail.com", skills: ["Firebase", "System Design"], task_capacity: 30, current_load: 28, status: "overwhelmed", sentiment_score: 0.3, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_xw", data: { name: "Phuah", email: "24004603@siswa.um.edu.my", skills: ["LLM Prompting", "Logic"], task_capacity: 25, current_load: 12, status: "active", sentiment_score: 0.9, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_sy", data: { name: "Syn", email: "synyeetan0114@gmail.com", skills: ["Python", "APIs"], task_capacity: 25, current_load: 10, status: "active", sentiment_score: 0.8, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_jyuen", data: { name: "Chia", email: "24004611@siswa.um.edu.my", skills: ["React", "UI/UX", "Management"], task_capacity: 20, current_load: 8, status: "active", sentiment_score: 0.85, timezone: "Asia/Kuala_Lumpur" } },
        { uid: "user_jying", data: { name: "Teo", email: "24004591@siswa.um.edu.my", skills: ["Jira API", "Integration"], task_capacity: 20, current_load: 5, status: "active", sentiment_score: 0.95, timezone: "Asia/Kuala_Lumpur" } }
    ];
    users.forEach(u => batch.set(db.collection('users').doc(u.uid), u.data));

    // 2. Mock Tasks
    const tasks = [
    { tid: "task_001", data: { title: "Firestore Schema Fix", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 10, createdAt: new Date(now - oneDay * 2), completedAt: null, deadline: new Date(now + oneDay), lastStatusUpdate: new Date(now - oneDay * 2), requiredSkills: ["Firebase", "System Design"], category: "Professional" } },
    { tid: "task_002", data: { title: "API Documentation", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 2, status: "todo", estimatedEffort: 5, createdAt: new Date(now - oneDay), completedAt: null, deadline: new Date(now + oneDay * 3), lastStatusUpdate: new Date(now - oneDay), requiredSkills: ["APIs", "Technical Writing"], category: "Professional" } },
    { tid: "task_003", data: { title: "Prompt Engineering", projectId: "proj_ai", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 4, status: "in-progress", estimatedEffort: 5, createdAt: new Date(now - oneDay * 4), completedAt: null, deadline: new Date(now + oneDay * 2), lastStatusUpdate: new Date(now - oneDay * 3), requiredSkills: ["LLM Prompting", "Logic"], category: "Professional" } },
    { tid: "task_004", data: { title: "Slack Webhook Setup", projectId: "proj_core", assignedTo: "user_sy", previousAssignee: ["user_nc"], moveCount: 1, priority: 3, status: "done", estimatedEffort: 3, createdAt: new Date(now - oneDay * 3), completedAt: new Date(now - oneDay), deadline: new Date(now + oneDay * 2), lastStatusUpdate: new Date(now - oneDay), requiredSkills: ["APIs", "Integration"], category: "Professional" } },
    { tid: "task_005", data: { title: "Manager Dashboard UI", projectId: "proj_frontend", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 8, createdAt: new Date(now - oneDay), completedAt: null, deadline: new Date(now + oneDay * 4), lastStatusUpdate: new Date(now - oneDay), requiredSkills: ["React", "UI/UX", "Management"], category: "Professional" } },
    { tid: "task_006", data: { title: "Jira OAuth Bridge", projectId: "proj_core", assignedTo: "user_jying", previousAssignee: [], moveCount: 0, priority: 5, status: "in-progress", estimatedEffort: 6, createdAt: new Date(now - oneDay * 5), completedAt: null, deadline: new Date(now + oneDay), lastStatusUpdate: new Date(now - oneDay * 4), requiredSkills: ["Jira API", "Integration"], category: "Professional" } },
    { tid: "task_007", data: { title: "Agent Reasoning Logic", projectId: "proj_ai", assignedTo: "user_xw", previousAssignee: [], moveCount: 0, priority: 4, status: "todo", estimatedEffort: 7, createdAt: new Date(), completedAt: null, deadline: new Date(now + oneDay * 5), lastStatusUpdate: new Date(), requiredSkills: ["LLM Prompting", "Logic", "System Design"], category: "Professional" } },
    { tid: "task_008", data: { title: "Python File Parser", projectId: "proj_backend", assignedTo: "user_sy", previousAssignee: [], moveCount: 0, priority: 3, status: "todo", estimatedEffort: 4, createdAt: new Date(), completedAt: null, deadline: new Date(now + oneDay * 2), lastStatusUpdate: new Date(), requiredSkills: ["Python", "APIs"], category: "Professional" } },
    { tid: "task_009", data: { title: "Approval State Buttons", projectId: "proj_frontend", assignedTo: "user_jyuen", previousAssignee: [], moveCount: 0, priority: 3, status: "todo", estimatedEffort: 3, createdAt: new Date(), completedAt: null, deadline: new Date(now + oneDay * 3), lastStatusUpdate: new Date(), requiredSkills: ["React", "UI/UX"], category: "Professional" } },
    { tid: "task_010", data: { title: "Database Deployment", projectId: "proj_backend", assignedTo: "user_nc", previousAssignee: [], moveCount: 0, priority: 4, status: "todo", estimatedEffort: 5, createdAt: new Date(), completedAt: null, deadline: new Date(now + oneDay * 4), lastStatusUpdate: new Date(), requiredSkills: ["Firebase", "System Design", "DevOps"], category: "Professional" } }
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

    // 5. Inputs
    // backend/seed.js - Updated inputs section
    const inputs = [
        {
            id: "in_001",
            data: {
                // ✅ Core fields at root level (no nested metadata)
                source: "gmail",  // Changed from "Email"
                subject: "Medical Leave Application - PE3853805",
                content: "Dear Manager, I am feeling unwell today and went to see doctor this morning. I cannot complete my assigned tasks today. I have attached my medical certificate for your record. Please reassign my urgent items if necessary. Regards, Syn Yee.",
                sender: "Syn Yee Tan <synyeetan0114@gmail.com>",  // ✅ Flattened from metadata
                threadId: "19dc412df14d1dd2",  // ✅ Flattened from metadata
                
                // ✅ Timestamps
                emailTimestamp: new Date("2026-04-25T17:57:32").toISOString(),  // ✅ ISO string
                timestamp: admin.firestore.FieldValue.serverTimestamp(),  // ✅ Firestore timestamp
                processedAt: admin.firestore.FieldValue.serverTimestamp(),  // ✅ Firestore timestamp
                
                // ✅ Processing status
                processed: true,  // Set to false if you want to test processing
                category: "LEAVE_RESIGNATION",  // ✅ Added for processed inputs
                
                // ✅ Attachment fields at root level
                hasAttachments: true,
                fileName: "MC_PE3853805_Tan Syn Yee_20260425.docx",
                fileUrl: "https://storage.googleapis.com/umhackathon-zenius.firebasestorage.app/inputs/1777136116087_MC_PE3853805_Tan Syn Yee_20260425.docx",
                parsedFileContent: "CLINIC SEJAHTERA KUALA LUMPUR Patient Name: SY Date of Visit: April 25, 2026 Diagnosis: Acute Viral Infection Recommendation: 2 Days Medical Leave (April 25 - April 26) Status: Unfit for work."
                // ✅ Removed: batchId (not in new format)
            }
        },
        {
            id: "in_002",
            data: {
                source: "gmail",
                subject: "URGENT: Jira Integration Deadline",
                content: "The client just bumped up the deadline for the Jira integration. Needs to be done by tomorrow EOD.",
                sender: "Client PM <client@company.com>",
                threadId: "thread_client_02",
                
                emailTimestamp: new Date().toISOString(),
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                
                processed: true,
                category: "URGENT_DEADLINE",
                
                hasAttachments: false,
                fileName: null,
                fileUrl: null,
                parsedFileContent: null
            }
        },
        {
            id: "in_003",
            data: {
                source: "gmail",
                subject: "New Feature Request - Dashboard Heatmap",
                content: "Please review the attached brief for the new dashboard heatmap feature. We need to visualize team burnout using color-coded components. This should integrate with our existing analytics platform.",
                sender: "Product Team <product@zenius.ai>",
                threadId: "thread_prod_03",
                
                emailTimestamp: new Date().toISOString(),
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                
                processed: true,
                category: "NEW_TASK_REQUEST",
                
                hasAttachments: true,
                fileName: "feature_brief.pdf",
                fileUrl: "https://storage.googleapis.com/umhackathon-zenius.firebasestorage.app/inputs/feature_brief.pdf",
                parsedFileContent: "FEATURE BRIEF\nProject: Dashboard Heatmap\nGoal: Visualize team burnout using color-coded components\nRequirements:\n- React frontend integration\n- Real-time data updates\n- Role-based access control\n- Export to PNG/PDF"
            }
        }
    ];
    inputs.forEach(i => batch.set(db.collection('inputs').doc(i.id), i.data));

    // 6. System Logs (including Stalled Task detection)
    const logs = [
        { id: "log_001", data: { event: "REASSIGNMENT_EXECUTED", level: "Warning", details: "Task Slack Webhook Setup reassigned from NC to SY due to load balancing.", timestamp: new Date(now - oneDay * 3) } },
        { id: "log_002", data: { event: "TASK_STATUS_UPDATED", level: "Info", details: "Task Slack Webhook Setup marked as done by SY.", timestamp: new Date(now - oneDay) } },
        { id: "log_003", data: { event: "STALLED_TASK_DETECTED", level: "Warning", details: "Task Prompt Engineering is in-progress but hasn't had an update in 3 days. Assigned to XWei.", timestamp: new Date(now - 3600000) } },
        { id: "log_004", data: { event: "STALLED_TASK_DETECTED", level: "Warning", details: "Task Jira OAuth Bridge is in-progress but hasn't had an update in 4 days. Assigned to JYing.", timestamp: new Date(now - 1800000) } },
        { id: "log_005", data: { event: "WORKLOAD_ALERT", level: "Error", details: "User NC has exceeded recommended task capacity (28/30) and sentiment is overwhelmed.", timestamp: new Date() } }
    ];
    logs.forEach(l => batch.set(db.collection('logs').doc(l.id), l.data));

    try {
        await batch.commit();
        console.log("✅ Zenius database seeded successfully with 10 tasks, formatted emails, and system logs.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedZenius();