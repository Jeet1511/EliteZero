import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the bicycle fall over? It was two-tired!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why couldn't the bicycle stand up by itself? It was two tired!",
    "What do you call cheese that isn't yours? Nacho cheese!",
    "Why did the math book look so sad? Because it had too many problems!",
    "What did the ocean say to the beach? Nothing, it just waved!",
    "Why don't skeletons fight each other? They don't have the guts!",
    "What do you call a sleeping bull? A bulldozer!",
    "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    "What's orange and sounds like a parrot? A carrot!",
    "Why can't you hear a pterodactyl go to the bathroom? Because the 'P' is silent!"
];

export default {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke'),
    async execute(interaction) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        const embed = embedBuilder.info(
            '😂 Random Joke',
            joke
        );

        await interaction.reply({ embeds: [embed] });
    },
};
