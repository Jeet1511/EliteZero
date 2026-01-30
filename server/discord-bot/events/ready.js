import { ActivityType } from 'discord.js';
import logger from '../utils/logger.js';
import config from '../config.js';

export default {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.success(`Logged in as ${client.user.tag}`);
        logger.info(`Ready to serve ${client.guilds.cache.size} server(s)`);
        logger.info(`Serving ${client.users.cache.size} user(s)`);

        // Set bot avatar as footer icon
        config.footer.iconURL = client.user.displayAvatarURL();

        // Set initial status
        updateStatus(client);

        // Rotate status every 30 seconds
        setInterval(() => updateStatus(client), config.statusInterval);

        logger.success('Bot is fully operational! 🚀');
    },
};

// Status rotation
let currentStatusIndex = 0;

function updateStatus(client) {
    const status = config.statusMessages[currentStatusIndex];

    // Map status type to ActivityType
    const activityTypeMap = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'COMPETING': ActivityType.Competing,
        'CUSTOM': ActivityType.Custom,
    };

    client.user.setPresence({
        activities: [{
            name: status.text,
            type: activityTypeMap[status.type] || ActivityType.Playing,
        }],
        status: 'online',
    });

    // Move to next status
    currentStatusIndex = (currentStatusIndex + 1) % config.statusMessages.length;
}
