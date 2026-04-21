// backend/test-api.js
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log("🚀 Starting Zenius Agentic Workflow Tests...\n");

    try {
        // --- 1. Initial State Check ---
        console.log("--- INITIAL STATE ---");
        const usersRes = await fetch(`${BASE_URL}/users`);
        const users = await usersRes.json();
        
        const tasksRes = await fetch(`${BASE_URL}/tasks`);
        const tasks = await tasksRes.json();

        if (tasks.length === 0 || users.length < 2) {
            throw new Error("Insufficient data. Please seed your database.");
        }

        const testUser = users[0]; // Used for Add Task and Single User Fetch

        // --- NEW TEST 1: Create New Task (Agent Extraction Simulation) ---
        // Simulates GLM extracting a task from meeting minutes
        console.log("--- TEST: CREATE NEW TASK ---");
        const newTaskRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Emergency Security Patch",
                assignedTo: testUser.uid,
                priority: 5,
                category: "Professional", // Triggers 1.5x multiplier
                status: "todo"
            })
        });
        const newTaskData = await newTaskRes.json();
        console.log("New Task Created JSON:", JSON.stringify(newTaskData, null, 2), "\n");

        // --- NEW TEST 2: Fetch Specific User (Dashboard Detail View) ---
        // Verifies the stateful engine returns real-time load for one user [cite: 1]
        console.log("--- TEST: FETCH SINGLE USER ---");
        const singleUserRes = await fetch(`${BASE_URL}/users/${testUser.uid}`);
        const singleUserData = await singleUserRes.json();
        console.log(`User Detail for ${testUser.name}:`, JSON.stringify(singleUserData, null, 2), "\n");

        // --- Existing Reassignment Workflow ---
        const task = tasks[0];
        const fromUser = users.find(u => u.uid === task.assignedTo);
        const toUser = users.find(u => u.uid !== task.assignedTo);

        console.log("--- STEP 1: AI REASONING ---");
        const appReq = await fetch(`${BASE_URL}/approvals/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tid: task.tid,
                fromUid: fromUser.uid,
                toUid: toUser.uid,
                reasoning: "High burnout risk detected by Zenius Brain."
            })
        });
        const appData = await appReq.json();
        console.log("Approval Created JSON:", JSON.stringify(appData, null, 2), "\n");

        const approvalId = appData.approvalId;

        console.log("--- STEP 2: MANAGER ORCHESTRATION ---");
        await fetch(`${BASE_URL}/approvals/${approvalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'pending owner acceptance', 
                actorUid: 'manager_123' 
            })
        });

        console.log("--- STEP 3: ACTION LAYER EXECUTION ---");
        const ownerRes = await fetch(`${BASE_URL}/approvals/${approvalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'accepted by new owner', 
                actorUid: toUser.uid 
            })
        });
        const ownerData = await ownerRes.json();
        console.log("Owner Acceptance JSON:", JSON.stringify(ownerData, null, 2), "\n");

        // --- Final Verification ---
        console.log("--- FINAL VERIFICATION ---");
        const finalUsersRes = await fetch(`${BASE_URL}/users`);
        const finalUsers = await finalUsersRes.json();
        
        console.log("Updated User Loads (Should reflect New Task + Reassignment):");
        finalUsers.forEach(u => {
            console.log(`- ${u.name}: ${u.current_load.toFixed(2)}`);
        });

        console.log("\n🎉 Workflow Test Finished.");

    } catch (error) {
        console.error("\n❌ TEST ERROR:", error.message);
    }
};

runTests();