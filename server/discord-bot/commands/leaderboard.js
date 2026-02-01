import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';
import activityTracker from '../utils/activityTracker.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 View the server activity leaderboard')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of leaderboard')
                .setRequired(false)
                .addChoices(
                    { name: '💬 Most Active (Messages)', value: 'messages' },
                    { name: '🎤 Voice Time', value: 'voice' },
                    { name: '⭐ Top Contributors', value: 'contributors' }
                )
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const type = interaction.options.getString('type') || 'messages';
            const guild = interaction.guild;

            let title = '';
            let description = '';
            let leaderboardData = [];

            // Get real data from activity tracker
            const trackedUsers = activityTracker.getLeaderboard(type, 10);

            if (trackedUsers.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setTitle('📊 No Data Yet')
                    .setDescription('The bot hasn\'t tracked any activity yet!\n\nStart chatting and using voice channels, and the leaderboard will populate over time.')
                    .setFooter({ text: `Tracking started: ${new Date(activityTracker.getStartDate()).toLocaleDateString()}` })
                    .setTimestamp();

                return interaction.editReply({ embeds: [noDataEmbed] });
            }

            if (type === 'messages') {
                title = '💬 Most Active Members';
                description = 'Top members by message activity';
                leaderboardData = trackedUsers.map(u => ({
                    user: { tag: u.username },
                    value: u.messages,
                    label: 'messages'
                }));

            } else if (type === 'voice') {
                title = '🎤 Voice Chat Leaders';
                description = 'Top members by voice chat time';
                leaderboardData = trackedUsers.map(u => ({
                    user: { tag: u.username },
                    value: u.voiceHours,
                    label: 'hours'
                }));

            } else if (type === 'contributors') {
                title = '⭐ Top Contributors';
                description = 'Most active members overall';
                leaderboardData = trackedUsers.map(u => ({
                    user: { tag: u.username },
                    value: u.score,
                    label: 'points'
                }));
            }

            // Create leaderboard text
            const medals = ['🥇', '🥈', '🥉'];
            const leaderboardText = leaderboardData
                .map((entry, index) => {
                    const medal = medals[index] || `**${index + 1}.**`;
                    const bar = createProgressBar(entry.value, leaderboardData[0].value);
                    return `${medal} ${entry.user.tag}\n${bar} ${entry.value.toLocaleString()} ${entry.label}`;
                })
                .join('\n\n');

            const totalStats = activityTracker.getTotalStats();
            const startDate = new Date(activityTracker.getStartDate()).toLocaleDateString();

            const embed = new EmbedBuilder()
                .setColor(config.colors.accent)
                .setTitle(`🏆 ${title}`)
                .setDescription(`${description}\n\n${leaderboardText}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({ text: `${guild.name} • Tracking since ${startDate} • ${totalStats.totalMessages} total messages` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in leaderboard command:', error);

            // Try to respond if we haven't already
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ An error occurred while loading the leaderboard. Please try again.',
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        content: '❌ An error occurred while loading the leaderboard. Please try again.'
                    });
                }
            } catch (e) {
                console.error('Failed to send error message:', e);
            }
        }
    },
};

function createProgressBar(value, max) {
    if (max === 0) return '░░░░░░░░░░';
    const percentage = Math.min((value / max) * 100, 100);
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
