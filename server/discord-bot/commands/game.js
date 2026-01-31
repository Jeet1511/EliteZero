import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import config from '../config.js';
import AIEngine from '../utils/aiEngine.js';
import gameManager from '../utils/gameManager.js';

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
                    { name: '✊ Rock Paper Scissors', value: 'rps' }
                )
        ),

    async execute(interaction) {
        const gameType = interaction.options.getString('type');

        if (gameType) {
            // User selected game type directly, defer reply then show mode selection
            await interaction.deferReply();
            await showModeSelection(interaction, gameType);
        } else {
            // Show game selection menu
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
                .setEmoji('✊')
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
        rps: 'Rock Paper Scissors'
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
        if (mode === 'multiplayer') {
            // In multiplayer, only the opponent can accept
            if (i.customId === 'start_game' && i.user.id !== opponent.id) {
                await i.reply({ content: '❌ Only the challenged player can accept!', ephemeral: true });
                return;
            }
        } else {
            // In solo/computer, only the host can start
            if (i.user.id !== interaction.user.id) {
                await i.reply({ content: '❌ This is not your game!', ephemeral: true });
                return;
            }
        }

        if (i.customId === 'cancel_game') {
            await i.update({
                content: '❌ Game cancelled!',
                embeds: [],
                components: []
            });
            return;
        }

        if (i.customId === 'start_game') {
            await i.deferUpdate();
            // Start the actual game
            await startGame(interaction, gameType, difficulty, mode, opponent);
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
        default:
            await interaction.editReply({
                content: `${gameType} is coming soon!`,
                embeds: [],
                components: []
            });
            gameManager.endSession(session.id);
    }
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

            await i.update({ embeds: [resultEmbed], components: createBoard() });
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
    await interaction.editReply({
        content: '🎭 Hangman starting soon!',
        embeds: [],
        components: []
    });
    gameManager.endSession(session.id);
}
