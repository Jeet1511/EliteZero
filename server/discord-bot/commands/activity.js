import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('📈 View server activity statistics')
        .addStringOption(option =>
            option
                .setName('period')
                .setDescription('Time period to analyze')
                .setRequired(false)
                .addChoices(
                    { name: 'Last Hour', value: 'hour' },
                    { name: 'Last 24 Hours', value: 'day' },
                    { name: 'Last Week', value: 'week' },
                    { name: 'Last Month', value: 'month' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const period = interaction.options.getString('period') || 'day';
        const guild = interaction.guild;

        // Simulate activity data (in production, track this in a database)
        const activityData = generateActivityData(period);

        const periodLabels = {
            hour: 'Last Hour',
            day: 'Last 24 Hours',
            week: 'Last Week',
            month: 'Last Month'
        };

        // Create activity visualization
        const activityGraph = createActivityGraph(activityData);

        // Calculate statistics
        const totalMessages = activityData.reduce((sum, val) => sum + val, 0);
        const avgMessages = Math.round(totalMessages / activityData.length);
        const peakActivity = Math.max(...activityData);
        const activeMembers = Math.floor(guild.memberCount * 0.3); // Simulated

        // Determine activity level
        let activityLevel, activityEmoji, activityColor;
        if (avgMessages > 100) {
            activityLevel = 'Very High';
            activityEmoji = '🔥';
            activityColor = config.colors.error;
        } else if (avgMessages > 50) {
            activityLevel = 'High';
            activityEmoji = '⚡';
            activityColor = config.colors.warning;
        } else if (avgMessages > 20) {
            activityLevel = 'Moderate';
            activityEmoji = '📊';
            activityColor = config.colors.primary;
        } else {
            activityLevel = 'Low';
            activityEmoji = '😴';
            activityColor = config.colors.secondary;
        }

        // Most active hours (simulated)
        const peakHours = ['2 PM - 4 PM', '8 PM - 10 PM', '11 PM - 1 AM'];

        const embed = new EmbedBuilder()
            .setColor(activityColor)
            .setTitle(`📈 Server Activity - ${periodLabels[period]}`)
            .setDescription(`${activityEmoji} **Activity Level:** ${activityLevel}\n\n${activityGraph}`)
            .addFields(
                {
                    name: '📊 Statistics',
                    value: `**Total Messages:** ${totalMessages.toLocaleString()}\n` +
                        `**Average/Period:** ${avgMessages.toLocaleString()}\n` +
                        `**Peak Activity:** ${peakActivity.toLocaleString()}`,
                    inline: true
                },
                {
                    name: '👥 Active Members',
                    value: `**Active:** ${activeMembers}\n` +
                        `**Total:** ${guild.memberCount}\n` +
                        `**Percentage:** ${Math.round((activeMembers / guild.memberCount) * 100)}%`,
                    inline: true
                },
                {
                    name: '⏰ Peak Hours',
                    value: peakHours.map(h => `• ${h}`).join('\n'),
                    inline: false
                },
                {
                    name: '📈 Trend',
                    value: getTrendIndicator(activityData),
                    inline: false
                }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: `${guild.name} • Real-time analytics` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

function generateActivityData(period) {
    const dataPoints = {
        hour: 12,
        day: 24,
        week: 7,
        month: 30
    };

    const points = dataPoints[period] || 24;
    return Array.from({ length: points }, () => Math.floor(Math.random() * 150));
}

function createActivityGraph(data) {
    const maxValue = Math.max(...data);
    const height = 5;

    let graph = '```\n';

    // Create vertical bars
    for (let i = height; i > 0; i--) {
        const threshold = (maxValue / height) * i;
        let line = '';

        for (const value of data) {
            line += value >= threshold ? '█' : ' ';
        }

        graph += line + '\n';
    }

    graph += '─'.repeat(data.length) + '\n```';
    return graph;
}

function getTrendIndicator(data) {
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) {
        return '📈 **Trending Up** - Activity is increasing!';
    } else if (change < -10) {
        return '📉 **Trending Down** - Activity is decreasing';
    } else {
        return '➡️ **Stable** - Activity is consistent';
    }
}
