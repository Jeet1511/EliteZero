// AI Engine for Game Opponents
// Provides intelligent AI for various games with difficulty scaling

export default class AIEngine {
    // Tic Tac Toe AI using Minimax Algorithm
    static getTicTacToeMove(board, difficulty, aiSymbol, playerSymbol) {
        if (difficulty === 'easy') {
            // Random valid move
            const emptySpots = [];
            for (let i = 0; i < 9; i++) {
                if (board[i] === '⬜') emptySpots.push(i);
            }
            return emptySpots[Math.floor(Math.random() * emptySpots.length)];
        } else if (difficulty === 'hard') {
            // 70% optimal, 30% random
            return Math.random() < 0.7
                ? this.minimaxTicTacToe(board, aiSymbol, playerSymbol).index
                : this.getTicTacToeMove(board, 'easy', aiSymbol, playerSymbol);
        } else {
            // Impossible - always optimal
            return this.minimaxTicTacToe(board, aiSymbol, playerSymbol).index;
        }
    }

    static minimaxTicTacToe(board, aiSymbol, playerSymbol) {
        const availSpots = board.map((val, idx) => val === '⬜' ? idx : null).filter(val => val !== null);

        // Check for terminal states
        const winner = this.checkTicTacToeWinner(board);
        if (winner === aiSymbol) return { score: 10 };
        if (winner === playerSymbol) return { score: -10 };
        if (availSpots.length === 0) return { score: 0 };

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            board[availSpots[i]] = aiSymbol;

            const result = this.minimaxTicTacToe(board, playerSymbol, aiSymbol);
            move.score = -result.score;

            board[availSpots[i]] = '⬜';
            moves.push(move);
        }

        let bestMove;
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }

        return moves[bestMove];
    }

    static checkTicTacToeWinner(board) {
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
        return null;
    }

    // Rock Paper Scissors AI with Pattern Detection
    static getRPSMove(difficulty, playerHistory = []) {
        const choices = ['rock', 'paper', 'scissors'];

        if (difficulty === 'easy') {
            // Random choice
            return choices[Math.floor(Math.random() * 3)];
        } else if (difficulty === 'hard') {
            // Detect simple patterns
            if (playerHistory.length >= 2) {
                const lastTwo = playerHistory.slice(-2);
                if (lastTwo[0] === lastTwo[1]) {
                    // Player repeating, counter it
                    return this.counterMove(lastTwo[1]);
                }
            }
            return choices[Math.floor(Math.random() * 3)];
        } else {
            // Impossible - Advanced pattern detection
            if (playerHistory.length >= 3) {
                const lastThree = playerHistory.slice(-3);
                // Check for patterns
                if (lastThree[0] === lastThree[2]) {
                    return this.counterMove(lastThree[2]);
                }
                // Frequency analysis
                const freq = { rock: 0, paper: 0, scissors: 0 };
                playerHistory.forEach(move => freq[move]++);
                const mostUsed = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
                return this.counterMove(mostUsed);
            }
            return choices[Math.floor(Math.random() * 3)];
        }
    }

    static counterMove(move) {
        const counters = {
            rock: 'paper',
            paper: 'scissors',
            scissors: 'rock'
        };
        return counters[move];
    }

    // Number Guessing AI
    static getNumberGuess(min, max, previousGuesses = [], hints = []) {
        // Binary search approach for hard/impossible
        let newMin = min;
        let newMax = max;

        for (let i = 0; i < previousGuesses.length; i++) {
            if (hints[i] === 'high') {
                newMax = Math.min(newMax, previousGuesses[i] - 1);
            } else if (hints[i] === 'low') {
                newMin = Math.max(newMin, previousGuesses[i] + 1);
            }
        }

        return Math.floor((newMin + newMax) / 2);
    }

    // Hangman Word Selection
    static getHangmanWord(difficulty) {
        const words = {
            easy: ['CAT', 'DOG', 'FISH', 'BIRD', 'TREE', 'BOOK', 'CAKE', 'BALL'],
            hard: ['JAVASCRIPT', 'DISCORD', 'COMPUTER', 'DEVELOPER', 'FUNCTION', 'VARIABLE'],
            impossible: ['ASYNCHRONOUS', 'CRYPTOCURRENCY', 'INFRASTRUCTURE', 'PHILOSOPHICAL', 'EXTRAORDINARY']
        };
        const wordList = words[difficulty] || words.hard;
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    // Wordle Word Selection
    static getWordleWord(difficulty) {
        const words = {
            easy: ['CATS', 'DOGS', 'FISH', 'BIRD', 'TREE', 'BOOK', 'CAKE', 'BALL'],
            hard: ['REACT', 'CODES', 'GAMES', 'MUSIC', 'DANCE', 'PARTY', 'SMART', 'BRAIN'],
            impossible: ['RHYTHM', 'PSYCHE', 'SPHINX', 'QUARTZ', 'OXYGEN', 'ENZYME']
        };
        const wordList = words[difficulty] || words.hard;
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    // Trivia Question Selection
    static getTriviaQuestion(difficulty) {
        const questions = {
            easy: [
                { q: 'What color is the sky?', a: ['Blue', 'Green', 'Red', 'Yellow'], correct: 0 },
                { q: 'How many legs does a spider have?', a: ['6', '8', '10', '12'], correct: 1 },
                { q: 'What is 2 + 2?', a: ['3', '4', '5', '6'], correct: 1 }
            ],
            hard: [
                { q: 'What is the capital of France?', a: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 1 },
                { q: 'Who painted the Mona Lisa?', a: ['Van Gogh', 'Picasso', 'Da Vinci', 'Monet'], correct: 2 },
                { q: 'What year did World War 2 end?', a: ['1943', '1944', '1945', '1946'], correct: 2 }
            ],
            impossible: [
                { q: 'What is the smallest prime number?', a: ['0', '1', '2', '3'], correct: 2 },
                { q: 'What is the speed of light?', a: ['299,792 km/s', '300,000 km/s', '299,000 km/s', '298,792 km/s'], correct: 0 },
                { q: 'Who wrote "1984"?', a: ['Orwell', 'Huxley', 'Bradbury', 'Asimov'], correct: 0 }
            ]
        };
        const questionList = questions[difficulty] || questions.hard;
        return questionList[Math.floor(Math.random() * questionList.length)];
    }

    // Connect Four AI (Simple Strategy)
    static getConnectFourMove(board, difficulty, aiSymbol) {
        // board is 6x7 grid
        const cols = 7;

        if (difficulty === 'easy') {
            // Random valid column
            const validCols = [];
            for (let col = 0; col < cols; col++) {
                if (board[col] === '⬜') validCols.push(col);
            }
            return validCols[Math.floor(Math.random() * validCols.length)];
        } else if (difficulty === 'hard') {
            // Try to win or block
            // Check for winning move
            for (let col = 0; col < cols; col++) {
                if (this.canWinConnectFour(board, col, aiSymbol)) {
                    return col;
                }
            }
            // Check for blocking move
            const playerSymbol = aiSymbol === '🔴' ? '🟡' : '🔴';
            for (let col = 0; col < cols; col++) {
                if (this.canWinConnectFour(board, col, playerSymbol)) {
                    return col;
                }
            }
            // Otherwise random
            return this.getConnectFourMove(board, 'easy', aiSymbol);
        } else {
            // Impossible - Advanced strategy
            // Implement full minimax or use heuristics
            return this.getConnectFourMove(board, 'hard', aiSymbol);
        }
    }

    static canWinConnectFour(board, col, symbol) {
        // Simplified check - would need full implementation
        return false; // Placeholder
    }
}
