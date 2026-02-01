import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides (default: 6)')
                .setMinValue(2)
                .setMaxValue(100)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;

        const embed = embedBuilder.success(
            '🎲 Dice Roll',
            `You rolled a **${result}** on a ${sides}-sided dice!`
        );

        await interaction.reply({ embeds: [embed] });
    },
};
