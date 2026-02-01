import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import gameStats from '../utils/gameStats.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('score')
        .setDescription('📊 View your game scores and points')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view scores for (leave empty for yourself)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const stats = gameStats.getUserStats(targetUser.id);
        const achievementInfo = gameStats.getAchievementInfo();

        // Calculate game points and achievement points
        const gamePoints = stats.totalPoints - stats.achievementPoints;

        // Get top 3 games by points
        const gamesByPoints = Object.entries(stats.gameStats)
            .map(([name, data]) => ({ name, points: data.points || 0, played: data.played }))
            .filter(g => g.played > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, 3);

        // Create progress bar
        const createProgressBar = (current, max, length = 10) => {
            const filled = Math.round((current / max) * length);
            const empty = length - filled;
            return '█'.repeat(filled) + '░'.repeat(empty);
        };

        // Get leaderboard rank
        const leaderboard = gameStats.getOverallLeaderboard(100);
        const rank = leaderboard.findIndex(entry => entry.userId === targetUser.id) + 1;

        // Build embed
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📊 ${targetUser.username}'s Score`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                {
                    name: '💰 Total Points',
                    value: `**${stats.totalPoints.toLocaleString()}** pts`,
                    inline: true
                },
                {
                    name: '🎮 Game Points',
                    value: `${gamePoints.toLocaleString()} pts`,
                    inline: true
                },
                {
                    name: '🏆 Achievement Points',
                    value: `${stats.achievementPoints.toLocaleString()} pts`,
                    inline: true
                },
                {
                    name: '📈 Stats',
                    value: `Games: ${stats.totalGames} | Wins: ${stats.wins} | Win Rate: ${stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0}%`,
                    inline: false
                }
            );

        // Add top games
        if (gamesByPoints.length > 0) {
            const topGamesText = gamesByPoints.map((g, i) => {
                const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const gameName = g.name.charAt(0).toUpperCase() + g.name.slice(1);
                return `${emoji} **${gameName}**: ${g.points} pts`;
            }).join('\n');

            embed.addFields({
                name: '🎯 Top Games by Points',
                value: topGamesText,
                inline: false
            });
        }

        // Add achievements
        embed.addFields({
            name: '🏅 Achievements',
            value: `${stats.achievements.length}/${Object.keys(achievementInfo).length} unlocked`,
            inline: true
        });

        // Add rank
        if (rank > 0) {
            embed.addFields({
                name: '🏆 Leaderboard Rank',
                value: `#${rank}`,
                inline: true
            });
        }

        // Add streak
        if (stats.currentStreak > 0) {
            embed.addFields({
                name: '🔥 Current Streak',
                value: `${stats.currentStreak} wins`,
                inline: true
            });
        }

        embed.setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
