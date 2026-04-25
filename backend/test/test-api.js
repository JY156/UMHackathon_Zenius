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
        const toUser = users[1];

        // --- TEST 1: Fetch Team State (AI Context) ---
        console.log("--- TEST: FETCH TEAM STATE ---");
        const teamStateRes = await fetch(`${BASE_URL}/users/team-state`);
        const teamStateData = await teamStateRes.json();
        console.log("Team State Data length:", teamStateData.length, "\n");

        // --- TEST 2: Create New Task (Agent Extraction Simulation) ---
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

        // --- TEST 3: Fetch Specific User (Dashboard Detail View) ---
        console.log("--- TEST: FETCH SINGLE USER ---");
        const singleUserRes = await fetch(`${BASE_URL}/users/${testUser.uid}`);
        const singleUserData = await singleUserRes.json();
        console.log(`User Detail for ${testUser.name}:`, JSON.stringify(singleUserData, null, 2), "\n");

        // --- TEST 4: Fetch User Tasks (Dashboard) ---
        console.log("--- TEST: FETCH USER TASKS ---");
        const userTasksRes = await fetch(`${BASE_URL}/tasks/user/${testUser.uid}`);
        const userTasksData = await userTasksRes.json();
        console.log(`Tasks for ${testUser.name}:`, userTasksData.length, "tasks found.\n");

        // --- TEST 5: Manual Task Reassignment (Drag and Drop) ---
        console.log("--- TEST: MANUAL TASK REASSIGNMENT ---");
        const reassignTaskRes = await fetch(`${BASE_URL}/tasks/${newTaskData.taskId}/reassign`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromUid: testUser.uid,
                toUid: toUser.uid,
                reason: "Manager Override"
            })
        });
        const reassignTaskData = await reassignTaskRes.json();
        console.log("Manual Reassign JSON:", JSON.stringify(reassignTaskData, null, 2), "\n");

        // --- TEST 6: Update Task Status (Completion) ---
        console.log("--- TEST: UPDATE TASK STATUS ---");
        const updateTaskRes = await fetch(`${BASE_URL}/tasks/${newTaskData.taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'done' })
        });
        const updateTaskData = await updateTaskRes.json();
        console.log("Update Task Status JSON:", JSON.stringify(updateTaskData, null, 2), "\n");

        // --- TEST 7: Update User Sentiment (AI Burnout Detection) ---
        console.log("--- TEST: UPDATE USER SENTIMENT ---");
        const updateSentimentRes = await fetch(`${BASE_URL}/users/${toUser.uid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentiment_score: 0.2 }) // severe burnout detected
        });
        const updateSentimentData = await updateSentimentRes.json();
        console.log("Update User Sentiment JSON:", JSON.stringify(updateSentimentData, null, 2), "\n");

        // --- TEST 8: Fetch User History (Charts) ---
        console.log("--- TEST: FETCH USER HISTORY ---");
        const historyRes = await fetch(`${BASE_URL}/users/${toUser.uid}/history`);
        const historyData = await historyRes.json();
        console.log(`History for ${toUser.name}:`, historyData.length, "snapshots found.\n");

        // --- TEST 9: Filter Approvals by Status ---
        console.log("--- TEST: FETCH PENDING APPROVALS ---");
        const pendingApprovalsRes = await fetch(`${BASE_URL}/approvals?status=pending`);
        const pendingApprovals = await pendingApprovalsRes.json();
        console.log("Pending Approvals Found:", pendingApprovals.length, "\n");


        // --- Existing Reassignment Workflow ---
        const task = tasks[0];
        const fromApprovalUser = users.find(u => u.uid === task.assignedTo);
        const toApprovalUser = users.find(u => u.uid !== task.assignedTo);

        console.log("--- STEP 1: AI REASONING (APPROVAL) ---");
        const appReq = await fetch(`${BASE_URL}/approvals/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tid: task.tid,
                fromUid: fromApprovalUser.uid,
                toUid: toApprovalUser.uid,
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
                actorUid: toApprovalUser.uid 
            })
        });
        const ownerData = await ownerRes.json();
        console.log("Owner Acceptance JSON:", JSON.stringify(ownerData, null, 2), "\n");

        // --- Final Verification ---
        console.log("--- FINAL VERIFICATION ---");
        const finalUsersRes = await fetch(`${BASE_URL}/users`);
        const finalUsers = await finalUsersRes.json();
        
        console.log("Updated User Loads (Should reflect New Task + Reassignments + Status Changes):");
        finalUsers.forEach(u => {
            console.log(`- ${u.name}: ${u.current_load.toFixed(2)}`);
        });

        console.log("\n🎉 All Workflow Tests Finished Successfully.");

    } catch (error) {
        console.error("\n❌ TEST ERROR:", error.message);
    }
};

runTests();