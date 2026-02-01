import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const riddles = [
    {
        question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
        answer: "keyboard"
    },
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo"
    },
    {
        question: "What can travel around the world while staying in a corner?",
        answer: "stamp"
    },
    {
        question: "The more you take, the more you leave behind. What am I?",
        answer: "footsteps"
    },
    {
        question: "What has a head and a tail but no body?",
        answer: "coin"
    },
    {
        question: "What gets wet while drying?",
        answer: "towel"
    },
    {
        question: "What can you catch but never throw?",
        answer: "cold"
    },
    {
        question: "I'm tall when I'm young and short when I'm old. What am I?",
        answer: "candle"
    }
];

export default {
    data: new SlashCommandBuilder()
        .setName('riddle')
        .setDescription('Solve a riddle'),
    async execute(interaction) {
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];

        const embed = embedBuilder.info(
            '🧩 Riddle Time!',
            `${riddle.question}\n\n*Reply with your answer!*`
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

            if (answer === riddle.answer || answer.includes(riddle.answer)) {
                const successEmbed = embedBuilder.success(
                    '🎉 Correct!',
                    `Brilliant! The answer is **${riddle.answer}**!`
                );
                await interaction.followUp({ embeds: [successEmbed] });
            } else {
                const errorEmbed = embedBuilder.error(
                    '❌ Wrong!',
                    `The answer was **${riddle.answer}**. Try another riddle!`
                );
                await interaction.followUp({ embeds: [errorEmbed] });
            }
        } catch (error) {
            const timeoutEmbed = embedBuilder.warn(
                '⏰ Time\'s Up!',
                `The answer was **${riddle.answer}**.`
            );
            await interaction.followUp({ embeds: [timeoutEmbed] });
        }
    },
};
