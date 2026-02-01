import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const truthQuestions = [
    "What's the most embarrassing thing that's ever happened to you?",
    "What's your biggest fear?",
    "What's the last lie you told?",
    "What's your biggest regret?",
    "What's the most childish thing you still do?",
    "What's your biggest secret?",
    "What's the worst gift you've ever received?",
    "What's your guilty pleasure?",
    "What's the most trouble you've been in?",
    "What's something you've  never told anyone?"
];

const dares = [
    "Send a funny meme in the chat",
    "Change your nickname to something embarrassing for 10 minutes",
    "Type your next message with your eyes closed",
    "React to the last 10 messages with random emojis",
    "Send a voice message singing your favorite song",
    "Share an embarrassing photo from your camera roll",
    "Do 10 pushups and send proof",
    "Speak in rhymes for the next 5 messages",
    "Change your profile picture to something silly for 1 hour",
    "Tell a joke in the chat"
];

export default {
    data: new SlashCommandBuilder()
        .setName('tod')
        .setDescription('Truth or Dare game')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose truth or dare')
                .setRequired(true)
                .addChoices(
                    { name: '🗣️ Truth', value: 'truth' },
                    { name: '🎯 Dare', value: 'dare' }
                )),
    async execute(interaction) {
        const choice = interaction.options.getString('choice');

        if (choice === 'truth') {
            const question = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
            const embed = embedBuilder.info(
                '🗣️ Truth',
                question
            );
            await interaction.reply({ embeds: [embed] });
        } else {
            const dare = dares[Math.floor(Math.random() * dares.length)];
            const embed = embedBuilder.warn(
                '🎯 Dare',
                dare
            );
            await interaction.reply({ embeds: [embed] });
        }
    },
};
