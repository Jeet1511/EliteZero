import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const questions = [
    "Would you rather have the ability to fly or be invisible?",
    "Would you rather live in the past or the future?",
    "Would you rather have unlimited money or unlimited time?",
    "Would you rather be able to speak all languages or play all instruments?",
    "Would you rather live in the ocean or in space?",
    "Would you rather have super strength or super speed?",
    "Would you rather never use social media again or never watch TV again?",
    "Would you rather be famous or be the best friend of someone famous?",
    "Would you rather have a rewind button or a pause button for your life?",
    "Would you rather always be 10 minutes late or 20 minutes early?"
];

export default {
    data: new SlashCommandBuilder()
        .setName('wyr')
        .setDescription('Would You Rather - Choose between two options'),
    async execute(interaction) {
        const question = questions[Math.floor(Math.random() * questions.length)];

        const embed = embedBuilder.info(
            '🤔 Would You Rather?',
            question
        );

        await interaction.reply({ embeds: [embed] });
    },
};
