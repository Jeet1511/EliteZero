import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display user avatar in high quality')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose avatar to display')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ size: 4096, extension: 'png' });

        const embed = embedBuilder.premium({
            color: config.colors.accent,
            title: `${config.emojis.star} ${user.username}'s Avatar`,
            description: `**High-quality avatar display**`,
            image: avatarURL,
            author: {
                name: user.tag,
                iconURL: avatarURL,
            },
        });

        // Create download buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('PNG')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ size: 4096, extension: 'png' }))
                .setEmoji('🖼️'),
            new ButtonBuilder()
                .setLabel('JPG')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ size: 4096, extension: 'jpg' }))
                .setEmoji('📸'),
            new ButtonBuilder()
                .setLabel('WebP')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ size: 4096, extension: 'webp' }))
                .setEmoji('🎨'),
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
