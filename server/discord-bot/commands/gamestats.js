import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';
import gameStats from '../utils/gameStats.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gamestats')
        .setDescription('📊 View your game statistics and achievements')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view stats for (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of stats to view')
                .setRequired(false)
                .addChoices(
                    { name: '📊 Overall Stats', value: 'overall' },
                    { name: '🎮 Tic Tac Toe', value: 'tictactoe' },
                    { name: '🎭 Hangman', value: 'hangman' },
                    { name: '📝 Wordle', value: 'wordle' },
                    { name: '🧩 Memory Match', value: 'memory' },
                    { name: '🎲 Number Guess', value: 'guess' },
                    { name: '🧠 Trivia', value: 'trivia' },
                    { name: '✊ Rock Paper Scissors', value: 'rps' },
                    { name: '🏆 Leaderboard', value: 'leaderboard' }
                )
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const statsType = interaction.options.getString('type') || 'overall';

        if (statsType === 'leaderboard') {
            await showLeaderboard(interaction);
            return;
        }

        const stats = gameStats.getUserStats(targetUser.id);

        if (stats.totalGames === 0) {
            await interaction.reply({
                content: `${targetUser.id === interaction.user.id ? 'You haven\'t' : `${targetUser.username} hasn't`} played any games yet! Use \`/game\` to start playing!`,
                ephemeral: true
            });
            return;
        }

        if (statsType === 'overall') {
            await showOverallStats(interaction, targetUser, stats);
        } else {
            await showGameStats(interaction, targetUser, stats, statsType);
        }
    },
};

async function showOverallStats(interaction, user, stats) {
    const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;

    let description = `**Total Games:** ${stats.totalGames}\n`;
    description += `**Wins:** ${stats.wins} 🏆\n`;
    description += `**Losses:** ${stats.losses} 😔\n`;
    description += `**Draws:** ${stats.draws} 🤝\n`;
    description += `**Win Rate:** ${winRate}%\n\n`;

    description += `**Game Breakdown:**\n`;
    const gameEmojis = {
        tictactoe: '🎮',
        hangman: '🎭',
        wordle: '📝',
        memory: '🧩',
        guess: '🎲',
        trivia: '🧠',
        rps: '✊'
    };

    for (const [game, emoji] of Object.entries(gameEmojis)) {
        const gameStats = stats.gameStats[game];
        if (gameStats.played > 0) {
            description += `${emoji} ${gameStats.played} games\n`;
        }
    }

    if (stats.achievements.length > 0) {
        description += `\n**Achievements:** 🏅 ${stats.achievements.length}\n`;
        const achievementNames = {
            first_game: '🎮 First Game',
            veteran: '⭐ Veteran (10 games)',
            legend: '👑 Legend (50 games)',
            winner: '🏆 Winner (10 wins)',
            champion: '💎 Champion (50 wins)',
            trivia_master: '🧠 Trivia Master',
            memory_genius: '🧩 Memory Genius'
        };
        stats.achievements.forEach(ach => {
            description += `• ${achievementNames[ach] || ach}\n`;
        });
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`📊 ${user.username}'s Game Statistics`)
        .setDescription(description)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function showGameStats(interaction, user, stats, gameType) {
    const gameStats = stats.gameStats[gameType];
    const gameNames = {
        tictactoe: '🎮 Tic Tac Toe',
        hangman: '🎭 Hangman',
        wordle: '📝 Wordle',
        memory: '🧩 Memory Match',
        guess: '🎲 Number Guess',
        trivia: '🧠 Trivia',
        rps: '✊ Rock Paper Scissors'
    };

    if (gameStats.played === 0) {
        await interaction.reply({
            content: `${user.id === interaction.user.id ? 'You haven\'t' : `${user.username} hasn't`} played ${gameNames[gameType]} yet!`,
            ephemeral: true
        });
        return;
    }

    let description = `**Games Played:** ${gameStats.played}\n`;

    if (gameStats.won !== undefined) {
        description += `**Wins:** ${gameStats.won} 🏆\n`;
    }
    if (gameStats.lost !== undefined) {
        description += `**Losses:** ${gameStats.lost} 😔\n`;
    }
    if (gameStats.draw !== undefined) {
        description += `**Draws:** ${gameStats.draw} 🤝\n`;
    }

    if (gameType === 'wordle' && gameStats.avgAttempts > 0) {
        description += `**Average Attempts:** ${gameStats.avgAttempts.toFixed(1)}\n`;
    }

    if (gameType === 'guess' && gameStats.avgAttempts > 0) {
        description += `**Average Attempts:** ${gameStats.avgAttempts.toFixed(1)}\n`;
    }

    if (gameType === 'memory' && gameStats.bestMoves !== Infinity) {
        description += `**Best Score:** ${gameStats.bestMoves} moves 🌟\n`;
    }

    if (gameType === 'trivia') {
        description += `**Best Score:** ${gameStats.bestScore}/5 🌟\n`;
        const avgScore = gameStats.played > 0 ? (gameStats.totalScore / gameStats.played).toFixed(1) : 0;
        description += `**Average Score:** ${avgScore}/5\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`${gameNames[gameType]} - ${user.username}'s Stats`)
        .setDescription(description)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function showLeaderboard(interaction) {
    const overallLeaderboard = gameStats.getOverallLeaderboard(10);

    if (overallLeaderboard.length === 0) {
        await interaction.reply({
            content: 'No one has played any games yet! Be the first!',
            ephemeral: true
        });
        return;
    }

    let description = '**Top 10 Players by Total Wins**\n\n';

    for (let i = 0; i < overallLeaderboard.length; i++) {
        const entry = overallLeaderboard[i];
        const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
        const username = user ? user.username : 'Unknown User';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

        description += `${medal} **${username}**\n`;
        description += `   Wins: ${entry.wins} | Games: ${entry.totalGames} | Win Rate: ${entry.winRate.toFixed(1)}%\n\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.accent)
        .setTitle('🏆 Game Leaderboard')
        .setDescription(description)
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
