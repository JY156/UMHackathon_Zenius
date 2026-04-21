// backend/test-api.js
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log("🚀 Starting Zenius Agentic Workflow Tests...\n");

    try {
        // --- 1. Initial State Check ---
        console.log("--- INITIAL STATE ---");
        const usersRes = await fetch(`${BASE_URL}/users`);
        const users = await usersRes.json();
        console.log("Users Snapshot:", JSON.stringify(users, null, 2));

        const tasksRes = await fetch(`${BASE_URL}/tasks`);
        const tasks = await tasksRes.json();
        console.log("Tasks Snapshot:", JSON.stringify(tasks, null, 2), "\n");

        if (tasks.length === 0 || users.length < 2) {
            throw new Error("Insufficient data. Please seed your database.");
        }

        const task = tasks[0];
        const fromUser = users.find(u => u.uid === task.assignedTo);
        const toUser = users.find(u => u.uid !== task.assignedTo);

        // --- 2. Create AI Approval Request ---
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

        // --- 3. Manager Approval Step ---
        console.log("--- STEP 2: MANAGER ORCHESTRATION ---");
        const managerRes = await fetch(`${BASE_URL}/approvals/${approvalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'pending owner acceptance', 
                actorUid: 'manager_123' 
            })
        });
        const managerData = await managerRes.json();
        console.log("Manager Update Response:", JSON.stringify(managerData, null, 2), "\n");

        // --- 4. New Owner Acceptance (Execution) ---
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

        // --- 5. Final Load Verification ---
        console.log("--- FINAL VERIFICATION ---");
        const finalUsersRes = await fetch(`${BASE_URL}/users`);
        const finalUsers = await finalUsersRes.json();
        
        console.log("Updated User Loads:");
        finalUsers.forEach(u => {
            console.log(`- ${u.name}: ${u.current_load.toFixed(2)}`);
        });

        // --- 6. Log Audit ---
        const logsRes = await fetch(`${BASE_URL}/logs`);
        const logs = await logsRes.json();
        console.log("\nLatest Log Entry:", JSON.stringify(logs[0], null, 2));

        console.log("\n🎉 Workflow Test Finished.");

    } catch (error) {
        console.error("\n❌ TEST ERROR:", error.message);
    }
};

runTests();