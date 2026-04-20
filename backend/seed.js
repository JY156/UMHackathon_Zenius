const { db } = require('./config/firebase-admin');

const seedZenius = async () => {
    console.log("🌱 Starting seed process...");
    
    // Using a batch ensures ALL or NOTHING is written
    const batch = db.batch();

    // 1. Mock Users
    const users = [
        {
            uid: "user_sy",
            data: {
                name: "SY",
                email: "sy@zenius.ai",
                skills: ["Python", "API Ingestion", "Slack Integration"],
                task_capacity: 25,
                current_load: 0,
                status: "active",
                sentiment_score: 0.85,
                timezone: "Asia/Kuala_Lumpur"
            }
        },
        {
            uid: "user_xw",
            data: {
                name: "XWei",
                email: "xw@zenius.ai",
                skills: ["LLM Prompting", "Logic Flow", "Python"],
                task_capacity: 20,
                current_load: 0,
                status: "active",
                sentiment_score: 0.9,
                timezone: "Asia/Kuala_Lumpur"
            }
        },
        {
            uid: "user_nc",
            data: {
                name: "NC",
                email: "nc@zenius.ai",
                skills: ["Firebase", "Express", "System Design"],
                task_capacity: 30,
                current_load: 0,
                status: "overwhelmed",
                sentiment_score: 0.45,
                timezone: "Asia/Kuala_Lumpur"
            }
        }
    ];

    users.forEach(u => {
        const ref = db.collection('users').doc(u.uid);
        batch.set(ref, u.data);
    });

    // 2. Mock Tasks
    const tasks = [
        {
            tid: "task_001",
            data: {
                title: "Fix Webhook Latency",
                description: "Optimize the Slack listener to reduce 2s delay.",
                assignedTo: "user_sy",
                previousAssignee: ["user_nc"],
                moveCount: 1,
                priority: 4,
                category: "Professional",
                status: "in-progress",
                dueDate: new Date("2026-04-22T10:00:00Z")
            }
        },
        {
            tid: "task_002",
            data: {
                title: "Weekly Sync Prep",
                description: "Format the notes for the next team meeting.",
                assignedTo: "user_nc",
                previousAssignee: [],
                moveCount: 0,
                priority: 1,
                category: "Administrative",
                status: "todo",
                dueDate: new Date("2026-04-21T09:00:00Z")
            }
        }
    ];

    tasks.forEach(t => {
        const ref = db.collection('tasks').doc(t.tid);
        batch.set(ref, t.data);
    });

    // 3. Mock Log Entry
    const logRef = db.collection('logs').doc('log_init_001');
    batch.set(logRef, {
        timestamp: new Date(),
        type: "REASSIGNMENT",
        severity: "Warning",
        detail: {
            tid: "task_001",
            fromUser: "user_nc",
            toUser: "user_sy",
            triggerSource: "System",
            reason: "Initial load balancing: user_nc exceeds capacity."
        }
    });

    // 4. Vault Entries (Unstructured Inputs)
    const vaultEntries = [
        { id: "seed_v_001", content: "SY: I am feeling a bit sick today.", source: "Slack" },
        { id: "seed_v_002", content: "Project Deadline: April 26th.", source: "Email" }
    ];

    vaultEntries.forEach(entry => {
        const ref = db.collection('vault').doc(entry.id); 
        batch.set(ref, {
            content_blob: entry.content,
            source: entry.source,
            analysis_status: 'pending',
            timestamp: new Date()
        });
    });

    try {
        await batch.commit();
        console.log("✅ Zenius database seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedZenius();