import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const triviaQuestions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        answer: 2
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: 3
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        answer: 2
    },
    {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        answer: 1
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        answer: 1
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        answer: 2
    }
];

export default {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Answer a random trivia question'),
    async execute(interaction) {
        const question = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];

        let optionsText = '';
        question.options.forEach((option, index) => {
            optionsText += `${index + 1}. ${option}\n`;
        });

        const embed = embedBuilder.info(
            '🧠 Trivia Time!',
            `**${question.question}**\n\n${optionsText}\n*Reply with the number of your answer!*`
        );

        await interaction.reply({ embeds: [embed] });

        // Wait for user's answer
        const filter = m => m.author.id === interaction.user.id && ['1', '2', '3', '4'].includes(m.content);

        try {
            const collected = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 15000,
                errors: ['time']
            });

            const answer = parseInt(collected.first().content) - 1;

            if (answer === question.answer) {
                const successEmbed = embedBuilder.success(
                    '🎉 Correct!',
                    `Great job! The answer was **${question.options[question.answer]}**!`
                );
                await interaction.followUp({ embeds: [successEmbed] });
            } else {
                const errorEmbed = embedBuilder.error(
                    '❌ Wrong!',
                    `The correct answer was **${question.options[question.answer]}**. Better luck next time!`
                );
                await interaction.followUp({ embeds: [errorEmbed] });
            }
        } catch (error) {
            const timeoutEmbed = embedBuilder.warn(
                '⏰ Time\'s Up!',
                `The correct answer was **${question.options[question.answer]}**.`
            );
            await interaction.followUp({ embeds: [timeoutEmbed] });
        }
    },
};
