import { SlashCommandBuilder } from 'discord.js';
import chatbot from '../utils/chatbot.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Have a conversation with EliteZero AI')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Your message to the bot')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userMessage = interaction.options.getString('message');

        // Defer reply to show thinking state
        await interaction.deferReply();

        // Get chatbot response
        const response = chatbot.getResponse(userMessage, interaction.user.id);

        // Create response embed
        const embed = embedBuilder.premium({
            color: config.colors.secondary,
            title: `${config.emojis.bot} EliteZero AI`,
            description: response,
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            fields: [
                {
                    name: '💬 Your Message',
                    value: `> ${userMessage}`,
                    inline: false,
                },
            ],
        });

        await interaction.editReply({ embeds: [embed] });
    },
};
