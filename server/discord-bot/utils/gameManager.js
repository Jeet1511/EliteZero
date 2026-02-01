// Game Session Manager for Multiplayer Games
// Handles active games, matchmaking, and game state

class GameManager {
    constructor() {
        this.activeSessions = new Map(); // gameId -> session data
        this.userGames = new Map(); // userId -> gameId
    }

    // Create a new game session
    createSession(gameType, hostId, options = {}) {
        const gameId = `${gameType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session = {
            id: gameId,
            type: gameType,
            host: hostId,
            players: [hostId],
            mode: options.mode || 'solo',
            difficulty: options.difficulty || 'hard',
            state: 'waiting', // waiting, active, finished
            data: {},
            createdAt: Date.now(),
            spectators: []
        };

        this.activeSessions.set(gameId, session);
        this.userGames.set(hostId, gameId);

        return session;
    }

    // Join an existing game session
    joinSession(gameId, userId) {
        const session = this.activeSessions.get(gameId);

        if (!session) {
            throw new Error('Game session not found');
        }

        if (session.state !== 'waiting') {
            throw new Error('Game already started');
        }

        if (session.players.includes(userId)) {
            throw new Error('Already in this game');
        }

        session.players.push(userId);
        this.userGames.set(userId, gameId);

        return session;
    }

    // Start a game session
    startSession(gameId) {
        const session = this.activeSessions.get(gameId);

        if (!session) {
            throw new Error('Game session not found');
        }

        session.state = 'active';
        session.startedAt = Date.now();

        return session;
    }

    // End a game session
    endSession(gameId, winner = null) {
        const session = this.activeSessions.get(gameId);

        if (!session) {
            return null;
        }

        session.state = 'finished';
        session.winner = winner;
        session.endedAt = Date.now();

        // Clean up user mappings
        session.players.forEach(playerId => {
            this.userGames.delete(playerId);
        });

        // Remove session after 5 minutes
        setTimeout(() => {
            this.activeSessions.delete(gameId);
        }, 5 * 60 * 1000);

        return session;
    }

    // Get session by ID
    getSession(gameId) {
        return this.activeSessions.get(gameId);
    }

    // Get user's active game
    getUserGame(userId) {
        const gameId = this.userGames.get(userId);
        return gameId ? this.activeSessions.get(gameId) : null;
    }

    // Check if user is in a game
    isUserInGame(userId) {
        return this.userGames.has(userId);
    }

    // Add spectator to game
    addSpectator(gameId, userId) {
        const session = this.activeSessions.get(gameId);

        if (!session) {
            throw new Error('Game session not found');
        }

        if (!session.spectators.includes(userId)) {
            session.spectators.push(userId);
        }

        return session;
    }

    // Update game state
    updateGameState(gameId, newState) {
        const session = this.activeSessions.get(gameId);

        if (!session) {
            throw new Error('Game session not found');
        }

        session.data = { ...session.data, ...newState };
        return session;
    }

    // Get all active sessions
    getAllSessions() {
        return Array.from(this.activeSessions.values());
    }

    // Get sessions by type
    getSessionsByType(gameType) {
        return Array.from(this.activeSessions.values())
            .filter(session => session.type === gameType);
    }

    // Clean up old sessions (called periodically)
    cleanupOldSessions() {
        const now = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutes

        for (const [gameId, session] of this.activeSessions.entries()) {
            if (now - session.createdAt > timeout) {
                this.endSession(gameId);
            }
        }
    }
}

// Export singleton instance
const gameManager = new GameManager();

// Clean up old sessions every 10 minutes
setInterval(() => {
    gameManager.cleanupOldSessions();
}, 10 * 60 * 1000);

export default gameManager;
