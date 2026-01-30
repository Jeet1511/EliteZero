import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('First option')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Second option')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Third option'))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Fourth option')),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4')
        ].filter(opt => opt !== null);

        let pollText = '';
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

        options.forEach((option, index) => {
            pollText += `${emojis[index]} ${option}\n`;
        });

        const embed = embedBuilder.info(
            `📊 ${question}`,
            pollText
        )
            .setFooter({ text: `Poll by ${interaction.user.tag}` });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Add reactions
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
