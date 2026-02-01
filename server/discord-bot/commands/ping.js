import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and performance'),

    async execute(interaction) {
        // Calculate latencies
        const sent = await interaction.reply({
            content: `${config.emojis.loading} Calculating latency...`,
            fetchReply: true
        });

        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Determine performance level and color
        let performance, color, emoji;
        if (botLatency < 100 && apiLatency < 100) {
            performance = 'Excellent';
            color = config.colors.success;
            emoji = config.emojis.zap;
        } else if (botLatency < 200 && apiLatency < 200) {
            performance = 'Good';
            color = config.colors.primary;
            emoji = config.emojis.check;
        } else if (botLatency < 400 && apiLatency < 400) {
            performance = 'Fair';
            color = config.colors.warning;
            emoji = '⚠️';
        } else {
            performance = 'Poor';
            color = config.colors.error;
            emoji = config.emojis.cross;
        }

        // Create visual progress bars
        const botBar = createProgressBar(botLatency, 500);
        const apiBar = createProgressBar(apiLatency, 500);

        const embed = embedBuilder.premium({
            color: color,
            title: `${emoji} Latency Check`,
            description: `**Performance Status:** ${performance}`,
            fields: [
                {
                    name: '🤖 Bot Latency',
                    value: `${botBar}\n\`${botLatency}ms\``,
                    inline: true,
                },
                {
                    name: '📡 API Latency',
                    value: `${apiBar}\n\`${apiLatency}ms\``,
                    inline: true,
                },
                {
                    name: '⏱️ Uptime',
                    value: `\`${formatUptime(interaction.client.uptime)}\``,
                    inline: false,
                },
            ],
        });

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};

// Create visual progress bar
function createProgressBar(value, max) {
    const percentage = Math.min((value / max) * 100, 100);
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;

    return '█'.repeat(filled) + '░'.repeat(empty);
}

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
