import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import gameStats from '../utils/gameStats.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('🏆 View your achievements and progress')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view achievements for (leave empty for yourself)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const stats = gameStats.getUserStats(targetUser.id);
        const achievementInfo = gameStats.getAchievementInfo();

        // Separate unlocked and locked achievements
        const unlocked = [];
        const locked = [];

        for (const [key, info] of Object.entries(achievementInfo)) {
            if (stats.achievements.includes(key)) {
                unlocked.push({ key, ...info });
            } else {
                locked.push({ key, ...info });
            }
        }

        // Sort by points (descending)
        unlocked.sort((a, b) => b.points - a.points);
        locked.sort((a, b) => b.points - a.points);

        // Get rarity based on points
        const getRarity = (points) => {
            if (points >= 500) return '💎 Legendary';
            if (points >= 100) return '🌟 Epic';
            if (points >= 50) return '💜 Rare';
            return '⚪ Common';
        };

        // Build embed
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🏆 ${targetUser.username}'s Achievements`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(`**${unlocked.length}/${Object.keys(achievementInfo).length}** achievements unlocked\n**${stats.achievementPoints}** achievement points earned`);

        // Add unlocked achievements
        if (unlocked.length > 0) {
            const unlockedText = unlocked.map(a =>
                `${a.icon} **${a.name}** - ${a.desc} **(+${a.points} pts)** ${getRarity(a.points)}`
            ).join('\n');

            // Split into multiple fields if too long
            if (unlockedText.length > 1024) {
                const half = Math.ceil(unlocked.length / 2);
                const firstHalf = unlocked.slice(0, half).map(a =>
                    `${a.icon} **${a.name}** - ${a.desc} **(+${a.points} pts)**`
                ).join('\n');
                const secondHalf = unlocked.slice(half).map(a =>
                    `${a.icon} **${a.name}** - ${a.desc} **(+${a.points} pts)**`
                ).join('\n');

                embed.addFields(
                    { name: '✅ Unlocked Achievements (1/2)', value: firstHalf, inline: false },
                    { name: '✅ Unlocked Achievements (2/2)', value: secondHalf, inline: false }
                );
            } else {
                embed.addFields({
                    name: '✅ Unlocked Achievements',
                    value: unlockedText,
                    inline: false
                });
            }
        }

        // Add locked achievements (show first 5)
        if (locked.length > 0) {
            const lockedText = locked.slice(0, 5).map(a =>
                `🔒 **${a.name}** - ${a.desc} **(${a.points} pts)**`
            ).join('\n');

            const fieldName = locked.length > 5
                ? `🔒 Locked Achievements (${locked.length} remaining)`
                : '🔒 Locked Achievements';

            embed.addFields({
                name: fieldName,
                value: lockedText,
                inline: false
            });
        }

        embed.setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
