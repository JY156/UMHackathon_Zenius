// backend/services/helperAgent.js
const { db } = require('../config/firebase-admin');
const aiProvider = require('./aiProvider');
const LOAD_CALCULATION = require('../utils/loadCalculationConstants'); // ✅ Correct import

class HelperAgent {
    /**
     * Find the best assignee for a task based on:
     * - Skill match
     * - Current load vs capacity
     * - Sentiment score & burnout risk (using your LOAD_CALCULATION)
     * - Availability status
     */
    async findBestAssignee(requiredSkills, excludeUserId = null, taskPriority = 3, taskCategory = 'Professional') {
        try {
            console.log('\n🤖 Helper Agent: Finding best assignee...');
            console.log('   Required skills:', requiredSkills);
            console.log('   Exclude user:', excludeUserId);
            console.log('   Task priority:', taskPriority, '| Category:', taskCategory);

            // Fetch all active users
            const usersSnapshot = await db.collection('users')
                .where('status', '==', 'active')
                .get();

            if (usersSnapshot.empty) {
                console.warn('⚠️  No active users found');
                return null;
            }

            const candidates = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                
                // Skip excluded user
                if (userId === excludeUserId) continue;

                const userData = userDoc.data();
                const sentimentScore = userData.sentiment_score ?? 0.5;

                // === BURNOUT RISK CHECK (using YOUR LOAD_CALCULATION logic) ===
                // Quick check: sentiment-based burnout (fast, no DB query)
                if (LOAD_CALCULATION.isBurnoutRisk(sentimentScore)) {
                    console.log(`   ❌ ${userData.name}: Burnout risk (sentiment: ${sentimentScore} < ${LOAD_CALCULATION.BURNOUT_RISK_THRESHOLD})`);
                    continue;
                }

                // Calculate availability score
                const availableCapacity = userData.task_capacity - userData.current_load;
                const availabilityRatio = availableCapacity / userData.task_capacity;

                // Skip if no capacity
                if (availableCapacity <= 0) {
                    console.log(`   ❌ ${userData.name}: No capacity (${userData.current_load}/${userData.task_capacity})`);
                    continue;
                }

                // Calculate skill match score
                const skillMatchScore = this.calculateSkillMatch(userData.skills, requiredSkills);

                // Calculate sentiment factor (higher sentiment = more resilient)
                const sentimentFactor = sentimentScore;

                // Calculate workload stress factor (proxy for load-based burnout)
                const workloadRatio = userData.current_load / userData.task_capacity;
                const stressPenalty = workloadRatio > 0.9 ? 0.5 : 1.0;

                // Final weighted score
                const finalScore = (
                    (skillMatchScore * 0.4) +           // 40% skill match
                    (availabilityRatio * 0.3) +          // 30% availability
                    (sentimentFactor * 0.2) +            // 20% sentiment
                    (stressPenalty * 0.1)                // 10% stress factor
                );

                candidates.push({
                    userId: userId,
                    name: userData.name,
                    email: userData.email,
                    skills: userData.skills,
                    currentLoad: userData.current_load,
                    taskCapacity: userData.task_capacity,
                    availableCapacity: availableCapacity,
                    sentimentScore: sentimentScore,
                    skillMatchScore: skillMatchScore,
                    availabilityRatio: availabilityRatio,
                    finalScore: finalScore,
                    timezone: userData.timezone
                });

                console.log(`   ✓ ${userData.name}: Score=${finalScore.toFixed(3)} (Skill: ${skillMatchScore.toFixed(2)}, Avail: ${availabilityRatio.toFixed(2)}, Sentiment: ${sentimentScore})`);
            }

            if (candidates.length === 0) {
                console.warn('⚠️  No suitable candidates found');
                return null;
            }

            // Sort by final score (descending)
            candidates.sort((a, b) => b.finalScore - a.finalScore);

            // === AI TIE-BREAKER FOR CLOSE CANDIDATES ===
            let bestCandidate = candidates[0];
            
            // If top 2-3 candidates have scores within 0.1, use AI to decide
            if (candidates.length >= 2) {
                const scoreDiff = candidates[0].finalScore - candidates[1].finalScore;
                
                if (scoreDiff < 0.1 && process.env.SKIP_AI_TIEBREAKER !== 'true') {
                    console.log(`🤖 Close candidates detected (diff: ${scoreDiff.toFixed(3)}), using AI tie-breaker...`);
                    
                    const aiDecision = await this._aiTieBreaker(candidates.slice(0, 3), {
                        requiredSkills,
                        taskPriority,
                        taskCategory
                    });

                    if (aiDecision?.selectedUserId) {
                        const aiChosen = candidates.find(c => c.userId === aiDecision.selectedUserId);
                        if (aiChosen) {
                            console.log(`✅ AI tie-breaker selected: ${aiChosen.name} (reason: ${aiDecision.reasoning})`);
                            bestCandidate = aiChosen;
                        }
                    } else {
                        console.log('⚠️  AI tie-breaker failed or returned no selection, using score-based fallback');
                    }
                }
            }

            console.log(`✅ Final assignee: ${bestCandidate.name} (Score: ${bestCandidate.finalScore.toFixed(3)})`);
            return bestCandidate;

        } catch (error) {
            console.error('❌ Helper Agent error:', error);
            throw error;
        }
    }

    /**
     * AI-powered tie-breaker for close candidates
     */
    async _aiTieBreaker(candidates, taskContext) {
        try {
            // ✅ DEFINE THE PROMPT VARIABLE HERE
            const tieBreakerPrompt = `
    You are Zenius Task Orchestrator. Choose the BEST person to assign this task.

    TASK CONTEXT:
    - Required Skills: ${taskContext.requiredSkills.join(', ')}
    - Priority: ${taskContext.taskPriority}/5
    - Category: ${taskContext.taskCategory}

    CANDIDATES (similar scores, pick the BEST fit):
    ${candidates.map((c, i) => `
    ${i+1}. ${c.name} (${c.userId})
    • Skills: ${c.skills.join(', ')}
    • Available Capacity: ${c.availableCapacity}/${c.taskCapacity} (${Math.round(c.availabilityRatio * 100)}%)
    • Sentiment Score: ${c.sentimentScore} (higher = more resilient)
    • Skill Match: ${Math.round(c.skillMatchScore * 100)}%
    • Current Load: ${c.currentLoad} tasks
    `).join('\n')}

    Return ONLY valid JSON:
    {
    "selectedUserId": "user_id_here",
    "reasoning": "Brief explanation (max 15 words)"
    }
            `;

            const result = await aiProvider.chat({
                prompt: tieBreakerPrompt,  // ✅ Now using the defined variable
                responseFormat: 'json',
                taskType: 'simple',  // Uses gemini-2.0-flash-lite (saves credits)
                temperature: 0.1,
                timeout: 5000
            });

            return aiProvider.extractJSON(result.content);

        } catch (error) {
            console.warn('⚠️  AI tie-breaker failed:', error.message);
            return null;
        }
    }

    /**
     * Calculate skill match between user skills and required skills
     * Returns a score between 0 and 1
     */
    calculateSkillMatch(userSkills, requiredSkills) {
        if (!requiredSkills || requiredSkills.length === 0) return 0.5;
        if (!userSkills || userSkills.length === 0) return 0;

        const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
        const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase().trim());

        let matchCount = 0;

        for (const required of requiredSkillsLower) {
            if (userSkillsLower.includes(required)) {
                matchCount += 1;
            } else if (userSkillsLower.some(skill => 
                skill.includes(required) || required.includes(skill)
            )) {
                matchCount += 0.5;
            } else if (this.isSynonymMatch(required, userSkillsLower)) {
                matchCount += 0.7;
            }
        }

        return matchCount / requiredSkills.length;
    }

    /**
     * Synonym matching for flexible skill recognition
     */
    isSynonymMatch(skill, userSkills) {
        const synonyms = {
            'js': ['javascript', 'node.js', 'nodejs', 'ecmascript'],
            'react': ['reactjs', 'react.js', 'react native'],
            'db': ['database', 'firebase', 'postgresql', 'mongodb', 'mysql', 'sql'],
            'ui': ['ui/ux', 'figma', 'design', 'user interface', 'user experience'],
            'api': ['rest', 'graphql', 'webhook', 'rest api', 'http api'],
            'python': ['py', 'django', 'flask', 'fastapi'],
            'cloud': ['aws', 'gcp', 'azure', 'firebase', 'serverless']
        };
        
        const related = synonyms[skill] || [];
        return userSkills.some(us => related.includes(us));
    }

    /**
     * Update user's current load (atomic operation)
     */
    async updateUserLoad(userId, delta) {
        try {
            const userRef = db.collection('users').doc(userId);
            
            const newLoad = await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                
                if (!userDoc.exists) {
                    throw new Error(`User ${userId} not found`);
                }

                const currentLoad = userDoc.data().current_load || 0;
                const updatedLoad = Math.max(0, currentLoad + delta);
                
                transaction.update(userRef, {
                    current_load: updatedLoad,
                    updatedAt: new Date().toISOString()
                });
                
                return updatedLoad;
            });

            console.log(`📊 Updated ${userId} load: → ${newLoad} (${delta >= 0 ? '+' : ''}${delta})`);
            return newLoad;

        } catch (error) {
            console.error('❌ Error updating user load:', error);
            throw error;
        }
    }

    /**
     * Update user's sentiment score based on triggers
     */
    async updateSentiment(userId, trigger, delta) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new Error(`User ${userId} not found`);
            }

            const currentSentiment = userDoc.data().sentiment_score ?? 0.5;
            const newSentiment = Math.max(0, Math.min(1, currentSentiment + delta));

            await userRef.update({
                sentiment_score: newSentiment,
                updatedAt: new Date().toISOString()
            });

            await db.collection('user_stats').add({
                userId: userId,
                load_score: userDoc.data().current_load || 0,
                sentiment: newSentiment,
                sentimentChange: delta,
                trigger: trigger,
                timestamp: new Date().toISOString()
            });

            console.log(`💭 Updated ${userId} sentiment: ${currentSentiment.toFixed(2)} → ${newSentiment.toFixed(2)} (${trigger}, Δ${delta.toFixed(2)})`);
            return newSentiment;

        } catch (error) {
            console.error('❌ Error updating sentiment:', error);
            throw error;
        }
    }

    /**
     * Detect if user is overwhelmed using YOUR LOAD_CALCULATION formula
     * Note: This fetches user tasks to calculate accurate load (slower but accurate)
     */
    async detectOverwhelmedUsers() {
        try {
            const usersSnapshot = await db.collection('users').get();
            const overwhelmedUsers = [];

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const sentimentScore = userData.sentiment_score ?? 0.5;

                // Fetch user's non-completed tasks for accurate load calculation
                const tasksSnapshot = await db.collection('tasks')
                    .where('assignedTo', '==', userDoc.id)
                    .where('status', '!=', LOAD_CALCULATION.EXCLUDED_STATUS)
                    .get();

                const tasks = tasksSnapshot.docs.map(doc => doc.data());

                // Calculate total load using YOUR formula
                const totalLoad = LOAD_CALCULATION.calculateTotalLoad(tasks, sentimentScore);
                const capacity = userData.task_capacity || 30; // fallback default
                const loadRatio = totalLoad / capacity;

                // User is overwhelmed if:
                // 1. Burnout risk by sentiment, OR
                // 2. Load exceeds capacity, OR  
                // 3. Current task count exceeds capacity (fallback heuristic)
                const isOverwhelmed = 
                    LOAD_CALCULATION.isBurnoutRisk(sentimentScore) ||
                    (totalLoad > capacity) ||
                    (userData.current_load > userData.task_capacity);

                if (isOverwhelmed) {
                    overwhelmedUsers.push({
                        userId: userDoc.id,
                        name: userData.name,
                        email: userData.email,
                        sentimentScore: sentimentScore,
                        totalLoad: totalLoad,
                        capacity: capacity,
                        loadRatio: loadRatio,
                        currentLoad: userData.current_load,
                        taskCapacity: userData.task_capacity,
                        burnoutReasons: {
                            lowSentiment: LOAD_CALCULATION.isBurnoutRisk(sentimentScore),
                            loadExceedsCapacity: totalLoad > capacity,
                            taskCountExceedsCapacity: userData.current_load > userData.task_capacity
                        }
                    });
                }
            }

            if (overwhelmedUsers.length > 0) {
                console.log('⚠️  Overwhelmed users detected:', 
                    overwhelmedUsers.map(u => `${u.name} (${Object.entries(u.burnoutReasons).filter(([,v])=>v).map(([k])=>k).join(', ')})`).join(', '));
            }

            return overwhelmedUsers;

        } catch (error) {
            console.error('❌ Error detecting overwhelmed users:', error);
            throw error;
        }
    }

    /**
     * Quick overwhelm check without fetching tasks (for performance-critical paths)
     * Uses heuristic: high load ratio + low sentiment = likely overwhelmed
     */
    isLikelyOverwhelmed(userData) {
        const sentimentScore = userData.sentiment_score ?? 0.5;
        const loadRatio = userData.current_load / userData.task_capacity;
        
        return LOAD_CALCULATION.isBurnoutRisk(sentimentScore) || 
               (loadRatio > 0.9 && sentimentScore < 0.5);
    }

    /**
     * Get user's skill summary for debugging/display
     */
    async getUserSkillSummary(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) return null;

            const userData = userDoc.data();
            return {
                userId: userId,
                name: userData.name,
                skills: userData.skills || [],
                taskCapacity: userData.task_capacity,
                currentLoad: userData.current_load,
                availableCapacity: userData.task_capacity - userData.current_load,
                sentimentScore: userData.sentiment_score,
                status: userData.status
            };

        } catch (error) {
            console.error('❌ Error getting user skill summary:', error);
            return null;
        }
    }
}

module.exports = new HelperAgent();