// backend/test-api.js

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log("🚀 Starting Zenius API Tests...\n");

    try {
        // Test 1: POST /api/inputs (SY's Sensor Push)
        console.log("Testing 1: POST /api/inputs...");
        const postInputRes = await fetch(`${BASE_URL}/inputs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: "Slack_Test",
                content: "This is an automated test message for sudden leave.",
                metadata: { test: true }
            })
        });
        const postInputData = await postInputRes.json();
        console.log(`✅ POST /api/inputs Status: ${postInputRes.status}`);
        console.log("Response:", postInputData, "\n");

        // Test 2: GET /api/inputs (XWei's AI Fetch)
        console.log("Testing 2: GET /api/inputs...");
        const getInputsRes = await fetch(`${BASE_URL}/inputs`);
        const getInputsData = await getInputsRes.json();
        console.log(`✅ GET /api/inputs Status: ${getInputsRes.status}`);
        console.log(`Found ${getInputsData.length} unprocessed inputs.\n`);

        // Test 4: GET /api/users (Jing Yuen's Dashboard Load Map)
        console.log("Testing 4: GET /api/users...");
        const getUsersRes = await fetch(`${BASE_URL}/users`);
        const getUsersData = await getUsersRes.json();
        console.log(`✅ GET /api/users Status: ${getUsersRes.status}`);
        console.log(`Found ${getUsersData.length} users.\n`);

        // Test 5: GET /api/approvals (Jing Yuen's Dashboard Inbox)
        console.log("Testing 5: GET /api/approvals...");
        const getApprovalsRes = await fetch(`${BASE_URL}/approvals`);
        const getApprovalsData = await getApprovalsRes.json();
        console.log(`✅ GET /api/approvals Status: ${getApprovalsRes.status}`);
        console.log(`Found ${getApprovalsData.length} approval requests.\n`);

        // Test 7: GET /api/tasks (Execution Task List)
        console.log("Testing 7: GET /api/tasks...");
        const getTasksRes = await fetch(`${BASE_URL}/tasks`);
        const getTasksData = await getTasksRes.json();
        console.log(`✅ GET /api/tasks Status: ${getTasksRes.status}`);
        console.log(`Found ${getTasksData.length} active tasks.\n`);

        console.log("🎉 All basic fetch tests completed successfully.");

    } catch (error) {
        console.error("Error details:", error.message);
    }
};

runTests();