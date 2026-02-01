import { SlashCommandBuilder, ChannelType, EmbedBuilder } from 'discord.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('📊 View detailed server statistics and analytics'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const guild = interaction.guild;

            // Calculate member statistics (using cached data for speed)
            const totalMembers = guild.memberCount;
            const humans = guild.members.cache.filter(m => !m.user.bot).size;
            const bots = guild.members.cache.filter(m => m.user.bot).size;
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;

            // Calculate channel statistics
            const channels = guild.channels.cache;
            const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
            const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
            const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;

            // Calculate role statistics
            const roles = guild.roles.cache.size - 1; // Exclude @everyone

            // Calculate emoji statistics
            const emojis = guild.emojis.cache.size;
            const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
            const staticEmojis = emojis - animatedEmojis;

            // Server boost information
            const boostLevel = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount || 0;

            // Calculate server age
            const createdAt = guild.createdAt;
            const serverAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

            // Create progress bars
            const humanPercentage = totalMembers > 0 ? Math.round((humans / totalMembers) * 100) : 0;
            const botPercentage = totalMembers > 0 ? Math.round((bots / totalMembers) * 100) : 0;
            const humanBar = createProgressBar(humanPercentage);
            const botBar = createProgressBar(botPercentage);

            // Verification level
            const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
            const verificationLevel = verificationLevels[guild.verificationLevel] || 'Unknown';

            // Boost emoji
            const boostEmojis = ['', '🥉', '🥈', '🥇'];
            const boostEmoji = boostEmojis[boostLevel] || '';

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`📊 ${guild.name} Statistics`)
                .setDescription(`Comprehensive server analytics and information`)
                .addFields([
                    {
                        name: '👥 Members',
                        value: `**Total:** ${totalMembers.toLocaleString()}\n` +
                            `${humanBar} Humans: ${humans} (${humanPercentage}%)\n` +
                            `${botBar} Bots: ${bots} (${botPercentage}%)\n` +
                            `🟢 Online: ${onlineMembers}`,
                        inline: false
                    },
                    {
                        name: '📺 Channels',
                        value: `💬 Text: ${textChannels}\n` +
                            `🔊 Voice: ${voiceChannels}\n` +
                            `📁 Categories: ${categories}\n` +
                            `**Total:** ${channels.size}`,
                        inline: true
                    },
                    {
                        name: '🎭 Server Info',
                        value: `🎨 Roles: ${roles}\n` +
                            `😀 Emojis: ${emojis}\n` +
                            `🎬 Animated: ${animatedEmojis}\n` +
                            `🖼️ Static: ${staticEmojis}`,
                        inline: true
                    },
                    {
                        name: '💎 Boost Status',
                        value: `**Level:** ${boostLevel} ${boostEmoji}\n` +
                            `**Boosts:** ${boostCount}`,
                        inline: true
                    },
                    {
                        name: '🛡️ Security',
                        value: `**Verification:** ${verificationLevel}\n` +
                            `**2FA:** ${guild.mfaLevel === 1 ? 'Yes ✅' : 'No ❌'}`,
                        inline: true
                    },
                    {
                        name: '📅 Server Age',
                        value: `**Created:** <t:${Math.floor(createdAt.getTime() / 1000)}:R>\n` +
                            `**Days:** ${serverAge.toLocaleString()}`,
                        inline: true
                    },
                    {
                        name: '👑 Owner',
                        value: `<@${guild.ownerId}>`,
                        inline: true
                    }
                ])
                .setFooter({ text: `Server ID: ${guild.id}` })
                .setTimestamp();

            // Add thumbnail if available
            if (guild.iconURL()) {
                embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
            }

            // Add banner if available
            if (guild.banner) {
                embed.setImage(guild.bannerURL({ size: 1024 }));
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Serverstats command error:', error);
            throw error;
        }
    },
};

// Create visual progress bar
function createProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
