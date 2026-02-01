import activityTracker from '../utils/activityTracker.js';
import logger from '../utils/logger.js';

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const member = newState.member;

        // Ignore bots
        if (member.user.bot) return;

        const userId = member.user.id;
        const username = member.user.username;

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            activityTracker.trackVoiceJoin(userId, username);
            logger.debug(`${username} joined voice channel: ${newState.channel.name}`);
        }

        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            activityTracker.trackVoiceLeave(userId);
            logger.debug(`${username} left voice channel: ${oldState.channel.name}`);
        }

        // User switched voice channels
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // Track as leave from old and join to new
            activityTracker.trackVoiceLeave(userId);
            activityTracker.trackVoiceJoin(userId, username);
            logger.debug(`${username} switched from ${oldState.channel.name} to ${newState.channel.name}`);
        }
    },
};
