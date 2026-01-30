import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin'),
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '💿';

        const embed = embedBuilder.success(
            'Coin Flip',
            `${emoji} The coin landed on **${result}**!`
        );

        await interaction.reply({ embeds: [embed] });
    },
};
