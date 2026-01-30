import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

const memeAPIs = [
    'https://meme-api.com/gimme',
    'https://meme-api.com/gimme/memes',
    'https://meme-api.com/gimme/dankmemes'
];

export default {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from Reddit'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const api = memeAPIs[Math.floor(Math.random() * memeAPIs.length)];
            const response = await fetch(api);
            const data = await response.json();

            const embed = embedBuilder.info(
                data.title,
                `👍 ${data.ups} upvotes | 💬 ${data.num_comments} comments`
            )
                .setImage(data.url)
                .setFooter({ text: `r/${data.subreddit} | Posted by u/${data.author}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = embedBuilder.error(
                'Error',
                'Failed to fetch meme. Please try again!'
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
