import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Guess the number game (1-100)'),
    async execute(interaction) {
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        const maxAttempts = 7;

        const embed = embedBuilder.info(
            '🎯 Number Guessing Game',
            `I'm thinking of a number between **1 and 100**!\nYou have **${maxAttempts} attempts** to guess it.\n\n*Reply with your guess!*`
        );

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);

        const collector = interaction.channel.createMessageCollector({
            filter,
            time: 60000,
            max: maxAttempts
        });

        collector.on('collect', async (message) => {
            attempts++;
            const guess = parseInt(message.content);

            if (guess === targetNumber) {
                const winEmbed = embedBuilder.success(
                    '🎉 Correct!',
                    `You guessed it in **${attempts}** attempt(s)! The number was **${targetNumber}**!`
                );
                await message.reply({ embeds: [winEmbed] });
                collector.stop('won');
            } else if (attempts >= maxAttempts) {
                const loseEmbed = embedBuilder.error(
                    '😢 Game Over!',
                    `You've used all ${maxAttempts} attempts! The number was **${targetNumber}**.`
                );
                await message.reply({ embeds: [loseEmbed] });
                collector.stop('lost');
            } else {
                const hint = guess < targetNumber ? 'higher' : 'lower';
                const hintEmbed = embedBuilder.warn(
                    `${guess < targetNumber ? '📈' : '📉'} Try ${hint}!`,
                    `Attempts remaining: **${maxAttempts - attempts}**`
                );
                await message.reply({ embeds: [hintEmbed] });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const timeoutEmbed = embedBuilder.error(
                    '⏰ Time\'s Up!',
                    `The number was **${targetNumber}**. Better luck next time!`
                );
                interaction.followUp({ embeds: [timeoutEmbed] });
            }
        });
    },
};
