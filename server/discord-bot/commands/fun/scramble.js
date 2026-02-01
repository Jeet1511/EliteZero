import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const words = [
    { word: 'javascript', hint: 'Programming language' },
    { word: 'discord', hint: 'Chat platform' },
    { word: 'computer', hint: 'Electronic device' },
    { word: 'keyboard', hint: 'Input device' },
    { word: 'internet', hint: 'Global network' },
    { word: 'elephant', hint: 'Large animal' },
    { word: 'mountain', hint: 'Natural elevation' },
    { word: 'rainbow', hint: 'Colorful arc in sky' },
    { word: 'chocolate', hint: 'Sweet treat' },
    { word: 'butterfly', hint: 'Flying insect' }
];

function scrambleWord(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

export default {
    data: new SlashCommandBuilder()
        .setName('scramble')
        .setDescription('Unscramble the word'),
    async execute(interaction) {
        const { word, hint } = words[Math.floor(Math.random() * words.length)];
        const scrambled = scrambleWord(word);

        const embed = embedBuilder.info(
            '🔤 Word Scramble',
            `Unscramble this word: **${scrambled.toUpperCase()}**\n\n💡 Hint: ${hint}\n\n*Reply with your answer!*`
        );

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id;

        try {
            const collected = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            const answer = collected.first().content.toLowerCase();

            if (answer === word) {
                const successEmbed = embedBuilder.success(
                    '🎉 Correct!',
                    `Great job! The word was **${word}**!`
                );
                await interaction.followUp({ embeds: [successEmbed] });
            } else {
                const errorEmbed = embedBuilder.error(
                    '❌ Wrong!',
                    `The correct answer was **${word}**. Better luck next time!`
                );
                await interaction.followUp({ embeds: [errorEmbed] });
            }
        } catch (error) {
            const timeoutEmbed = embedBuilder.warn(
                '⏰ Time\'s Up!',
                `The word was **${word}**.`
            );
            await interaction.followUp({ embeds: [timeoutEmbed] });
        }
    },
};
