import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands with futuristic UI'),

    async execute(interaction) {
        const embed = embedBuilder.premium({
            color: config.colors.primary,
            title: `${config.emojis.rocket} EliteZero Command Center`,
            description: '**Welcome to the future!** Here are all my available commands:\n',
            fields: [
                {
                    name: `${config.emojis.sparkles} General Commands`,
                    value:
                        '`/help` - Display this command list\n' +
                        '`/ping` - Check bot latency and performance\n' +
                        '`/info` - View bot information and statistics',
                    inline: false,
                },
                {
                    name: `${config.emojis.bot} Chatbot Commands`,
                    value:
                        '`/chat <message>` - Have a conversation with AI\n' +
                        '**Tip:** You can also mention me in any message to chat!',
                    inline: false,
                },
                {
                    name: `${config.emojis.star} User Commands`,
                    value:
                        '`/avatar [user]` - Display user avatar in high quality\n' +
                        '`/serverinfo` - View detailed server statistics',
                    inline: false,
                },
                {
                    name: `${config.emojis.zap} Quick Tips`,
                    value:
                        '• All commands use slash (/) prefix\n' +
                        '• Mention me to start a conversation\n' +
                        '• Commands are case-insensitive\n' +
                        '• Use tab to autocomplete commands',
                    inline: false,
                },
            ],
            thumbnail: interaction.client.user.displayAvatarURL({ size: 256 }),
        });

        // Create buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/your-server') // Update with your server
                .setEmoji(config.emojis.shield),
            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
                .setEmoji(config.emojis.rocket),
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
