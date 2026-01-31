import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'activity.json');

class ActivityTracker {
    constructor() {
        this.data = this.loadData();
        this.voiceSessions = new Map(); // Track active voice sessions
    }

    loadData() {
        try {
            // Ensure data directory exists
            const dataDir = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            if (fs.existsSync(DB_PATH)) {
                const rawData = fs.readFileSync(DB_PATH, 'utf8');
                return JSON.parse(rawData);
            }
        } catch (error) {
            console.error('Error loading activity data:', error);
        }

        // Default structure
        return {
            users: {},
            startDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving activity data:', error);
        }
    }

    // Get or create user entry
    getUser(userId, username) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                username: username,
                messages: 0,
                voiceMinutes: 0,
                lastActive: new Date().toISOString(),
                joinedTracking: new Date().toISOString()
            };
        } else {
            // Update username if changed
            this.data.users[userId].username = username;
        }
        return this.data.users[userId];
    }

    // Track message
    trackMessage(userId, username) {
        const user = this.getUser(userId, username);
        user.messages++;
        user.lastActive = new Date().toISOString();
        this.saveData();
    }

    // Track voice join
    trackVoiceJoin(userId, username) {
        const user = this.getUser(userId, username);
        this.voiceSessions.set(userId, {
            joinTime: Date.now(),
            username: username
        });
    }

    // Track voice leave
    trackVoiceLeave(userId) {
        const session = this.voiceSessions.get(userId);
        if (session) {
            const duration = Date.now() - session.joinTime;
            const minutes = Math.floor(duration / 60000);

            const user = this.getUser(userId, session.username);
            user.voiceMinutes += minutes;
            user.lastActive = new Date().toISOString();

            this.voiceSessions.delete(userId);
            this.saveData();
        }
    }

    // Get leaderboard by type
    getLeaderboard(type = 'messages', limit = 10) {
        const users = Object.entries(this.data.users)
            .map(([userId, data]) => ({
                userId,
                username: data.username,
                messages: data.messages,
                voiceMinutes: data.voiceMinutes,
                voiceHours: Math.floor(data.voiceMinutes / 60),
                lastActive: data.lastActive
            }));

        if (type === 'messages') {
            return users
                .sort((a, b) => b.messages - a.messages)
                .slice(0, limit);
        } else if (type === 'voice') {
            return users
                .sort((a, b) => b.voiceMinutes - a.voiceMinutes)
                .slice(0, limit);
        } else if (type === 'contributors') {
            // Combined score: messages + voice hours
            return users
                .map(u => ({
                    ...u,
                    score: u.messages + (u.voiceHours * 100)
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        }

        return [];
    }

    // Get user stats
    getUserStats(userId) {
        return this.data.users[userId] || null;
    }

    // Get tracking start date
    getStartDate() {
        return this.data.startDate;
    }

    // Get total stats
    getTotalStats() {
        const users = Object.values(this.data.users);
        return {
            totalUsers: users.length,
            totalMessages: users.reduce((sum, u) => sum + u.messages, 0),
            totalVoiceMinutes: users.reduce((sum, u) => sum + u.voiceMinutes, 0),
            totalVoiceHours: Math.floor(users.reduce((sum, u) => sum + u.voiceMinutes, 0) / 60)
        };
    }
}

// Export singleton instance
const activityTracker = new ActivityTracker();
export default activityTracker;
