import logger from './logger.js';
import config from '../config.js';

/**
 * Formats uptime into human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '< 1m';
}

/**
 * Formats bytes into human-readable format
 * @param {number} bytes - Memory in bytes
 * @returns {string} Formatted memory string
 */
function formatMemory(bytes) {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
}

/**
 * Generates a dynamic status message with real-time bot statistics
 * @param {Client} client - Discord client instance
 * @returns {string} Dynamic status message
 */
function generateDynamicStatus(client) {
    const uptime = formatUptime(process.uptime());
    const serverCount = client.guilds.cache.size;
    const userCount = client.users.cache.size;
    const memoryUsage = formatMemory(process.memoryUsage().heapUsed);
    const ping = client.ws.ping;

    // Get current timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Rotate through different status formats
    const statusFormats = [
        `🟢 **Bot Status** | Uptime: ${uptime} | Servers: ${serverCount} | Users: ${userCount}`,
        `⚡ **System Check** | Memory: ${memoryUsage} | Ping: ${ping}ms | Time: ${timeString}`,
        `🤖 **EliteZero Active** | ${serverCount} servers • ${userCount} users • ${uptime} uptime`,
        `💚 **Operational** | Latency: ${ping}ms | RAM: ${memoryUsage} | ${timeString}`,
        `🚀 **Running Smoothly** | Online for ${uptime} | Serving ${serverCount} servers`,
        `✨ **Keep-Alive Ping** | ${ping}ms latency • ${memoryUsage} memory • ${uptime} uptime`,
    ];

    // Return a random format or rotate through them
    const index = Math.floor(Date.now() / (config.keepAlive.interval)) % statusFormats.length;
    return statusFormats[index];
}

/**
 * Starts the keep-alive functionality to prevent bot sleep
 * Sends periodic status messages to the manage channel
 * @param {Client} client - Discord client instance
 */
export function startKeepAlive(client) {
    // Check if keep-alive is enabled
    if (!config.keepAlive.enabled) {
        logger.info('Keep-alive feature is disabled');
        return;
    }

    // Get channel ID from environment variable
    const channelId = process.env.MANAGE_CHANNEL_ID;

    if (!channelId) {
        logger.warn('⚠️ MANAGE_CHANNEL_ID not set in environment variables');
        logger.warn('Keep-alive feature will not start. Please add MANAGE_CHANNEL_ID to your Replit environment variables.');
        return;
    }

    // Retrieve the channel
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        logger.error(`❌ Could not find channel with ID: ${channelId}`);
        logger.error('Please verify the MANAGE_CHANNEL_ID is correct');
        return;
    }

    logger.success(`✅ Keep-alive feature enabled for channel: #${channel.name}`);
    logger.info(`📡 Dynamic status messages will be sent every ${config.keepAlive.interval / 60000} minutes`);

    // Set up interval to send keep-alive messages
    setInterval(() => {
        try {
            // Generate dynamic status message
            const message = generateDynamicStatus(client);

            // Send the message
            channel.send(message)
                .then(() => {
                    logger.info(`💚 Keep-alive message sent with real-time stats`);
                })
                .catch(error => {
                    logger.error(`Failed to send keep-alive message: ${error.message}`);
                });
        } catch (error) {
            logger.error(`Keep-alive error: ${error.message}`);
        }
    }, config.keepAlive.interval);

    // Send initial message immediately
    try {
        const initialMessage = generateDynamicStatus(client);
        channel.send(initialMessage)
            .then(() => {
                logger.success(`🚀 Initial keep-alive message sent with real-time stats`);
            })
            .catch(error => {
                logger.error(`Failed to send initial keep-alive message: ${error.message}`);
            });
    } catch (error) {
        logger.error(`Initial keep-alive error: ${error.message}`);
    }
}

export default { startKeepAlive };
