import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import config from '../config.js';
import AIEngine from '../utils/aiEngine.js';
import gameManager from '../utils/gameManager.js';
import gameStats from '../utils/gameStats.js';
import GameAnimations from '../utils/gameAnimations.js';

export default {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('🎮 Play interactive games with difficulty levels and multiplayer!')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Choose a game to play (optional - or select from menu)')
                .setRequired(false)
                .addChoices(
                    { name: '🎮 Tic Tac Toe', value: 'tictactoe' },
                    { name: '🎭 Hangman', value: 'hangman' },
                    { name: '📝 Wordle', value: 'wordle' },
                    { name: '🧩 Memory Match', value: 'memory' },
                    { name: '🎲 Number Guess', value: 'guess' },
                    { name: '🧠 Trivia', value: 'trivia' },
                    { name: '✊ Rock Paper Scissors', value: 'rps' },
                    { name: '🔴 Connect Four', value: 'connectfour' },
                    { name: '⚡ Reaction Time', value: 'reaction' },
                    { name: '🏆 Quiz Battle', value: 'quizbattle' }
                )
        ),

    async execute(interaction) {
        const gameType = interaction.options.getString('type');

        if (gameType) {
            // User selected game type directly via slash command option
            // Defer the reply immediately to acknowledge the interaction
            await interaction.deferReply();
            await showModeSelection(interaction, gameType);
        } else {
            // Show game selection menu (this will call interaction.reply())
            await showGameSelection(interaction);
        }
    },
};

// Step 1: Game Type Selection (only if not provided)
async function showGameSelection(interaction) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🎮 Game Center')
        .setDescription('**Select a game to play:**\n\nChoose from our collection of interactive games!')
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    const gameMenu = new StringSelectMenuBuilder()
        .setCustomId('select_game')
        .setPlaceholder('🎯 Choose your game...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Tic Tac Toe')
                .setDescription('Classic 3x3 grid game')
                .setValue('tictactoe')
                .setEmoji('🎮'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Hangman')
                .setDescription('Guess the word letter by letter')
                .setValue('hangman')
                .setEmoji('🎭'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Wordle')
                .setDescription('Guess the 5-letter word')
                .setValue('wordle')
                .setEmoji('📝'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Memory Match')
                .setDescription('Find matching pairs')
                .setValue('memory')
                .setEmoji('🧩'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Number Guess')
                .setDescription('Guess the secret number')
                .setValue('guess')
                .setEmoji('🎲'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Trivia')
                .setDescription('Answer trivia questions')
                .setValue('trivia')
                .setEmoji('🧠'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Rock Paper Scissors')
                .setDescription('Classic hand game')
                .setValue('rps')
                .setEmoji('✊'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Connect Four')
                .setDescription('Strategic 7x6 grid game')
                .setValue('connectfour')
                .setEmoji('🔴'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Reaction Time')
                .setDescription('Test your reflexes')
                .setValue('reaction')
                .setEmoji('⚡'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Quiz Battle')
                .setDescription('Competitive trivia challenge')
                .setValue('quizbattle')
                .setEmoji('🏆'),
            new StringSelectMenuOptionBuilder()
                .setLabel('🎯 Target Shooter')
                .setDescription('⚡ ACTION: Shoot targets before they vanish!')
                .setValue('shooter')
                .setEmoji('🎯')
        );

    const row = new ActionRowBuilder().addComponents(gameMenu);

    const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This game setup is not for you!', ephemeral: true });
            return;
        }

        if (i.customId === 'select_game') {
            const gameType = i.values[0];
            await i.deferUpdate();
            await showModeSelection(interaction, gameType);
            collector.stop();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({
                content: '⏱️ Game selection timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Step 2: Mode Selection (BEFORE difficulty)
async function showModeSelection(interaction, gameType) {
    const gameNames = {
        tictactoe: 'Tic Tac Toe',
        hangman: 'Hangman',
        wordle: 'Wordle',
        memory: 'Memory Match',
        guess: 'Number Guess',
        trivia: 'Trivia',
        rps: 'Rock Paper Scissors',
        connectfour: 'Connect Four',
        reaction: 'Reaction Time',
        quizbattle: 'Quiz Battle'
    };

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`🎮 ${gameNames[gameType]}`)
        .setDescription('**Select game mode:**\n\n' +
            '👤 **Solo** - Play alone, practice mode\n' +
            '🤖 **VS Computer** - Challenge the AI\n' +
            '👥 **Multiplayer** - Play with another user')
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    const modeMenu = new StringSelectMenuBuilder()
        .setCustomId('select_mode')
        .setPlaceholder('🎯 Choose mode...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Solo')
                .setDescription('Practice mode')
                .setValue('solo')
                .setEmoji('👤'),
            new StringSelectMenuOptionBuilder()
                .setLabel('VS Computer')
                .setDescription('Play against AI')
                .setValue('computer')
                .setEmoji('🤖'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Multiplayer')
                .setDescription('Challenge another player')
                .setValue('multiplayer')
                .setEmoji('👥')
        );

    const row = new ActionRowBuilder().addComponents(modeMenu);

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This game setup is not for you!', ephemeral: true });
            return;
        }

        if (i.customId === 'select_mode') {
            const mode = i.values[0];
            await i.deferUpdate();

            if (mode === 'computer') {
                // Show difficulty selection for VS Computer
                await showDifficultySelection(interaction, gameType, mode);
            } else if (mode === 'multiplayer') {
                // Skip difficulty, go to opponent selection
                await showOpponentSelection(interaction, gameType, mode, 'hard');
            } else {
                // Solo mode - skip difficulty, go straight to summary
                await showGameSummary(interaction, gameType, 'hard', mode, null);
            }
            collector.stop();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({
                content: '⏱️ Game setup timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Step 3: Difficulty Selection (ONLY for VS Computer mode)
async function showDifficultySelection(interaction, gameType, mode) {
    const gameNames = {
        tictactoe: 'Tic Tac Toe',
        hangman: 'Hangman',
        wordle: 'Wordle',
        memory: 'Memory Match',
        guess: 'Number Guess',
        trivia: 'Trivia',
        rps: 'Rock Paper Scissors'
    };

    const embed = new EmbedBuilder()
        .setColor(config.colors.accent)
        .setTitle(`🎮 ${gameNames[gameType]}`)
        .setDescription('**Mode:** VS Computer\n\n**Select AI difficulty:**\n\n' +
            '😊 **Easy** - Beginner-friendly AI\n' +
            '😐 **Hard** - Challenging AI\n' +
            '😈 **Impossible** - Unbeatable AI!')
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    const difficultyMenu = new StringSelectMenuBuilder()
        .setCustomId('select_difficulty')
        .setPlaceholder('⚡ Choose AI difficulty...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Easy')
                .setDescription('Perfect for beginners')
                .setValue('easy')
                .setEmoji('😊'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Hard')
                .setDescription('Standard challenge')
                .setValue('hard')
                .setEmoji('😐'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Impossible')
                .setDescription('For experts only!')
                .setValue('impossible')
                .setEmoji('😈')
        );

    const row = new ActionRowBuilder().addComponents(difficultyMenu);

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This game setup is not for you!', ephemeral: true });
            return;
        }

        if (i.customId === 'select_difficulty') {
            const difficulty = i.values[0];
            await i.deferUpdate();
            await showGameSummary(interaction, gameType, difficulty, mode, null);
            collector.stop();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({
                content: '⏱️ Game setup timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Step 4: Opponent Selection (Multiplayer only)
async function showOpponentSelection(interaction, gameType, mode, difficulty) {
    const gameNames = {
        tictactoe: 'Tic Tac Toe',
        hangman: 'Hangman',
        wordle: 'Wordle',
        memory: 'Memory Match',
        guess: 'Number Guess',
        trivia: 'Trivia',
        rps: 'Rock Paper Scissors'
    };

    const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle(`🎮 ${gameNames[gameType]}`)
        .setDescription('**Mode:** Multiplayer\n\n**Mention your opponent:**\n\nType @username to challenge someone!')
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    await interaction.editReply({
        embeds: [embed],
        components: []
    });

    const filter = m => m.author.id === interaction.user.id && m.mentions.users.size > 0;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async m => {
        const opponent = m.mentions.users.first();

        if (opponent.id === interaction.user.id) {
            await m.reply({ content: '❌ You cannot play against yourself!', ephemeral: true });
            return;
        }

        if (opponent.bot) {
            await m.reply({ content: '❌ You cannot challenge a bot!', ephemeral: true });
            return;
        }

        await showGameSummary(interaction, gameType, difficulty, mode, opponent);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            interaction.editReply({
                content: '⏱️ Opponent selection timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Step 5: Game Summary with Start Button
async function showGameSummary(interaction, gameType, difficulty, mode, opponent) {
    const gameNames = {
        tictactoe: 'Tic Tac Toe',
        hangman: 'Hangman',
        wordle: 'Wordle',
        memory: 'Memory Match',
        guess: 'Number Guess',
        trivia: 'Trivia',
        rps: 'Rock Paper Scissors'
    };

    const gameEmojis = {
        tictactoe: '🎮',
        hangman: '🎭',
        wordle: '📝',
        memory: '🧩',
        guess: '🎲',
        trivia: '🧠',
        rps: '✊'
    };

    const modeNames = {
        solo: 'Solo',
        computer: 'VS Computer',
        multiplayer: 'Multiplayer'
    };

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${gameEmojis[gameType]} ${gameNames[gameType]} - Ready to Play!`)
        .setDescription(
            '**Game Settings:**\n\n' +
            `🎯 **Game:** ${gameNames[gameType]}\n` +
            `🎭 **Mode:** ${modeNames[mode]}\n` +
            (mode === 'computer' ? `⚡ **AI Difficulty:** ${difficulty.toUpperCase()}\n` : '') +
            (opponent ? `👥 **Opponent:** ${opponent}\n` : '') +
            '\n**Ready to start?**\nClick the button below to begin!'
        )
        .setFooter({ text: config.footer.text })
        .setTimestamp();

    const startButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_game')
            .setLabel('🚀 Start Game')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel_game')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({
        content: opponent ? `${opponent}` : '',
        embeds: [embed],
        components: [startButton]
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 60000, max: 1 });

    collector.on('collect', async i => {
        try {
            console.log(`[DEBUG showGameSummary] Button clicked: ${i.customId} by user: ${i.user.id}`);
            console.log(`[DEBUG showGameSummary] Mode: ${mode}, Opponent ID: ${opponent?.id}, Interaction User: ${interaction.user.id}`);

            // Check permissions FIRST before deferring
            if (mode === 'multiplayer') {
                // In multiplayer, only the opponent can accept
                if (i.customId === 'start_game' && i.user.id !== opponent.id) {
                    console.log(`[DEBUG showGameSummary] Unauthorized user tried to start game`);
                    await i.reply({ content: '❌ Only the challenged player can accept!', ephemeral: true });
                    return;
                }
            } else {
                // In solo/computer, only the host can start
                if (i.user.id !== interaction.user.id) {
                    console.log(`[DEBUG showGameSummary] Unauthorized user tried to interact`);
                    await i.reply({ content: '❌ This is not your game!', ephemeral: true });
                    return;
                }
            }

            // Handle cancel button
            if (i.customId === 'cancel_game') {
                console.log(`[DEBUG showGameSummary] Game cancelled`);
                await i.update({
                    content: '❌ Game cancelled!',
                    embeds: [],
                    components: []
                });
                return;
            }

            // Handle start game button (user is authorized at this point)
            if (i.customId === 'start_game') {
                console.log(`[DEBUG showGameSummary] Starting game, deferring update...`);
                await i.deferUpdate();
                console.log(`[DEBUG showGameSummary] Defer successful, calling startGame...`);
                // Start the actual game
                await startGame(interaction, gameType, difficulty, mode, opponent);
                console.log(`[DEBUG showGameSummary] startGame completed`);
            }
        } catch (error) {
            console.error(`[ERROR showGameSummary] Error in collector:`, error);
            try {
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: '❌ An error occurred while starting the game!', ephemeral: true });
                }
            } catch (replyError) {
                console.error(`[ERROR showGameSummary] Could not send error reply:`, replyError);
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
            interaction.editReply({
                content: '⏱️ Game start timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Start the actual game
async function startGame(interaction, gameType, difficulty, mode, opponent) {
    // Create game session
    const session = gameManager.createSession(gameType, interaction.user.id, { difficulty, mode });

    if (opponent) {
        gameManager.joinSession(session.id, opponent.id);
    }

    gameManager.startSession(session.id);

    // Route to appropriate game
    switch (gameType) {
        case 'tictactoe':
            await playTicTacToe(interaction, session, opponent);
            break;
        case 'hangman':
            await playHangman(interaction, session);
            break;
        case 'wordle':
            await playWordle(interaction, session);
            break;
        case 'memory':
            await playMemoryMatch(interaction, session);
            break;
        case 'guess':
            await playNumberGuess(interaction, session, opponent);
            break;
        case 'trivia':
            await playTrivia(interaction, session);
            break;
        case 'rps':
            await playRockPaperScissors(interaction, session, opponent);
            break;
        case 'connectfour':
            await playConnectFour(interaction, session, opponent);
            break;
        case 'reaction':
            await playReactionTime(interaction, session);
            break;
        case 'quizbattle':
            await playQuizBattle(interaction, session, opponent);
            break;
        case 'shooter':
            await playTargetShooter(interaction, session);
            break;
        default:
            await interaction.editReply({
                content: `${gameType} is coming soon!`,
                embeds: [],
                components: []
            });
            gameManager.endSession(session.id);
    }
}

// Helper function to create Play Again/Leave buttons
function createGameEndButtons() {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('play_again')
                .setLabel('Play Again')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('view_stats')
                .setLabel('View Stats')
                .setEmoji('📊')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('leave_game')
                .setLabel('Leave')
                .setEmoji('🚪')
                .setStyle(ButtonStyle.Secondary)
        )
    ];
}

// Helper function to handle game end with points and achievements
async function handleGameEnd(interaction, session, result, extraData = {}) {
    const gameType = session.type;  // Fixed: was session.gameType, but gameManager uses session.type
    const userId = interaction.user.id;

    console.log('[DEBUG handleGameEnd] gameType:', gameType, 'result:', result, 'userId:', userId);

    // Record game and get points/achievements
    const { points, newAchievements } = gameStats.recordGame(userId, gameType, result, extraData);

    console.log('[DEBUG handleGameEnd] points:', points, 'newAchievements:', newAchievements);

    // Build achievement text if any unlocked
    let achievementText = '';
    if (newAchievements && newAchievements.length > 0) {
        const achievementInfo = gameStats.getAchievementInfo();
        achievementText = '\n\n**🎉 New Achievements Unlocked!**\n' +
            newAchievements.map(key => {
                const info = achievementInfo[key];
                return `${info.icon} **${info.name}** (+${info.points} pts)`;
            }).join('\n');
    }

    return { points, achievementText };
}

// Complete Tic Tac Toe implementation
async function playTicTacToe(interaction, session, opponent) {
    const board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
    let currentPlayer = '❌';
    const player1 = interaction.user;
    const player2 = opponent;
    const mode = session.mode;
    const difficulty = session.difficulty;

    session.data = {
        board,
        currentPlayer,
        currentTurn: player1.id,
        playerSymbol: '❌',
        aiSymbol: '⭕'
    };

    const checkWinner = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return board.includes('⬜') ? null : 'draw';
    };

    const createBoard = () => {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ttt_${index}`)
                        .setLabel(board[index])
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(board[index] !== '⬜' || session.state === 'finished')
                );
            }
            rows.push(row);
        }
        return rows;
    };

    const updateBoard = async (description) => {
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🎮 Tic Tac Toe - ${difficulty.toUpperCase()}`)
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            content: '',
            embeds: [embed],
            components: createBoard()
        });
    };

    const getDescription = () => {
        let desc = `**Mode:** ${mode === 'computer' ? 'VS Computer' : mode === 'multiplayer' ? 'Multiplayer' : 'Solo'}\n`;
        desc += `**Current Player:** ${currentPlayer}\n\n`;
        desc += `${player1.username}: ❌\n`;
        desc += mode === 'multiplayer' ? `${player2.username}: ⭕` : 'Computer: ⭕';
        return desc;
    };

    // Initial board display
    await updateBoard(getDescription());

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        // Check if it's the correct player's turn
        if (mode === 'multiplayer') {
            if (i.user.id !== session.data.currentTurn) {
                await i.reply({ content: '❌ It\'s not your turn!', ephemeral: true });
                return;
            }
        } else if (i.user.id !== player1.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const index = parseInt(i.customId.split('_')[1]);
        board[index] = currentPlayer;

        const winner = checkWinner();
        if (winner) {
            session.state = 'finished';
            let resultDesc = '';

            if (winner === 'draw') {
                resultDesc = '🤝 **It\'s a draw!**\n\nGood game!';
            } else if (mode === 'computer') {
                resultDesc = winner === '❌' ? `🎉 **You won!**\n\nCongratulations ${player1.username}!` : '🤖 **Computer wins!**\n\nBetter luck next time!';
            } else if (mode === 'multiplayer') {
                const winnerUser = winner === '❌' ? player1 : player2;
                resultDesc = `🎉 **${winnerUser.username} wins!**\n\nCongratulations!`;
            } else {
                resultDesc = `🎉 **${winner} wins!**`;
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(winner === 'draw' ? config.colors.warning : config.colors.success)
                .setTitle('🎮 Tic Tac Toe - Game Over!')
                .setDescription(resultDesc)
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            // Handle game end with points
            const result = winner === 'draw' ? 'draw' : winner === '❌' ? 'win' : 'loss';
            const { points, achievementText } = await handleGameEnd(interaction, session, result);

            // Handle multiplayer stats
            if (mode === 'multiplayer' && player2) {
                const p2Result = winner === 'draw' ? 'draw' : winner === '⭕' ? 'win' : 'loss';
                gameStats.recordGame(player2.id, 'tictactoe', p2Result);
            }

            resultEmbed.setDescription(`${resultDesc}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await i.update({ embeds: [resultEmbed], components: createGameEndButtons() });

            // Handle Play Again/Leave buttons
            const endCollector = i.message.createMessageComponentCollector({ time: 60000 });

            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== player1.id) {
                    await btnInt.reply({ content: 'Only the game starter can use these buttons!', ephemeral: true });
                    return;
                }

                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();

                    const newSession = gameManager.createSession('tictactoe', player1.id, { mode, difficulty, opponent: opponent?.id });
                    await playTicTacToe(btnInt, newSession, opponent);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(player1.id);
                    const statsEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Your Tic Tac Toe Stats')
                        .addFields(
                            { name: 'Games Played', value: `${stats.gameStats.tictactoe.played}`, inline: true },
                            { name: 'Wins', value: `${stats.gameStats.tictactoe.won}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.tictactoe.points}`, inline: true }
                        )
                        .setFooter({ text: config.footer.text });
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, winner);
            collector.stop();
            return;
        }

        // Switch player
        currentPlayer = currentPlayer === '❌' ? '⭕' : '❌';
        session.data.currentPlayer = currentPlayer;

        if (mode === 'multiplayer') {
            session.data.currentTurn = session.data.currentTurn === player1.id ? player2.id : player1.id;
        }

        await i.update({
            embeds: [new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`🎮 Tic Tac Toe - ${difficulty.toUpperCase()}`)
                .setDescription(getDescription())
                .setFooter({ text: config.footer.text })
                .setTimestamp()], components: createBoard()
        });

        // AI move if VS Computer
        if (mode === 'computer' && currentPlayer === '⭕') {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const aiMove = AIEngine.getTicTacToeMove(board, difficulty, '⭕', '❌');
            board[aiMove] = '⭕';

            const aiWinner = checkWinner();
            if (aiWinner) {
                session.state = 'finished';
                let aiResultDesc = '';

                if (aiWinner === 'draw') {
                    aiResultDesc = '🤝 **It\'s a draw!**\n\nGood game!';
                } else {
                    aiResultDesc = aiWinner === '❌' ? `🎉 **You won!**\n\nCongratulations ${player1.username}!` : '🤖 **Computer wins!**\n\nBetter luck next time!';
                }

                const aiResultEmbed = new EmbedBuilder()
                    .setColor(aiWinner === 'draw' ? config.colors.warning : aiWinner === '❌' ? config.colors.success : config.colors.error)
                    .setTitle('🎮 Tic Tac Toe - Game Over!')
                    .setDescription(aiResultDesc)
                    .setFooter({ text: config.footer.text })
                    .setTimestamp();

                await interaction.editReply({ embeds: [aiResultEmbed], components: createBoard() });

                // Record stats
                const aiResult = aiWinner === 'draw' ? 'draw' : aiWinner === '❌' ? 'win' : 'loss';
                gameStats.recordGame(player1.id, 'tictactoe', aiResult);

                gameManager.endSession(session.id, aiWinner);
                collector.stop();
            } else {
                currentPlayer = '❌';
                session.data.currentPlayer = currentPlayer;
                await updateBoard(getDescription());
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

async function playHangman(interaction, session) {
    const difficulty = session.difficulty;
    const mode = session.mode;
    const word = AIEngine.getHangmanWord(difficulty);
    const guessedLetters = new Set();
    let wrongGuesses = 0;
    const maxWrong = 6;

    session.data = {
        word,
        guessedLetters,
        wrongGuesses,
        gameOver: false
    };

    const hangmanStages = [
        '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========\n```'
    ];

    const getDisplayWord = () => {
        return word.split('').map(letter =>
            guessedLetters.has(letter) ? letter : '_'
        ).join(' ');
    };

    const createLetterButtons = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const rows = [];

        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            const start = i * 9;
            const end = Math.min(start + 9, alphabet.length);

            for (let j = start; j < end; j++) {
                const letter = alphabet[j];
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`letter_${letter}`)
                        .setLabel(letter)
                        .setStyle(
                            guessedLetters.has(letter)
                                ? (word.includes(letter) ? ButtonStyle.Success : ButtonStyle.Danger)
                                : ButtonStyle.Primary
                        )
                        .setDisabled(guessedLetters.has(letter) || session.data.gameOver)
                );
            }
            rows.push(row);
        }

        return rows;
    };

    const updateDisplay = async () => {
        const displayWord = getDisplayWord();
        const isWon = !displayWord.includes('_');
        const isLost = wrongGuesses >= maxWrong;

        let description = `${hangmanStages[wrongGuesses]}\n\n`;
        description += `**Word:** ${displayWord}\n`;
        description += `**Wrong Guesses:** ${wrongGuesses}/${maxWrong}\n`;
        description += `**Difficulty:** ${difficulty.toUpperCase()}\n`;

        if (isWon || isLost) {
            session.data.gameOver = true;
            description += `\n**Game Over!**\n`;
            description += isWon
                ? `🎉 **You won!** The word was: **${word}**`
                : `💀 **You lost!** The word was: **${word}**`;
        }

        const embed = new EmbedBuilder()
            .setColor(isWon ? config.colors.success : isLost ? config.colors.error : config.colors.primary)
            .setTitle('🎭 Hangman')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: createLetterButtons()
        });

        if (isWon || isLost) {
            // Handle game end with points
            const result = isWon ? 'win' : 'loss';
            const { points, achievementText } = await handleGameEnd(interaction, session, result);

            embed.setDescription(`${description}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);

            await interaction.editReply({
                embeds: [embed],
                components: createGameEndButtons()
            });

            // Handle Play Again/Leave buttons
            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });

            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) {
                    await btnInt.reply({ content: 'Only you can use these buttons!', ephemeral: true });
                    return;
                }

                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();

                    const newSession = gameManager.createSession('hangman', interaction.user.id, {});
                    await playHangman(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Your Hangman Stats')
                        .addFields(
                            { name: 'Games Played', value: `${stats.gameStats.hangman.played}`, inline: true },
                            { name: 'Wins', value: `${stats.gameStats.hangman.won}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.hangman.points}`, inline: true }
                        )
                        .setFooter({ text: config.footer.text });
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, isWon ? 'player' : 'lost');
            return;
        }
    };

    await updateDisplay();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const letter = i.customId.split('_')[1];
        guessedLetters.add(letter);

        if (!word.includes(letter)) {
            wrongGuesses++;
            session.data.wrongGuesses = wrongGuesses;
        }

        await i.deferUpdate();
        await updateDisplay();

        if (session.data.gameOver) {
            collector.stop();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Wordle Game Implementation
async function playWordle(interaction, session) {
    const difficulty = session.difficulty;
    const word = AIEngine.getWordleWord(difficulty).toUpperCase();
    const maxAttempts = 6;
    let attempts = 0;
    const guesses = [];

    session.data = {
        word,
        attempts,
        guesses,
        gameOver: false
    };

    const getColoredGuess = (guess) => {
        const result = [];
        const wordArray = word.split('');
        const guessArray = guess.split('');

        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === wordArray[i]) {
                result.push(`🟩 ${guessArray[i]}`);
            } else if (wordArray.includes(guessArray[i])) {
                result.push(`🟨 ${guessArray[i]}`);
            } else {
                result.push(`⬛ ${guessArray[i]}`);
            }
        }
        return result.join(' ');
    };

    const updateDisplay = async (lastGuess = null) => {
        let description = `**Difficulty:** ${difficulty.toUpperCase()}\n`;
        description += `**Attempts:** ${attempts}/${maxAttempts}\n\n`;

        if (guesses.length > 0) {
            description += '**Your Guesses:**\n';
            guesses.forEach(g => {
                description += `${getColoredGuess(g)}\n`;
            });
        }

        description += '\n🟩 = Correct position\n🟨 = Wrong position\n⬛ = Not in word';

        if (session.data.gameOver) {
            const won = lastGuess === word;
            description += `\n\n**Game Over!**\n`;
            description += won
                ? `🎉 **You won!** The word was: **${word}**`
                : `😔 **You lost!** The word was: **${word}**`;
        } else {
            description += '\n\n**Type a 5-letter word to guess!**';
        }

        const embed = new EmbedBuilder()
            .setColor(session.data.gameOver ? (lastGuess === word ? config.colors.success : config.colors.error) : config.colors.primary)
            .setTitle('📝 Wordle')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [] });
    };

    await updateDisplay();

    const filter = m => m.author.id === interaction.user.id && m.content.length === 5;
    const collector = interaction.channel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async m => {
        const guess = m.content.toUpperCase();

        if (!/^[A-Z]{5}$/.test(guess)) {
            await m.reply({ content: '❌ Please enter a valid 5-letter word!', ephemeral: true });
            return;
        }

        attempts++;
        guesses.push(guess);
        session.data.attempts = attempts;
        session.data.guesses = guesses;

        await m.delete().catch(() => { });

        if (guess === word) {
            session.data.gameOver = true;
            await updateDisplay(guess);

            const { points, achievementText } = await handleGameEnd(interaction, session, 'win', { attempts });

            const message = await interaction.fetchReply();
            await interaction.editReply({ components: createGameEndButtons() });

            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) {
                    await btnInt.reply({ content: 'Only you can use these buttons!', ephemeral: true });
                    return;
                }
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('wordle', interaction.user.id, {});
                    await playWordle(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Your Wordle Stats')
                        .addFields(
                            { name: 'Games', value: `${stats.gameStats.wordle.played}`, inline: true },
                            { name: 'Wins', value: `${stats.gameStats.wordle.won}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.wordle.points}`, inline: true }
                        );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, 'player');
            collector.stop();
        } else if (attempts >= maxAttempts) {
            session.data.gameOver = true;
            await updateDisplay(guess);

            const { points, achievementText } = await handleGameEnd(interaction, session, 'loss');

            const message = await interaction.fetchReply();
            await interaction.editReply({ components: createGameEndButtons() });

            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) {
                    await btnInt.reply({ content: 'Only you can use these buttons!', ephemeral: true });
                    return;
                }
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('wordle', interaction.user.id, {});
                    await playWordle(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Your Wordle Stats')
                        .addFields(
                            { name: 'Games', value: `${stats.gameStats.wordle.played}`, inline: true },
                            { name: 'Wins', value: `${stats.gameStats.wordle.won}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.wordle.points}`, inline: true }
                        );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, 'lost');
            collector.stop();
        } else {
            await updateDisplay(guess);
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Memory Match Game Implementation
async function playMemoryMatch(interaction, session) {
    const difficulty = session.difficulty;
    const gridSize = difficulty === 'easy' ? 8 : difficulty === 'hard' ? 12 : 16;
    const emojis = ['🎮', '🎭', '🎨', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶'];

    const cards = [];
    for (let i = 0; i < gridSize / 2; i++) {
        cards.push(emojis[i], emojis[i]);
    }
    cards.sort(() => Math.random() - 0.5);

    const revealed = new Array(gridSize).fill(false);
    const matched = new Array(gridSize).fill(false);
    let firstCard = null;
    let moves = 0;

    session.data = {
        cards,
        revealed,
        matched,
        firstCard,
        moves,
        gameOver: false
    };

    const createBoard = () => {
        const rows = [];
        const cols = difficulty === 'easy' ? 4 : 4;
        const rowCount = gridSize / cols;

        for (let i = 0; i < rowCount; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < cols; j++) {
                const index = i * cols + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`card_${index}`)
                        .setLabel(revealed[index] || matched[index] ? cards[index] : '❓')
                        .setStyle(matched[index] ? ButtonStyle.Success : revealed[index] ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setDisabled(matched[index] || session.data.gameOver)
                );
            }
            rows.push(row);
        }
        return rows;
    };

    const updateDisplay = async () => {
        const matchedCount = matched.filter(m => m).length;
        const isWon = matchedCount === gridSize;

        let description = `**Difficulty:** ${difficulty.toUpperCase()}\n`;
        description += `**Moves:** ${moves}\n`;
        description += `**Matched:** ${matchedCount}/${gridSize}\n\n`;

        if (isWon) {
            session.data.gameOver = true;
            description += `🎉 **You won in ${moves} moves!**`;
        } else {
            description += 'Click cards to find matching pairs!';
        }

        const embed = new EmbedBuilder()
            .setColor(isWon ? config.colors.success : config.colors.primary)
            .setTitle('🧩 Memory Match')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: createBoard()
        });

        if (isWon) {
            const { points, achievementText } = await handleGameEnd(interaction, session, 'win', { moves });

            embed.setDescription(`${description}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await interaction.editReply({ embeds: [embed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });

            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) {
                    await btnInt.reply({ content: 'Only you can use these buttons!', ephemeral: true });
                    return;
                }
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('memory', interaction.user.id, {});
                    await playMemoryMatch(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Your Memory Match Stats')
                        .addFields(
                            { name: 'Games', value: `${stats.gameStats.memory.played}`, inline: true },
                            { name: 'Best Moves', value: `${stats.gameStats.memory.bestMoves}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.memory.points}`, inline: true }
                        );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, 'player');
        }
    };

    await updateDisplay();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const index = parseInt(i.customId.split('_')[1]);

        if (firstCard === null) {
            firstCard = index;
            revealed[index] = true;
            session.data.firstCard = firstCard;
            await i.update({ embeds: [i.message.embeds[0]], components: createBoard() });
        } else {
            if (index === firstCard) {
                await i.reply({ content: '❌ Pick a different card!', ephemeral: true });
                return;
            }

            revealed[index] = true;
            moves++;
            session.data.moves = moves;

            await i.update({ embeds: [i.message.embeds[0]], components: createBoard() });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (cards[firstCard] === cards[index]) {
                matched[firstCard] = true;
                matched[index] = true;
            }

            revealed[firstCard] = false;
            revealed[index] = false;
            firstCard = null;
            session.data.firstCard = null;

            await updateDisplay();

            if (session.data.gameOver) {
                collector.stop();
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Number Guess Game Implementation
async function playNumberGuess(interaction, session, opponent) {
    const difficulty = session.difficulty;
    const mode = session.mode;
    const range = difficulty === 'easy' ? 50 : difficulty === 'hard' ? 100 : 200;
    const secretNumber = Math.floor(Math.random() * range) + 1;
    let attempts = 0;
    const maxAttempts = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 7 : 5;

    session.data = {
        secretNumber,
        attempts,
        maxAttempts,
        range,
        gameOver: false,
        guesses: []
    };

    const updateDisplay = async (lastGuess = null, hint = null) => {
        let description = `**Difficulty:** ${difficulty.toUpperCase()}\n`;
        description += `**Range:** 1 - ${range}\n`;
        description += `**Attempts:** ${attempts}/${maxAttempts}\n\n`;

        if (session.data.guesses.length > 0) {
            description += '**Previous Guesses:**\n';
            session.data.guesses.forEach(g => {
                description += `${g.guess} - ${g.hint}\n`;
            });
            description += '\n';
        }

        if (session.data.gameOver) {
            const won = lastGuess === secretNumber;
            description += won
                ? `🎉 **Correct!** The number was **${secretNumber}**!`
                : `😔 **Out of attempts!** The number was **${secretNumber}**`;
        } else {
            description += '**Type a number to guess!**';
        }

        const embed = new EmbedBuilder()
            .setColor(session.data.gameOver ? (lastGuess === secretNumber ? config.colors.success : config.colors.error) : config.colors.primary)
            .setTitle('🎲 Number Guess')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [] });
    };

    await updateDisplay();

    const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
    const collector = interaction.channel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async m => {
        const guess = parseInt(m.content);

        if (guess < 1 || guess > range) {
            await m.reply({ content: `❌ Please enter a number between 1 and ${range}!`, ephemeral: true });
            return;
        }

        attempts++;
        session.data.attempts = attempts;

        await m.delete().catch(() => { });

        let hint;
        if (guess === secretNumber) {
            hint = '✅ Correct!';
            session.data.gameOver = true;
            session.data.guesses.push({ guess, hint });
            await updateDisplay(guess, hint);

            const { points, achievementText } = await handleGameEnd(interaction, session, 'win', { attempts });

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('🎲 Number Guess - You Won!')
                .setDescription(`🎉 You guessed **${secretNumber}** in **${attempts}** attempts!\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await interaction.editReply({ embeds: [embed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('guess', interaction.user.id, {});
                    await playNumberGuess(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Number Guess Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.guess.played}`, inline: true },
                        { name: 'Wins', value: `${stats.gameStats.guess.won}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.guess.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, 'player');
            collector.stop();
        } else {
            hint = guess < secretNumber ? '📈 Too low!' : '📉 Too high!';
            session.data.guesses.push({ guess, hint });

            if (attempts >= maxAttempts) {
                session.data.gameOver = true;
                await updateDisplay(guess, hint);

                const { points, achievementText } = await handleGameEnd(interaction, session, 'loss');

                const embed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setTitle('🎲 Number Guess - Game Over')
                    .setDescription(`😔 Out of attempts! The number was **${secretNumber}**\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
                await interaction.editReply({ embeds: [embed], components: createGameEndButtons() });

                const message = await interaction.fetchReply();
                const endCollector = message.createMessageComponentCollector({ time: 60000 });
                endCollector.on('collect', async (btnInt) => {
                    if (btnInt.user.id !== interaction.user.id) return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
                    if (btnInt.customId === 'play_again') {
                        await btnInt.deferUpdate();
                        gameManager.endSession(session.id);
                        collector.stop();
                        endCollector.stop();
                        const newSession = gameManager.createSession('guess', interaction.user.id, {});
                        await playNumberGuess(btnInt, newSession);
                    } else if (btnInt.customId === 'view_stats') {
                        const stats = gameStats.getUserStats(interaction.user.id);
                        const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Number Guess Stats').addFields(
                            { name: 'Games', value: `${stats.gameStats.guess.played}`, inline: true },
                            { name: 'Wins', value: `${stats.gameStats.guess.won}`, inline: true },
                            { name: 'Points', value: `${stats.gameStats.guess.points}`, inline: true }
                        );
                        await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                    } else if (btnInt.customId === 'leave_game') {
                        await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                        gameManager.endSession(session.id);
                        collector.stop();
                        endCollector.stop();
                    }
                });

                gameManager.endSession(session.id, 'lost');
                collector.stop();
            } else {
                await updateDisplay(guess, hint);
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Trivia Game Implementation
async function playTrivia(interaction, session) {
    const difficulty = session.difficulty;
    const questionsCount = 5;
    let currentQuestion = 0;
    let score = 0;

    session.data = {
        currentQuestion,
        score,
        questionsCount,
        gameOver: false
    };

    const askQuestion = async () => {
        const question = AIEngine.getTriviaQuestion(difficulty);
        session.data.currentAnswer = question.correct;

        let description = `**Question ${currentQuestion + 1}/${questionsCount}**\n`;
        description += `**Score:** ${score}/${currentQuestion}\n\n`;
        description += `**${question.q}**\n\n`;

        const buttons = new ActionRowBuilder();
        question.a.forEach((answer, index) => {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`answer_${index}`)
                    .setLabel(answer)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🧠 Trivia Challenge')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [buttons]
        });
    };

    await askQuestion();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const answerIndex = parseInt(i.customId.split('_')[1]);
        const isCorrect = answerIndex === session.data.currentAnswer;

        if (isCorrect) {
            score++;
            session.data.score = score;
        }

        currentQuestion++;
        session.data.currentQuestion = currentQuestion;

        await i.deferUpdate();

        if (currentQuestion >= questionsCount) {
            session.data.gameOver = true;
            const percentage = Math.round((score / questionsCount) * 100);

            const resultEmbed = new EmbedBuilder()
                .setColor(percentage >= 60 ? config.colors.success : config.colors.warning)
                .setTitle('🧠 Trivia Complete!')
                .setDescription(
                    `**Final Score:** ${score}/${questionsCount} (${percentage}%)\n\n` +
                    (percentage >= 80 ? '🏆 **Excellent!**' : percentage >= 60 ? '👍 **Good job!**' : '📚 **Keep practicing!**')
                )
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            const { points, achievementText } = await handleGameEnd(interaction, session, 'complete', { score });

            resultEmbed.setDescription(
                `**Final Score:** ${score}/${questionsCount} (${percentage}%)\n\n` +
                (percentage >= 80 ? '🏆 **Excellent!**' : percentage >= 60 ? '👍 **Good job!**' : '📚 **Keep practicing!**') +
                `\n\n💰 **Points Earned:** +${points} pts${achievementText}`
            );

            await interaction.editReply({ embeds: [resultEmbed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('trivia', interaction.user.id, {});
                    await playTrivia(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Trivia Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.trivia.played}`, inline: true },
                        { name: 'Best Score', value: `${stats.gameStats.trivia.bestScore}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.trivia.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, score);
            collector.stop();
        } else {
            await askQuestion();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Rock Paper Scissors Game Implementation
async function playRockPaperScissors(interaction, session, opponent) {
    const mode = session.mode;
    const difficulty = session.difficulty;
    let playerScore = 0;
    let opponentScore = 0;
    const maxRounds = 3;
    let currentRound = 0;
    const playerHistory = [];

    session.data = {
        playerScore,
        opponentScore,
        currentRound,
        maxRounds,
        playerHistory,
        gameOver: false
    };

    const getWinner = (player, opponent) => {
        if (player === opponent) return 'draw';
        if (
            (player === 'rock' && opponent === 'scissors') ||
            (player === 'paper' && opponent === 'rock') ||
            (player === 'scissors' && opponent === 'paper')
        ) {
            return 'player';
        }
        return 'opponent';
    };

    const playRound = async () => {
        let description = `**Round ${currentRound + 1}/${maxRounds}**\n`;
        description += `**Score:** You ${playerScore} - ${opponentScore} ${mode === 'computer' ? 'Computer' : opponent.username}\n\n`;
        description += 'Choose your move!';

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rps_rock')
                .setLabel('🪨 Rock')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rps_paper')
                .setLabel('📄 Paper')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rps_scissors')
                .setLabel('✂️ Scissors')
                .setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('✊ Rock Paper Scissors')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [buttons]
        });
    };

    await playRound();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const playerMove = i.customId.split('_')[1];
        playerHistory.push(playerMove);

        let opponentMove;
        if (mode === 'computer') {
            opponentMove = AIEngine.getRPSMove(difficulty, playerHistory);
        } else {
            opponentMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        }

        const winner = getWinner(playerMove, opponentMove);

        if (winner === 'player') {
            playerScore++;
            session.data.playerScore = playerScore;
        } else if (winner === 'opponent') {
            opponentScore++;
            session.data.opponentScore = opponentScore;
        }

        currentRound++;
        session.data.currentRound = currentRound;

        const moveEmojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        let resultDesc = `**Round ${currentRound}/${maxRounds}**\n\n`;
        resultDesc += `You chose: ${moveEmojis[playerMove]} **${playerMove}**\n`;
        resultDesc += `${mode === 'computer' ? 'Computer' : opponent.username} chose: ${moveEmojis[opponentMove]} **${opponentMove}**\n\n`;
        resultDesc += winner === 'draw' ? '🤝 **Draw!**' : winner === 'player' ? '🎉 **You won this round!**' : '😔 **You lost this round!**';
        resultDesc += `\n\n**Score:** You ${playerScore} - ${opponentScore} ${mode === 'computer' ? 'Computer' : opponent.username}`;

        await i.deferUpdate();

        if (currentRound >= maxRounds) {
            session.data.gameOver = true;
            resultDesc += '\n\n**Game Over!**\n';
            resultDesc += playerScore > opponentScore
                ? '🏆 **You won the match!**'
                : playerScore < opponentScore
                    ? '😔 **You lost the match!**'
                    : '🤝 **It\'s a tie!**';

            const finalEmbed = new EmbedBuilder()
                .setColor(playerScore > opponentScore ? config.colors.success : playerScore < opponentScore ? config.colors.error : config.colors.warning)
                .setTitle('✊ Rock Paper Scissors - Complete!')
                .setDescription(resultDesc)
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            await interaction.editReply({ embeds: [finalEmbed], components: [] });

            // Record stats and show Play Again buttons
            const rpsResult = playerScore > opponentScore ? 'win' : playerScore < opponentScore ? 'loss' : 'draw';
            const { points, achievementText } = await handleGameEnd(interaction, session, rpsResult);

            finalEmbed.setDescription(`${resultDesc}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await interaction.editReply({ embeds: [finalEmbed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('rps', interaction.user.id, { mode, difficulty });
                    await playRockPaperScissors(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your RPS Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.rps.played}`, inline: true },
                        { name: 'Wins', value: `${stats.gameStats.rps.won}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.rps.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, playerScore > opponentScore ? 'player' : 'opponent');
            collector.stop();
        } else {
            const roundEmbed = new EmbedBuilder()
                .setColor(winner === 'player' ? config.colors.success : winner === 'opponent' ? config.colors.error : config.colors.warning)
                .setTitle('✊ Rock Paper Scissors')
                .setDescription(resultDesc)
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            await interaction.editReply({ embeds: [roundEmbed], components: [] });

            await new Promise(resolve => setTimeout(resolve, 2000));
            await playRound();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Connect Four Game Implementation
async function playConnectFour(interaction, session, opponent) {
    const rows = 6;
    const cols = 7;
    const board = Array(rows).fill(null).map(() => Array(cols).fill('⬜'));
    const mode = session.mode;
    const difficulty = session.difficulty;
    const player1 = interaction.user;
    const player2 = opponent;

    session.data = {
        board,
        currentPlayer: '🔴',
        currentTurn: player1.id,
        gameOver: false
    };

    const checkWinner = () => {
        // Check horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (board[r][c] !== '⬜' &&
                    board[r][c] === board[r][c + 1] &&
                    board[r][c] === board[r][c + 2] &&
                    board[r][c] === board[r][c + 3]) {
                    return board[r][c];
                }
            }
        }

        // Check vertical
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] !== '⬜' &&
                    board[r][c] === board[r + 1][c] &&
                    board[r][c] === board[r + 2][c] &&
                    board[r][c] === board[r + 3][c]) {
                    return board[r][c];
                }
            }
        }

        // Check diagonal (down-right)
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (board[r][c] !== '⬜' &&
                    board[r][c] === board[r + 1][c + 1] &&
                    board[r][c] === board[r + 2][c + 2] &&
                    board[r][c] === board[r + 3][c + 3]) {
                    return board[r][c];
                }
            }
        }

        // Check diagonal (down-left)
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 3; c < cols; c++) {
                if (board[r][c] !== '⬜' &&
                    board[r][c] === board[r + 1][c - 1] &&
                    board[r][c] === board[r + 2][c - 2] &&
                    board[r][c] === board[r + 3][c - 3]) {
                    return board[r][c];
                }
            }
        }

        // Check for draw
        if (board[0].every(cell => cell !== '⬜')) {
            return 'draw';
        }

        return null;
    };

    const dropDisc = (col, disc) => {
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][col] === '⬜') {
                board[r][col] = disc;
                return true;
            }
        }
        return false;
    };

    const getAIMove = () => {
        const validCols = [];
        for (let c = 0; c < cols; c++) {
            if (board[0][c] === '⬜') validCols.push(c);
        }

        if (difficulty === 'easy') {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // Hard/Impossible: Try to win or block
        for (const col of validCols) {
            // Try to win
            const testBoard = board.map(row => [...row]);
            for (let r = rows - 1; r >= 0; r--) {
                if (testBoard[r][col] === '⬜') {
                    testBoard[r][col] = '🟡';
                    if (checkWinForDisc(testBoard, '🟡')) return col;
                    testBoard[r][col] = '⬜';
                    break;
                }
            }
        }

        for (const col of validCols) {
            // Try to block
            const testBoard = board.map(row => [...row]);
            for (let r = rows - 1; r >= 0; r--) {
                if (testBoard[r][col] === '⬜') {
                    testBoard[r][col] = '🔴';
                    if (checkWinForDisc(testBoard, '🔴')) return col;
                    testBoard[r][col] = '⬜';
                    break;
                }
            }
        }

        return validCols[Math.floor(Math.random() * validCols.length)];
    };

    const checkWinForDisc = (testBoard, disc) => {
        // Simplified win check for AI
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 3; c++) {
                if (testBoard[r][c] === disc && testBoard[r][c + 1] === disc &&
                    testBoard[r][c + 2] === disc && testBoard[r][c + 3] === disc) return true;
            }
        }
        for (let r = 0; r < rows - 3; r++) {
            for (let c = 0; c < cols; c++) {
                if (testBoard[r][c] === disc && testBoard[r + 1][c] === disc &&
                    testBoard[r + 2][c] === disc && testBoard[r + 3][c] === disc) return true;
            }
        }
        return false;
    };

    const createBoard = () => {
        let boardStr = '';
        for (let r = 0; r < rows; r++) {
            boardStr += board[r].join(' ') + '\n';
        }
        boardStr += '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣';
        return boardStr;
    };

    const createButtons = () => {
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        // First row: columns 1-5
        for (let c = 0; c < 5; c++) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`cf_${c}`)
                    .setLabel(`${c + 1}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(board[0][c] !== '⬜' || session.data.gameOver)
            );
        }

        // Second row: columns 6-7
        for (let c = 5; c < cols; c++) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`cf_${c}`)
                    .setLabel(`${c + 1}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(board[0][c] !== '⬜' || session.data.gameOver)
            );
        }

        return [row1, row2];
    };

    const updateDisplay = async () => {
        const currentPlayer = session.data.currentPlayer;
        let description = `**Mode:** ${mode === 'computer' ? 'VS Computer' : mode === 'multiplayer' ? 'Multiplayer' : 'Solo'}\n`;
        description += `**Current Player:** ${currentPlayer}\n\n`;
        description += createBoard();

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🔴 Connect Four')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: createButtons()
        });
    };

    await updateDisplay();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (mode === 'multiplayer') {
            if (i.user.id !== session.data.currentTurn) {
                await i.reply({ content: '❌ It\'s not your turn!', ephemeral: true });
                return;
            }
        } else if (i.user.id !== player1.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const col = parseInt(i.customId.split('_')[1]);
        const currentDisc = session.data.currentPlayer;

        if (!dropDisc(col, currentDisc)) {
            await i.reply({ content: '❌ Column is full!', ephemeral: true });
            return;
        }

        const winner = checkWinner();
        if (winner) {
            session.data.gameOver = true;
            let resultDesc = createBoard() + '\n\n';

            if (winner === 'draw') {
                resultDesc += '🤝 **It\'s a draw!**';
            } else if (mode === 'computer') {
                resultDesc += winner === '🔴' ? `🎉 **You won!**` : '🤖 **Computer wins!**';
            } else if (mode === 'multiplayer') {
                const winnerUser = winner === '🔴' ? player1 : player2;
                resultDesc += `🎉 **${winnerUser.username} wins!**`;
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(winner === 'draw' ? config.colors.warning : config.colors.success)
                .setTitle('🔴 Connect Four - Game Over!')
                .setDescription(resultDesc)
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            await i.update({ embeds: [resultEmbed], components: [] });

            const result = winner === 'draw' ? 'draw' : winner === '🔴' ? 'win' : 'loss';
            const { points, achievementText } = await handleGameEnd(interaction, session, result);
            if (mode === 'multiplayer' && player2) {
                const p2Result = winner === 'draw' ? 'draw' : winner === '🟡' ? 'win' : 'loss';
                gameStats.recordGame(player2.id, 'connectfour', p2Result);
            }

            resultEmbed.setDescription(`${resultDesc}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await i.update({ embeds: [resultEmbed], components: createGameEndButtons() });

            const endCollector = i.message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== player1.id) return await btnInt.reply({ content: 'Only the game starter can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('connectfour', player1.id, { mode, difficulty, opponent: opponent?.id });
                    await playConnectFour(btnInt, newSession, opponent);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(player1.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Connect Four Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.connectfour.played}`, inline: true },
                        { name: 'Wins', value: `${stats.gameStats.connectfour.won}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.connectfour.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, winner);
            collector.stop();
            return;
        }

        // Switch player
        session.data.currentPlayer = session.data.currentPlayer === '🔴' ? '🟡' : '🔴';
        if (mode === 'multiplayer') {
            session.data.currentTurn = session.data.currentTurn === player1.id ? player2.id : player1.id;
        }

        await i.deferUpdate();
        await updateDisplay();

        // AI move
        if (mode === 'computer' && session.data.currentPlayer === '🟡') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const aiCol = getAIMove();
            dropDisc(aiCol, '🟡');

            const aiWinner = checkWinner();
            if (aiWinner) {
                session.data.gameOver = true;
                let aiResultDesc = createBoard() + '\n\n';
                aiResultDesc += aiWinner === 'draw' ? '🤝 **It\'s a draw!**' :
                    aiWinner === '🔴' ? `🎉 **You won!**` : '🤖 **Computer wins!**';

                const aiResultEmbed = new EmbedBuilder()
                    .setColor(aiWinner === 'draw' ? config.colors.warning : aiWinner === '🔴' ? config.colors.success : config.colors.error)
                    .setTitle('🔴 Connect Four - Game Over!')
                    .setDescription(aiResultDesc)
                    .setFooter({ text: config.footer.text })
                    .setTimestamp();

                await interaction.editReply({ embeds: [aiResultEmbed], components: [] });

                const aiResult = aiWinner === 'draw' ? 'draw' : aiWinner === '🔴' ? 'win' : 'loss';
                gameStats.recordGame(player1.id, 'connectfour', aiResult);
                gameManager.endSession(session.id, aiWinner);
                collector.stop();
            } else {
                session.data.currentPlayer = '🔴';
                await updateDisplay();
            }
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Reaction Time Game Implementation
async function playReactionTime(interaction, session) {
    const difficulty = session.difficulty;
    const rounds = 3;
    let currentRound = 0;
    const times = [];

    session.data = {
        currentRound,
        times,
        gameOver: false
    };

    const playRound = async () => {
        const waitTime = difficulty === 'easy' ?
            Math.random() * 3000 + 2000 : // 2-5 seconds
            difficulty === 'hard' ?
                Math.random() * 2000 + 1000 : // 1-3 seconds
                Math.random() * 1500 + 500; // 0.5-2 seconds

        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('⚡ Reaction Time Challenge')
            .setDescription(`**Round ${currentRound + 1}/${rounds}**\n\n⏳ **Wait for it...**\n\nGet ready to click!`)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [] });

        await new Promise(resolve => setTimeout(resolve, waitTime));

        const startTime = Date.now();
        session.data.startTime = startTime;

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('react_click')
                .setLabel('⚡ CLICK NOW!')
                .setStyle(ButtonStyle.Success)
        );

        const goEmbed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('⚡ Reaction Time Challenge')
            .setDescription(`**Round ${currentRound + 1}/${rounds}**\n\n✅ **GO! CLICK NOW!**`)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({ embeds: [goEmbed], components: [button] });
    };

    await playRound();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '❌ This is not your game!', ephemeral: true });
            return;
        }

        const reactionTime = Date.now() - session.data.startTime;
        times.push(reactionTime);
        currentRound++;
        session.data.currentRound = currentRound;

        await i.deferUpdate();

        if (currentRound >= rounds) {
            session.data.gameOver = true;
            const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            const bestTime = Math.min(...times);

            let rating = '';
            if (avgTime < 200) rating = '🚀 **LIGHTNING FAST!**';
            else if (avgTime < 300) rating = '⚡ **Excellent!**';
            else if (avgTime < 400) rating = '👍 **Good!**';
            else if (avgTime < 500) rating = '😊 **Not bad!**';
            else rating = '🐌 **Keep practicing!**';

            const resultEmbed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('⚡ Reaction Time - Complete!')
                .setDescription(
                    `**Results:**\n\n` +
                    `⚡ **Average Time:** ${avgTime}ms\n` +
                    `🏆 **Best Time:** ${bestTime}ms\n\n` +
                    `**All Times:**\n${times.map((t, i) => `Round ${i + 1}: ${t}ms`).join('\n')}\n\n` +
                    rating
                )
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            const { points, achievementText } = await handleGameEnd(interaction, session, 'complete', { avgTime, bestTime });

            resultEmbed.setDescription(
                `**Results:**\n\n` +
                `⚡ **Average Time:** ${avgTime}ms\n` +
                `🏆 **Best Time:** ${bestTime}ms\n\n` +
                `**All Times:**\n${times.map((t, i) => `Round ${i + 1}: ${t}ms`).join('\n')}\n\n` +
                rating +
                `\n\n💰 **Points Earned:** +${points} pts${achievementText}`
            );

            await interaction.editReply({ embeds: [resultEmbed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id) return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('reaction', interaction.user.id, { difficulty });
                    await playReactionTime(btnInt, newSession);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(interaction.user.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Reaction Time Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.reaction.played}`, inline: true },
                        { name: 'Best Time', value: `${stats.gameStats.reaction.bestTime}ms`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.reaction.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, avgTime);
            collector.stop();
        } else {
            await playRound();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// Quiz Battle Game Implementation
async function playQuizBattle(interaction, session, opponent) {
    const difficulty = session.difficulty;
    const mode = session.mode;
    const questionsCount = 5;
    let currentQuestion = 0;
    let player1Score = 0;
    let player2Score = 0;
    const player1 = interaction.user;
    const player2 = opponent;

    session.data = {
        currentQuestion,
        player1Score,
        player2Score,
        questionsCount,
        gameOver: false,
        answeredPlayers: new Set()
    };

    const askQuestion = async () => {
        const question = AIEngine.getTriviaQuestion(difficulty);
        session.data.currentAnswer = question.correct;
        session.data.answeredPlayers.clear();

        let description = `**Question ${currentQuestion + 1}/${questionsCount}**\n`;
        if (mode === 'multiplayer') {
            description += `**Score:** ${player1.username} ${player1Score} - ${player2Score} ${player2.username}\n\n`;
        } else {
            description += `**Score:** ${player1Score}/${currentQuestion}\n\n`;
        }
        description += `**${question.q}**\n\n`;

        const buttons = new ActionRowBuilder();
        question.a.forEach((answer, index) => {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`qb_answer_${index}`)
                    .setLabel(answer)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🏆 Quiz Battle')
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [buttons]
        });
    };

    await askQuestion();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (mode === 'multiplayer') {
            if (i.user.id !== player1.id && i.user.id !== player2.id) {
                await i.reply({ content: '❌ This is not your game!', ephemeral: true });
                return;
            }

            if (session.data.answeredPlayers.has(i.user.id)) {
                await i.reply({ content: '❌ You already answered this question!', ephemeral: true });
                return;
            }

            session.data.answeredPlayers.add(i.user.id);
        } else {
            if (i.user.id !== interaction.user.id) {
                await i.reply({ content: '❌ This is not your game!', ephemeral: true });
                return;
            }
        }

        const answerIndex = parseInt(i.customId.split('_')[2]);
        const isCorrect = answerIndex === session.data.currentAnswer;

        if (isCorrect) {
            if (mode === 'multiplayer') {
                if (i.user.id === player1.id) {
                    player1Score++;
                    session.data.player1Score = player1Score;
                } else {
                    player2Score++;
                    session.data.player2Score = player2Score;
                }
            } else {
                player1Score++;
                session.data.player1Score = player1Score;
            }
        }

        await i.deferUpdate();

        // In multiplayer, wait for both players or timeout
        if (mode === 'multiplayer' && session.data.answeredPlayers.size < 2) {
            return; // Wait for second player
        }

        currentQuestion++;
        session.data.currentQuestion = currentQuestion;

        if (currentQuestion >= questionsCount) {
            session.data.gameOver = true;

            let resultDesc = '';
            if (mode === 'multiplayer') {
                resultDesc = `**Final Score:**\n${player1.username}: ${player1Score}\n${player2.username}: ${player2Score}\n\n`;
                if (player1Score > player2Score) {
                    resultDesc += `🏆 **${player1.username} wins!**`;
                } else if (player2Score > player1Score) {
                    resultDesc += `🏆 **${player2.username} wins!**`;
                } else {
                    resultDesc += '🤝 **It\'s a tie!**';
                }
            } else {
                const percentage = Math.round((player1Score / questionsCount) * 100);
                resultDesc = `**Final Score:** ${player1Score}/${questionsCount} (${percentage}%)\n\n`;
                resultDesc += percentage >= 80 ? '🏆 **Excellent!**' : percentage >= 60 ? '👍 **Good job!**' : '📚 **Keep practicing!**';
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('🏆 Quiz Battle - Complete!')
                .setDescription(resultDesc)
                .setFooter({ text: config.footer.text })
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed], components: [] });

            const { points, achievementText } = await handleGameEnd(interaction, session, 'complete', { score: player1Score });
            if (mode === 'multiplayer' && player2) {
                gameStats.recordGame(player2.id, 'quizbattle', 'complete', { score: player2Score });
            }

            resultEmbed.setDescription(`${resultDesc}\n\n💰 **Points Earned:** +${points} pts${achievementText}`);
            await interaction.editReply({ embeds: [resultEmbed], components: createGameEndButtons() });

            const message = await interaction.fetchReply();
            const endCollector = message.createMessageComponentCollector({ time: 60000 });
            endCollector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== player1.id) return await btnInt.reply({ content: 'Only the game starter can use these!', ephemeral: true });
                if (btnInt.customId === 'play_again') {
                    await btnInt.deferUpdate();
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                    const newSession = gameManager.createSession('quizbattle', player1.id, { mode, opponent: opponent?.id });
                    await playQuizBattle(btnInt, newSession, opponent);
                } else if (btnInt.customId === 'view_stats') {
                    const stats = gameStats.getUserStats(player1.id);
                    const statsEmbed = new EmbedBuilder().setColor(config.colors.primary).setTitle('📊 Your Quiz Battle Stats').addFields(
                        { name: 'Games', value: `${stats.gameStats.quizbattle.played}`, inline: true },
                        { name: 'Best Score', value: `${stats.gameStats.quizbattle.bestScore}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.quizbattle.points}`, inline: true }
                    );
                    await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
                } else if (btnInt.customId === 'leave_game') {
                    await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                    gameManager.endSession(session.id);
                    collector.stop();
                    endCollector.stop();
                }
            });

            gameManager.endSession(session.id, player1Score);
            collector.stop();
        } else {
            await askQuestion();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}

// 🎯 Target Shooter Game Implementation
async function playTargetShooter(interaction, session) {
    const difficulty = session.difficulty;
    const gridSize = 5;
    const totalRounds = 10;
    let currentRound = 0;
    let score = 0;
    let combo = 0;
    let hits = 0;
    let misses = 0;

    const targetDuration = difficulty === 'easy' ? 4000 : difficulty === 'hard' ? 2000 : 1500;
    session.data = { currentRound, score, combo, hits, misses, gameOver: false };

    const playRound = async () => {
        const targetRow = Math.floor(Math.random() * gridSize);
        const targetCol = Math.floor(Math.random() * gridSize);
        const targetPos = targetRow * gridSize + targetCol;

        const grid = GameAnimations.createGrid(gridSize, gridSize, '⬜');
        GameAnimations.updateGridCell(grid, targetRow, targetCol, '🎯');
        const gridDisplay = GameAnimations.gridToString(grid);
        const comboDisplay = GameAnimations.getComboDisplay(combo);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎯 Target Shooter')
            .setDescription(
                `**Round ${currentRound + 1}/${totalRounds}** ${comboDisplay}\n\n` +
                `${gridDisplay}\n\n` +
                `**Score:** ${GameAnimations.formatScore(score)}\n` +
                `**Hits:** ${hits} | **Misses:** ${misses}\n` +
                `⏱️ **Quick! Click the target!**`
            )
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        const rows = [];
        for (let r = 0; r < gridSize; r++) {
            const row = new ActionRowBuilder();
            for (let c = 0; c < gridSize; c++) {
                const pos = r * gridSize + c;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`shoot_${pos}`)
                        .setLabel(pos === targetPos ? '🎯' : '⬜')
                        .setStyle(pos === targetPos ? ButtonStyle.Danger : ButtonStyle.Secondary)
                );
            }
            rows.push(row);
        }

        await interaction.editReply({ embeds: [embed], components: rows });
        session.data.targetPos = targetPos;
        session.data.roundComplete = false;

        session.data.targetTimeout = setTimeout(async () => {
            if (!session.data.roundComplete) {
                misses++;
                combo = 0;
                session.data.misses = misses;
                session.data.combo = combo;
                session.data.roundComplete = true;

                const missEmbed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setTitle('🎯 Target Shooter')
                    .setDescription(
                        `**Round ${currentRound + 1}/${totalRounds}**\n\n` +
                        `${gridDisplay}\n\n` +
                        `❌ **Too slow! Target escaped!**\n` +
                        `**Score:** ${score}\n` +
                        `**Hits:** ${hits} | **Misses:** ${misses}`
                    )
                    .setFooter({ text: config.footer.text });

                await interaction.editReply({ embeds: [missEmbed], components: [] });
                await new Promise(resolve => setTimeout(resolve, 1500));

                currentRound++;
                session.data.currentRound = currentRound;

                if (currentRound >= totalRounds) {
                    await endGame();
                } else {
                    await playRound();
                }
            }
        }, targetDuration);
    };

    const endGame = async () => {
        session.data.gameOver = true;
        clearTimeout(session.data.targetTimeout);

        const accuracy = totalRounds > 0 ? Math.round((hits / totalRounds) * 100) : 0;
        let rating = '';
        if (accuracy >= 90) rating = '🏆 **SHARPSHOOTER!**';
        else if (accuracy >= 70) rating = '🎯 **Excellent!**';
        else if (accuracy >= 50) rating = '👍 **Good!**';
        else rating = '📚 **Keep practicing!**';

        const resultEmbed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('🎯 Target Shooter - Complete!')
            .setDescription(
                `**Final Results:**\n\n` +
                `🎯 **Score:** ${GameAnimations.formatScore(score, 50)}\n` +
                `✅ **Hits:** ${hits}/${totalRounds}\n` +
                `❌ **Misses:** ${misses}\n` +
                `📊 **Accuracy:** ${accuracy}%\n\n` +
                rating
            )
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.editReply({ embeds: [resultEmbed], components: [] });

        const { points, achievementText } = await handleGameEnd(interaction, session, 'complete', { score, hits });

        resultEmbed.setDescription(
            `**Final Results:**\n\n` +
            `🎯 **Score:** ${GameAnimations.formatScore(score, 50)}\n` +
            `✅ **Hits:** ${hits}/${totalRounds}\n` +
            `❌ **Misses:** ${misses}\n` +
            `📊 **Accuracy:** ${accuracy}%\n\n` +
            rating +
            `\n\n💰 **Points Earned:** +${points} pts${achievementText}`
        );

        await interaction.editReply({ embeds: [resultEmbed], components: createGameEndButtons() });

        const message = await interaction.fetchReply();
        const endCollector = message.createMessageComponentCollector({ time: 60000 });

        endCollector.on('collect', async (btnInt) => {
            if (btnInt.user.id !== interaction.user.id) {
                return await btnInt.reply({ content: 'Only you can use these!', ephemeral: true });
            }

            if (btnInt.customId === 'play_again') {
                await btnInt.deferUpdate();
                gameManager.endSession(session.id);
                endCollector.stop();
                const newSession = gameManager.createSession('shooter', interaction.user.id, { difficulty });
                await playTargetShooter(btnInt, newSession);
            } else if (btnInt.customId === 'view_stats') {
                const stats = gameStats.getUserStats(interaction.user.id);
                const statsEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setTitle('📊 Your Target Shooter Stats')
                    .addFields(
                        { name: 'Games', value: `${stats.gameStats.shooter?.played || 0}`, inline: true },
                        { name: 'Best Score', value: `${stats.gameStats.shooter?.bestScore || 0}`, inline: true },
                        { name: 'Points', value: `${stats.gameStats.shooter?.points || 0}`, inline: true }
                    );
                await btnInt.reply({ embeds: [statsEmbed], ephemeral: true });
            } else if (btnInt.customId === 'leave_game') {
                await btnInt.update({ content: '👋 Thanks for playing!', embeds: [], components: [] });
                gameManager.endSession(session.id);
                endCollector.stop();
            }
        });

        gameManager.endSession(session.id, score);
    };

    await playRound();

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
            return await i.reply({ content: '❌ This is not your game!', ephemeral: true });
        }

        if (session.data.roundComplete) {
            return await i.deferUpdate();
        }

        const clickedPos = parseInt(i.customId.split('_')[1]);
        const isHit = clickedPos === session.data.targetPos;

        clearTimeout(session.data.targetTimeout);
        session.data.roundComplete = true;

        if (isHit) {
            hits++;
            combo++;
            const comboBonus = combo >= 5 ? 15 : combo >= 3 ? 10 : combo >= 2 ? 5 : 0;
            const roundPoints = 10 + comboBonus;
            score += roundPoints;

            session.data.hits = hits;
            session.data.combo = combo;
            session.data.score = score;

            const grid = GameAnimations.createGrid(gridSize, gridSize, '⬜');
            GameAnimations.updateGridCell(grid, Math.floor(clickedPos / gridSize), clickedPos % gridSize, '💥');
            const hitDisplay = GameAnimations.gridToString(grid);
            const comboDisplay = GameAnimations.getComboDisplay(combo);

            const hitEmbed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('🎯 Target Shooter')
                .setDescription(
                    `**Round ${currentRound + 1}/${totalRounds}** ${comboDisplay}\n\n` +
                    `${hitDisplay}\n\n` +
                    `💥 **HIT! +${roundPoints} pts** ${comboBonus > 0 ? `(+${comboBonus} combo bonus)` : ''}\n` +
                    `**Score:** ${GameAnimations.formatScore(score)}\n` +
                    `**Hits:** ${hits} | **Misses:** ${misses}`
                )
                .setFooter({ text: config.footer.text });

            await i.update({ embeds: [hitEmbed], components: [] });
        } else {
            misses++;
            combo = 0;
            session.data.misses = misses;
            session.data.combo = combo;

            const grid = GameAnimations.createGrid(gridSize, gridSize, '⬜');
            GameAnimations.updateGridCell(grid, Math.floor(clickedPos / gridSize), clickedPos % gridSize, '❌');
            const missDisplay = GameAnimations.gridToString(grid);

            const missEmbed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setTitle('🎯 Target Shooter')
                .setDescription(
                    `**Round ${currentRound + 1}/${totalRounds}**\n\n` +
                    `${missDisplay}\n\n` +
                    `❌ **MISS!**\n` +
                    `**Score:** ${score}\n` +
                    `**Hits:** ${hits} | **Misses:** ${misses}`
                )
                .setFooter({ text: config.footer.text });

            await i.update({ embeds: [missEmbed], components: [] });
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        currentRound++;
        session.data.currentRound = currentRound;

        if (currentRound >= totalRounds) {
            await endGame();
        } else {
            await playRound();
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time' && !session.data.gameOver) {
            clearTimeout(session.data.targetTimeout);
            gameManager.endSession(session.id);
            interaction.editReply({
                content: '⏱️ Game timed out!',
                embeds: [],
                components: []
            }).catch(() => { });
        }
    });
}
