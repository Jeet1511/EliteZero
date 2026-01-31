import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 Display all available commands with detailed information'),

    async execute(interaction) {
        const categories = {
            games: {
                name: '🎮 Games & Entertainment',
                icon: '🎮',
                commands: [
                    { name: '/game', description: 'Play interactive games (Tic Tac Toe, Hangman, Wordle, etc.) with difficulty levels and multiplayer!' },
                    { name: '/8ball <question>', description: 'Ask the magic 8-ball a question' },
                    { name: '/coinflip', description: 'Flip a coin (heads or tails)' },
                    { name: '/dice', description: 'Roll a dice (1-6)' },
                    { name: '/rps <choice>', description: 'Play Rock, Paper, Scissors' },
                    { name: '/scramble', description: 'Unscramble the word game' },
                    { name: '/trivia', description: 'Answer random trivia questions' },
                    { name: '/wyr', description: 'Would You Rather - choose between two options' },
                    { name: '/tod', description: 'Truth or Dare game' }
                ]
            },
            fun: {
                name: '🎉 Fun & Entertainment',
                icon: '🎉',
                commands: [
                    { name: '/joke', description: 'Get a random joke to brighten your day' },
                    { name: '/meme', description: 'Get a random meme from Reddit' },
                    { name: '/riddle', description: 'Solve a challenging riddle' },
                    { name: '/inspire', description: 'Get an inspiring quote' }
                ]
            },
            actions: {
                name: '🎭 Social Actions',
                icon: '🎭',
                commands: [
                    { name: '/action <type> <user>', description: 'Perform actions like hug, kiss, slap, pat, highfive, dance, poke, cuddle, and more!' },
                    { name: 'Available actions:', description: 'hug, kiss, slap, pat, highfive, dance, poke, cuddle, wave, wink, cry, laugh, smile, facepalm, shrug, thumbsup, clap, bonk' }
                ]
            },
            analytics: {
                name: '📊 Server Analytics',
                icon: '📊',
                commands: [
                    { name: '/serverstats', description: 'Detailed server statistics dashboard with graphs' },
                    { name: '/serverinfo', description: 'Basic server information and details' },
                    { name: '/activity <period>', description: 'Server activity tracker with visual graphs' },
                    { name: '/leaderboard <type>', description: 'View activity rankings (messages/voice/contributors)' },
                    { name: '/userinfo <user>', description: 'Get detailed information about a user' }
                ]
            },
            utility: {
                name: '🔧 Utility Tools',
                icon: '🔧',
                commands: [
                    { name: '/remind <time> <message>', description: 'Set a reminder for yourself' },
                    { name: '/poll <question>', description: 'Create an interactive poll' },
                    { name: '/avatar <user>', description: 'Display user avatar in high quality' },
                    { name: '/ping', description: 'Check bot latency and performance' },
                    { name: '/info', description: 'View bot information and statistics' }
                ]
            },
            ai: {
                name: '🤖 AI & Chat',
                icon: '🤖',
                commands: [
                    { name: '/chat <message>', description: 'Have a conversation with EliteZero AI' },
                    { name: '/zero', description: 'Activate OpenClaw AI mode for advanced conversations' },
                    { name: '/stop', description: 'Deactivate OpenClaw AI mode and return to normal' },
                    { name: '@EliteZero <message>', description: 'Mention the bot to chat naturally' }
                ]
            },
            moderation: {
                name: '🛡️ Moderation',
                icon: '🛡️',
                commands: [
                    { name: '/ban <user> <reason>', description: 'Ban a member from the server' },
                    { name: '/kick <user> <reason>', description: 'Kick a member from the server' },
                    { name: '/mute <user> <duration>', description: 'Timeout a member for specified duration' },
                    { name: '/unmute <user>', description: 'Remove timeout from a member' },
                    { name: '/clear <amount>', description: 'Delete multiple messages at once (bulk delete)' }
                ]
            }
        };

        const mainEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🚀 EliteZero Command Center')
            .setDescription(
                '**Welcome to the future!** Here are all my available commands.\n\n' +
                '**📚 General Commands**\n' +
                '`/help` - Display all commands\n' +
                '`/ping` - Check bot latency and performance\n' +
                '`/info` - View bot information and statistics\n\n' +
                '**🎮 Chatbot Commands**\n' +
                '`/chat <message>` - Have a conversation with AI\n' +
                '`/zero` - Activate OpenClaw AI mode\n' +
                '`/stop` - Deactivate AI mode\n\n' +
                '**👥 User Commands**\n' +
                '`/avatar <user>` - Display user avatar in high quality\n' +
                '`/userinfo <user>` - Get information about a user\n' +
                '`/serverinfo` - View detailed server statistics\n' +
                '`/serverstats` - View detailed server statistics and analytics\n' +
                '`/leaderboard <type>` - View the server activity leaderboard\n\n' +
                '**💡 Quick Tips:**\n' +
                '• All commands use slash (/) prefix\n' +
                '• Mention me to start a conversation!\n' +
                '• Use tab to autocomplete commands\n' +
                '• Use the menu below to explore categories\n\n' +
                '**💖 Creator:** GitHub [@jeet1511](https://github.com/jeet1511)'
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('📂 Select a category to view detailed commands')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Games & Entertainment')
                    .setDescription('Interactive games with difficulty levels')
                    .setValue('games')
                    .setEmoji('🎮'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Fun Commands')
                    .setDescription('Jokes, memes, riddles, and quotes')
                    .setValue('fun')
                    .setEmoji('🎉'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Social Actions')
                    .setDescription('Interactive actions with other users')
                    .setValue('actions')
                    .setEmoji('🎭'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Server Analytics')
                    .setDescription('Statistics, leaderboards, and tracking')
                    .setValue('analytics')
                    .setEmoji('📊'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Utility Tools')
                    .setDescription('Helpful features and tools')
                    .setValue('utility')
                    .setEmoji('🔧'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('AI & Chat')
                    .setDescription('Conversation and AI features')
                    .setValue('ai')
                    .setEmoji('🤖'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Moderation')
                    .setDescription('Server moderation tools (Admin only)')
                    .setValue('moderation')
                    .setEmoji('🛡️')
            );

        // Button row with GitHub and Invite links
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support the Creator')
                .setStyle(ButtonStyle.Link)
                .setURL('https://github.com/jeet1511')
                .setEmoji('💖'),
            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.com/oauth2/authorize?client_id=1466746596904665179')
                .setEmoji('🤖')
        );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [mainEmbed],
            components: [buttonRow, row]
        });

        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                await i.reply({ content: '❌ This help menu is not for you!', ephemeral: true });
                return;
            }

            const category = categories[i.values[0]];
            const categoryEmbed = new EmbedBuilder()
                .setColor(config.colors.accent)
                .setTitle(`${category.icon} ${category.name}`)
                .setDescription(
                    category.commands
                        .map(cmd => `**${cmd.name}**\n└ ${cmd.description}`)
                        .join('\n\n')
                )
                .setFooter({ text: `${config.footer.text} • Select another category from the menu` })
                .setTimestamp();

            await i.update({ embeds: [categoryEmbed], components: [buttonRow, row] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true)
            );
            interaction.editReply({ components: [disabledRow] }).catch(() => { });
        });
    },
};
