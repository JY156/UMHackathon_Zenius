const { db } = require('./config/firebase-admin');

async function seedDatabase() {
    console.log('\\n' + '='.repeat(60));
    console.log('🌱 SEEDING FIRESTORE DATABASE FOR TASK 2 TESTING');
    console.log('='.repeat(60) + '\\n');

    try {
        // Seed users collection
        console.log('📝 Seeding Users Collection...');
        const users = [
            {
                uid: 'user_01',
                name: 'Sarah Chen',
                email: 'sarah@company.com',
                skills: ['Python', 'API Design', 'Database'],
                sentiment_score: 0.85,
                current_load: 25,
                role: 'Senior Developer'
            },
            {
                uid: 'user_02',
                name: 'John Smith',
                email: 'john@company.com',
                skills: ['React', 'Frontend', 'UI'],
                sentiment_score: 0.7,
                current_load: 15,
                role: 'Frontend Developer'
            },
            {
                uid: 'user_03',
                name: 'Mike Johnson',
                email: 'mike@company.com',
                skills: ['Python', 'Database', 'System Design'],
                sentiment_score: 0.4,
                current_load: 95,
                role: 'Senior Backend Developer'
            },
            {
                uid: 'user_04',
                name: 'Emily Davis',
                email: 'emily@company.com',
                skills: ['QA', 'Testing', 'Automation'],
                sentiment_score: 0.2,
                current_load: 35,
                role: 'QA Lead'
            }
        ];

        for (const user of users) {
            await db.collection('users').doc(user.uid).set(user);
            console.log('  ✓ Created user: ' + user.name);
        }

        // Seed tasks collection
        console.log('\\n📝 Seeding Tasks Collection...');
        const tasks = [
            {
                tid: 'TASK-001',
                title: 'Build REST API Endpoint',
                description: 'Create new endpoint for user authentication',
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
                description: 'Design Firestore schema for user management',
                assignedTo: 'user_01',
                skills: ['Database', 'System Design'],
                priority: 3,
                difficulty: 3,
                status: 'pending',
                dueDate: '2026-04-28'
            },
            {
                tid: 'TASK-003',
                title: 'Frontend Dashboard UI',
                description: 'Build responsive admin dashboard',
                assignedTo: 'user_02',
                skills: ['React', 'Frontend'],
                priority: 2,
                difficulty: 2,
                status: 'in_progress',
                dueDate: '2026-04-30'
            },
            {
                tid: 'TASK-004',
                title: 'Integration Testing',
                description: 'Create integration test suite',
                assignedTo: 'user_04',
                skills: ['QA', 'Automation'],
                priority: 2,
                difficulty: 2,
                status: 'pending',
                dueDate: '2026-05-02'
            },
            {
                tid: 'TASK-005',
                title: 'Code Review',
                description: 'Review PRs for backend module',
                assignedTo: 'user_03',
                skills: ['Python', 'Code Review'],
                priority: 1,
                difficulty: 1,
                status: 'pending',
                dueDate: '2026-04-22'
            }
        ];

        for (const task of tasks) {
            await db.collection('tasks').doc(task.tid).set(task);
            console.log('  ✓ Created task: ' + task.title);
        }

        // Seed inputs collection (chat logs for sentiment analysis)
        console.log('\\n📝 Seeding Inputs Collection (Chat Logs)...');
        const inputs = [
            {
                source: 'slack',
                content: 'I am feeling overwhelmed with the workload and tight deadlines',
                processed: false,
                sentiment: { score: 0.3, tone: 'stressed' },
                timestamp: new Date('2026-04-21T02:30:00Z'), // Late night
                metadata: { userId: 'user_03', channelId: 'dev-team' }
            },
            {
                source: 'email',
                content: 'All tasks on track. The team is doing great work!',
                processed: false,
                sentiment: { score: 0.85, tone: 'positive' },
                timestamp: new Date('2026-04-21T10:00:00Z'),
                metadata: { userId: 'user_01', email: 'team@company.com' }
            },
            {
                source: 'slack',
                content: 'struggling to keep up',
                processed: false,
                sentiment: { score: 0.2, tone: 'stressed' },
                timestamp: new Date('2026-04-21T04:15:00Z'), // Late night
                metadata: { userId: 'user_04', channelId: 'qa-team' }
            },
            {
                source: 'email',
                content: 'PR looks good! Just a minor suggestion.',
                processed: false,
                sentiment: { score: 0.7, tone: 'neutral' },
                timestamp: new Date('2026-04-21T14:30:00Z'),
                metadata: { userId: 'user_02', email: 'review@company.com' }
            }
        ];

        for (const input of inputs) {
            await db.collection('inputs').add(input);
            console.log('  ✓ Created input: ' + input.source.toUpperCase());
        }

        console.log('\\n' + '='.repeat(60));
        console.log('✅ DATABASE SEEDING COMPLETE!');
        console.log('='.repeat(60));
        console.log('\\n📊 Summary:');
        console.log('  • Users: 4');
        console.log('  • Tasks: 5');
        console.log('  • Inputs (Chat logs): 4');
        console.log('\\n💡 You can now run the tests:');
        console.log('  • python backend/test_reasoning_unit.py');
        console.log('  • python backend/test_burnout_logic.py');
        console.log('\\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Check if Firebase is initialized
if (!require('./config/firebase-admin')) {
    console.error('❌ Firebase not initialized. Check serviceAccountKey.json');
    process.exit(1);
}

seedDatabase();