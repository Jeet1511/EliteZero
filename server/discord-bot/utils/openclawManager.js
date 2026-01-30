import logger from './logger.js';

/**
 * OpenClaw Mode Manager
 * Tracks which users have OpenClaw mode enabled
 * Note: OpenClaw handles Discord integration natively via its channels feature
 */
class OpenClawManager {
    constructor() {
        // Map: userId -> { enabled, createdAt, lastActivity, username }
        this.activeUsers = new Map();

        // Session timeout (30 minutes of inactivity)
        this.sessionTimeout = 30 * 60 * 1000;

        // Start cleanup interval (every 5 minutes)
        this.startCleanupInterval();
    }

    /**
     * Enable OpenClaw mode for a user
     */
    async createSession(userId, username) {
        try {
            // Check if user already has OpenClaw mode enabled
            if (this.activeUsers.has(userId)) {
                logger.debug(`User ${username} already has OpenClaw mode enabled`);
                return { success: true, existing: true };
            }

            // Enable OpenClaw mode for this user
            this.activeUsers.set(userId, {
                enabled: true,
                createdAt: Date.now(),
                lastActivity: Date.now(),
                username,
            });

            logger.success(`Enabled OpenClaw mode for ${username}`);
            return { success: true };

        } catch (error) {
            logger.error(`Error enabling OpenClaw mode: ${error.message}`);
            return {
                success: false,
                error: `Failed to enable OpenClaw mode: ${error.message}`,
            };
        }
    }


    /**
     * Send a message to OpenClaw (handled by OpenClaw's Discord integration)
     * This just updates activity tracking
     */
    async sendMessage(userId, message) {
        try {
            const user = this.activeUsers.get(userId);

            if (!user) {
                return {
                    success: false,
                    error: 'No active OpenClaw mode. Use `/zero` to enable it.',
                };
            }

            // Update last activity
            user.lastActivity = Date.now();

            // OpenClaw handles the message routing natively via Discord channels
            // We just need to indicate that this user has OpenClaw mode enabled
            logger.debug(`OpenClaw mode active for ${user.username}`);

            return {
                success: true,
                handled: true, // Indicates OpenClaw will handle this via Discord integration
            };

        } catch (error) {
            logger.error(`Error in OpenClaw message routing: ${error.message}`);
            return {
                success: false,
                error: `Failed to route message: ${error.message}`,
            };
        }
    }


    /**
     * Disable OpenClaw mode for a user
     */
    async endSession(userId) {
        const user = this.activeUsers.get(userId);

        if (!user) {
            return { success: false, error: 'No active OpenClaw mode to disable.' };
        }

        try {
            // Remove from tracking
            this.activeUsers.delete(userId);

            logger.info(`Disabled OpenClaw mode for ${user.username}`);
            return { success: true };

        } catch (error) {
            logger.error(`Error disabling OpenClaw mode: ${error.message}`);
            // Still remove from tracking even if error
            this.activeUsers.delete(userId);
            return { success: true };
        }
    }

    /**
     * Check if user has OpenClaw mode enabled
     */
    hasActiveSession(userId) {
        return this.activeUsers.has(userId);
    }

    /**
     * Get user info
     */
    getSession(userId) {
        return this.activeUsers.get(userId);
    }

    /**
     * Clean up inactive users
     */
    cleanupInactiveSessions() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [userId, user] of this.activeUsers.entries()) {
            if (now - user.lastActivity > this.sessionTimeout) {
                this.activeUsers.delete(userId);
                cleanedCount++;
                logger.info(`Cleaned up inactive OpenClaw mode for ${user.username}`);
            }
        }

        if (cleanedCount > 0) {
            logger.info(`Cleaned up ${cleanedCount} inactive OpenClaw user(s)`);
        }
    }

    /**
     * Start automatic cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupInactiveSessions();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            activeUsers: this.activeUsers.size,
            openclawIntegrated: true,
        };
    }
}

// Export singleton instance
export default new OpenClawManager();
