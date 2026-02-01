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
                { q: 'What is 2 + 2?', a: ['3', '4', '5', '6'], correct: 1 },
                { q: 'What animal says "meow"?', a: ['Dog', 'Cat', 'Cow', 'Bird'], correct: 1 },
                { q: 'How many days are in a week?', a: ['5', '6', '7', '8'], correct: 2 },
                { q: 'What color is grass?', a: ['Blue', 'Red', 'Green', 'Yellow'], correct: 2 },
                { q: 'How many wheels does a car have?', a: ['2', '3', '4', '5'], correct: 2 },
                { q: 'What do bees make?', a: ['Milk', 'Honey', 'Butter', 'Cheese'], correct: 1 },
                { q: 'What is the opposite of hot?', a: ['Warm', 'Cold', 'Cool', 'Freezing'], correct: 1 },
                { q: 'How many fingers on one hand?', a: ['4', '5', '6', '10'], correct: 1 },
                { q: 'What shape is a ball?', a: ['Square', 'Triangle', 'Circle', 'Rectangle'], correct: 2 },
                { q: 'What do you use to write?', a: ['Fork', 'Spoon', 'Pen', 'Knife'], correct: 2 },
                { q: 'What is frozen water called?', a: ['Steam', 'Ice', 'Snow', 'Rain'], correct: 1 },
                { q: 'How many eyes do you have?', a: ['1', '2', '3', '4'], correct: 1 },
                { q: 'What is the sun?', a: ['Planet', 'Star', 'Moon', 'Comet'], correct: 1 },
                { q: 'What do fish live in?', a: ['Trees', 'Water', 'Air', 'Sand'], correct: 1 },
                { q: 'How many months in a year?', a: ['10', '11', '12', '13'], correct: 2 },
                { q: 'What is the first letter of the alphabet?', a: ['A', 'B', 'C', 'D'], correct: 0 },
                { q: 'What do cows drink?', a: ['Milk', 'Water', 'Juice', 'Soda'], correct: 1 },
                { q: 'What comes after 9?', a: ['8', '10', '11', '12'], correct: 1 },
                { q: 'What is the color of an apple?', a: ['Blue', 'Red', 'Purple', 'Orange'], correct: 1 },
                { q: 'How many seasons are there?', a: ['2', '3', '4', '5'], correct: 2 },
                { q: 'What is the largest ocean animal?', a: ['Shark', 'Dolphin', 'Blue Whale', 'Octopus'], correct: 2 },
                { q: 'What planet do we live on?', a: ['Mars', 'Earth', 'Venus', 'Jupiter'], correct: 1 },
                { q: 'What is H2O?', a: ['Air', 'Water', 'Fire', 'Earth'], correct: 1 }
            ],
            hard: [
                { q: 'What is the capital of France?', a: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 1 },
                { q: 'Who painted the Mona Lisa?', a: ['Van Gogh', 'Picasso', 'Da Vinci', 'Monet'], correct: 2 },
                { q: 'What year did World War 2 end?', a: ['1943', '1944', '1945', '1946'], correct: 2 },
                { q: 'What is the largest planet?', a: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correct: 2 },
                { q: 'Who wrote Romeo and Juliet?', a: ['Dickens', 'Shakespeare', 'Austen', 'Hemingway'], correct: 1 },
                { q: 'What is the capital of Japan?', a: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correct: 2 },
                { q: 'How many continents are there?', a: ['5', '6', '7', '8'], correct: 2 },
                { q: 'What is the smallest country?', a: ['Monaco', 'Vatican City', 'Malta', 'Liechtenstein'], correct: 1 },
                { q: 'Who discovered America?', a: ['Magellan', 'Columbus', 'Vespucci', 'Cortez'], correct: 1 },
                { q: 'What is the tallest mountain?', a: ['K2', 'Everest', 'Kilimanjaro', 'Denali'], correct: 1 },
                { q: 'What is the speed of sound?', a: ['343 m/s', '300 m/s', '400 m/s', '500 m/s'], correct: 0 },
                { q: 'Who invented the telephone?', a: ['Edison', 'Bell', 'Tesla', 'Marconi'], correct: 1 },
                { q: 'What is the largest desert?', a: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'], correct: 3 },
                { q: 'What year did man land on moon?', a: ['1967', '1968', '1969', '1970'], correct: 2 },
                { q: 'What is the longest river?', a: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1 },
                { q: 'Who wrote Harry Potter?', a: ['Tolkien', 'Rowling', 'Martin', 'King'], correct: 1 },
                { q: 'What is the capital of Australia?', a: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct: 2 },
                { q: 'How many bones in human body?', a: ['196', '206', '216', '226'], correct: 1 },
                { q: 'What is the chemical symbol for gold?', a: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
                { q: 'Who painted Starry Night?', a: ['Monet', 'Van Gogh', 'Picasso', 'Dali'], correct: 1 },
                { q: 'What is the largest ocean?', a: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
                { q: 'What year did Titanic sink?', a: ['1910', '1911', '1912', '1913'], correct: 2 },
                { q: 'Who developed theory of relativity?', a: ['Newton', 'Einstein', 'Hawking', 'Bohr'], correct: 1 },
                { q: 'What is the capital of Canada?', a: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correct: 2 },
                { q: 'How many strings on a guitar?', a: ['4', '5', '6', '7'], correct: 2 },
                { q: 'What is the smallest planet?', a: ['Mars', 'Mercury', 'Venus', 'Pluto'], correct: 1 },
                { q: 'Who wrote 1984?', a: ['Orwell', 'Huxley', 'Bradbury', 'Vonnegut'], correct: 0 },
                { q: 'What is the currency of Japan?', a: ['Yuan', 'Won', 'Yen', 'Baht'], correct: 2 },
                { q: 'How many hearts does an octopus have?', a: ['1', '2', '3', '4'], correct: 2 },
                { q: 'What is the hardest natural substance?', a: ['Steel', 'Diamond', 'Titanium', 'Tungsten'], correct: 1 }
            ],
            impossible: [
                { q: 'What is the smallest prime number?', a: ['0', '1', '2', '3'], correct: 2 },
                { q: 'What is the speed of light?', a: ['299,792 km/s', '300,000 km/s', '299,000 km/s', '298,792 km/s'], correct: 0 },
                { q: 'Who wrote "1984"?', a: ['Orwell', 'Huxley', 'Bradbury', 'Asimov'], correct: 0 },
                { q: 'What is the Planck constant?', a: ['6.626×10⁻³⁴', '6.626×10⁻³³', '6.626×10⁻³⁵', '6.626×10⁻³²'], correct: 0 },
                { q: 'What year was JavaScript created?', a: ['1993', '1994', '1995', '1996'], correct: 2 },
                { q: 'What is the atomic number of gold?', a: ['77', '78', '79', '80'], correct: 2 },
                { q: 'Who proved Fermat\'s Last Theorem?', a: ['Wiles', 'Perelman', 'Tao', 'Ramanujan'], correct: 0 },
                { q: 'What is the half-life of Carbon-14?', a: ['5,370 years', '5,730 years', '6,370 years', '6,730 years'], correct: 1 },
                { q: 'What is Avogadro\'s number?', a: ['6.022×10²³', '6.022×10²⁴', '6.022×10²²', '6.022×10²¹'], correct: 0 },
                { q: 'Who discovered penicillin?', a: ['Pasteur', 'Fleming', 'Koch', 'Jenner'], correct: 1 },
                { q: 'What is the Fibonacci sequence start?', a: ['0,1', '1,1', '1,2', '0,2'], correct: 0 },
                { q: 'What is the melting point of tungsten?', a: ['3,222°C', '3,322°C', '3,422°C', '3,522°C'], correct: 2 },
                { q: 'Who wrote "The Odyssey"?', a: ['Virgil', 'Homer', 'Sophocles', 'Euripides'], correct: 1 },
                { q: 'What is the square root of 144?', a: ['11', '12', '13', '14'], correct: 1 },
                { q: 'What year was the first iPhone released?', a: ['2005', '2006', '2007', '2008'], correct: 2 },
                { q: 'What is the capital of Kazakhstan?', a: ['Almaty', 'Astana', 'Nur-Sultan', 'Shymkent'], correct: 2 },
                { q: 'Who discovered radioactivity?', a: ['Curie', 'Becquerel', 'Rutherford', 'Roentgen'], correct: 1 },
                { q: 'What is the boiling point of water at sea level?', a: ['99°C', '100°C', '101°C', '102°C'], correct: 1 },
                { q: 'What is the largest known prime number (digits)?', a: ['22M', '23M', '24M', '25M'], correct: 2 },
                { q: 'Who invented the World Wide Web?', a: ['Gates', 'Jobs', 'Berners-Lee', 'Torvalds'], correct: 2 },
                { q: 'What is the distance to the moon?', a: ['384,400 km', '384,000 km', '385,000 km', '383,000 km'], correct: 0 },
                { q: 'What is the Heisenberg Uncertainty Principle about?', a: ['Energy', 'Position/Momentum', 'Time', 'Mass'], correct: 1 },
                { q: 'Who proved the incompleteness theorems?', a: ['Turing', 'Gödel', 'Church', 'Russell'], correct: 1 },
                { q: 'What is the gravitational constant?', a: ['6.674×10⁻¹¹', '6.674×10⁻¹⁰', '6.674×10⁻¹²', '6.674×10⁻⁹'], correct: 0 },
                { q: 'What year did the Byzantine Empire fall?', a: ['1451', '1452', '1453', '1454'], correct: 2 },
                { q: 'What is the Riemann Hypothesis about?', a: ['Primes', 'Geometry', 'Algebra', 'Calculus'], correct: 0 },
                { q: 'Who discovered DNA structure?', a: ['Watson & Crick', 'Franklin', 'Pauling', 'Wilkins'], correct: 0 },
                { q: 'What is the mass of an electron?', a: ['9.109×10⁻³¹ kg', '9.109×10⁻³⁰ kg', '9.109×10⁻³² kg', '9.109×10⁻²⁹ kg'], correct: 0 },
                { q: 'What is the oldest known programming language?', a: ['COBOL', 'Fortran', 'Lisp', 'Assembly'], correct: 1 },
                { q: 'What is the value of Euler\'s number e?', a: ['2.718', '2.817', '2.781', '2.871'], correct: 0 }
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
