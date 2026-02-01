import { SlashCommandBuilder, ChannelType } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View detailed server statistics'),

    async execute(interaction) {
        const guild = interaction.guild;

        // Fetch owner
        const owner = await guild.fetchOwner();

        // Count channels by type
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        // Member stats
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        // Boost stats
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Verification level
        const verificationLevels = {
            0: 'None',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High',
        };

        const embed = embedBuilder.premium({
            color: config.colors.primary,
            title: `${config.emojis.shield} ${guild.name}`,
            description: `**Server Information & Statistics**`,
            thumbnail: guild.iconURL({ size: 256 }),
            fields: [
                {
                    name: `${config.emojis.crown} Server Details`,
                    value:
                        `**Owner:** ${owner.user.tag}\n` +
                        `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>\n` +
                        `**Server ID:** \`${guild.id}\`\n` +
                        `**Verification:** ${verificationLevels[guild.verificationLevel]}`,
                    inline: true,
                },
                {
                    name: `${config.emojis.star} Members`,
                    value:
                        `**Total:** \`${totalMembers.toLocaleString()}\`\n` +
                        `**Humans:** \`${humanCount.toLocaleString()}\`\n` +
                        `**Bots:** \`${botCount}\`\n` +
                        `**Roles:** \`${guild.roles.cache.size}\``,
                    inline: true,
                },
                {
                    name: `${config.emojis.gear} Channels`,
                    value:
                        `**Text:** \`${textChannels}\`\n` +
                        `**Voice:** \`${voiceChannels}\`\n` +
                        `**Categories:** \`${categories}\`\n` +
                        `**Total:** \`${guild.channels.cache.size}\``,
                    inline: true,
                },
                {
                    name: `${config.emojis.fire} Boost Status`,
                    value:
                        `**Level:** ${boostLevel ? `Level ${boostLevel}` : 'None'} ${getBoostEmoji(boostLevel)}\n` +
                        `**Boosts:** \`${boostCount}\`\n` +
                        `**Features:** \`${guild.features.length}\``,
                    inline: true,
                },
                {
                    name: `${config.emojis.sparkles} Emojis & Stickers`,
                    value:
                        `**Emojis:** \`${guild.emojis.cache.size}\`\n` +
                        `**Stickers:** \`${guild.stickers.cache.size}\``,
                    inline: true,
                },
            ],
        });

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    },
};

// Get boost level emoji
function getBoostEmoji(level) {
    switch (level) {
        case 1: return '🥉';
        case 2: return '🥈';
        case 3: return '🥇';
        default: return '⚪';
    }
}
