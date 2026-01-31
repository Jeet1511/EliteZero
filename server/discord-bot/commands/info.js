import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('View bot information and statistics'),

    async execute(interaction) {
        const client = interaction.client;

        // Calculate stats
        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const uptime = formatUptime(client.uptime);

        // Memory usage
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        // Node version
        const nodeVersion = process.version;

        // Discord.js version
        const djsVersion = '14.14.1';

        const embed = embedBuilder.premium({
            color: config.colors.secondary,
            title: `${config.emojis.bot} EliteZero Bot Information`,
            description: '**A futuristic AI companion from the future!**\n',
            thumbnail: client.user.displayAvatarURL({ size: 256 }),
            fields: [
                {
                    name: `${config.emojis.sparkles} Bot Stats`,
                    value:
                        `**Servers:** \`${totalServers}\`\n` +
                        `**Users:** \`${totalUsers.toLocaleString()}\`\n` +
                        `**Channels:** \`${totalChannels}\`\n` +
                        `**Uptime:** \`${uptime}\``,
                    inline: true,
                },
                {
                    name: `${config.emojis.gear} System Info`,
                    value:
                        `**Memory:** \`${memoryUsage} MB\`\n` +
                        `**Node.js:** \`${nodeVersion}\`\n` +
                        `**Discord.js:** \`v${djsVersion}\`\n` +
                        `**Platform:** \`${os.platform()}\``,
                    inline: true,
                },
                {
                    name: `${config.emojis.zap} Features`,
                    value:
                        '• AI-Powered Chatbot\n' +
                        '• Slash Commands\n' +
                        '• Premium Embeds\n' +
                        '• Real-time Responses\n' +
                        '• Futuristic Design',
                    inline: false,
                },
                {
                    name: `${config.emojis.crown} About`,
                    value:
                        'EliteZero is a next-generation Discord bot designed to provide ' +
                        'an amazing user experience with AI conversations, helpful commands, ' +
                        'and stunning visual design.',
                    inline: false,
                },
                {
                    name: '💖 Creator',
                    value: '**GitHub:** [@jeet1511](https://github.com/jeet1511)',
                    inline: false,
                },
            ],
        });

        await interaction.reply({ embeds: [embed] });
    },
};

// Format uptime
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
}
