// Game Statistics Tracker
// Tracks player statistics across all games

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_FILE = path.join(__dirname, '../data/gameStats.json');

class GameStats {
    constructor() {
        this.stats = new Map(); // userId -> stats object
        this.loadStats();
    }

    // Load stats from file
    loadStats() {
        try {
            if (fs.existsSync(STATS_FILE)) {
                const data = fs.readFileSync(STATS_FILE, 'utf8');
                const parsed = JSON.parse(data);
                this.stats = new Map(Object.entries(parsed));
                console.log(`[GameStats] Loaded stats for ${this.stats.size} users`);
            } else {
                // Create data directory if it doesn't exist
                const dataDir = path.dirname(STATS_FILE);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
                console.log('[GameStats] No existing stats file, starting fresh');
            }
        } catch (error) {
            console.error('[GameStats] Error loading stats:', error);
            this.stats = new Map();
        }
    }

    // Save stats to file
    saveStats() {
        try {
            const dataDir = path.dirname(STATS_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            const data = Object.fromEntries(this.stats);
            fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('[GameStats] Error saving stats:', error);
        }
    }

    // Initialize or get user stats
    getUserStats(userId) {
        if (!this.stats.has(userId)) {
            this.stats.set(userId, {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                totalPoints: 0,
                achievementPoints: 0,
                gameStats: {
                    tictactoe: { played: 0, won: 0, lost: 0, draw: 0, points: 0 },
                    hangman: { played: 0, won: 0, lost: 0, points: 0 },
                    wordle: { played: 0, won: 0, lost: 0, avgAttempts: 0, points: 0 },
                    memory: { played: 0, won: 0, bestMoves: Infinity, points: 0 },
                    guess: { played: 0, won: 0, lost: 0, avgAttempts: 0, points: 0 },
                    trivia: { played: 0, totalScore: 0, bestScore: 0, points: 0 },
                    rps: { played: 0, won: 0, lost: 0, draw: 0, points: 0 },
                    connectfour: { played: 0, won: 0, lost: 0, draw: 0, points: 0 },
                    reaction: { played: 0, avgTime: 0, bestTime: Infinity, points: 0 },
                    quizbattle: { played: 0, totalScore: 0, bestScore: 0, points: 0 },
                    shooter: { played: 0, hits: 0, bestScore: 0, points: 0 }
                },
                achievements: [],
                lastPlayed: null,
                streak: 0,
                currentStreak: 0
            });
        }
        return this.stats.get(userId);
    }

    // Calculate points for a game result
    calculatePoints(gameType, result, extraData = {}) {
        let points = 0;

        switch (gameType) {
            case 'tictactoe':
                if (result === 'win') points = 10;
                else if (result === 'draw') points = 5;
                break;

            case 'hangman':
                if (result === 'win') points = 15;
                break;

            case 'wordle':
                if (result === 'win') {
                    points = 20;
                    // Bonus for fewer attempts
                    if (extraData.attempts <= 3) points += 10;
                    else if (extraData.attempts <= 4) points += 5;
                }
                break;

            case 'memory':
                points = 25;
                // Bonus for fewer moves
                if (extraData.moves <= 15) points += 15;
                else if (extraData.moves <= 20) points += 10;
                else if (extraData.moves <= 25) points += 5;
                break;

            case 'guess':
                if (result === 'win') {
                    points = 10;
                    // Bonus for fewer attempts
                    if (extraData.attempts <= 3) points += 10;
                    else if (extraData.attempts <= 5) points += 5;
                }
                break;

            case 'trivia':
                // 5 points per correct answer
                points = (extraData.score || 0) * 5;
                break;

            case 'rps':
                if (result === 'win') points = 8;
                else if (result === 'draw') points = 3;
                break;

            case 'connectfour':
                if (result === 'win') points = 12;
                else if (result === 'draw') points = 6;
                break;

            case 'reaction':
                points = 15;
                // Bonus for fast reaction times
                if (extraData.avgTime < 200) points += 15;
                else if (extraData.avgTime < 300) points += 10;
                else if (extraData.avgTime < 400) points += 5;
                break;

            case 'quizbattle':
                // 10 points per correct answer
                points = (extraData.score || 0) * 10;
                break;

            case 'shooter':
                // Score-based points for Target Shooter
                points = extraData.score || 0;
                break;
        }

        return points;
    }

    // Award points to a user
    awardPoints(userId, points, reason = 'game') {
        const stats = this.getUserStats(userId);
        if (reason === 'achievement') {
            stats.achievementPoints += points;
        }
        stats.totalPoints += points;
        return stats.totalPoints;
    }

    // Record game result
    recordGame(userId, gameType, result, extraData = {}) {
        const stats = this.getUserStats(userId);
        stats.totalGames++;
        stats.lastPlayed = Date.now();

        // Calculate and award points
        const points = this.calculatePoints(gameType, result, extraData);
        if (points > 0) {
            this.awardPoints(userId, points, 'game');
        }

        // Update game-specific stats
        const gameStats = stats.gameStats[gameType];
        if (gameStats) {
            gameStats.played++;
            gameStats.points += points;

            // Update streak
            if (result === 'win') {
                stats.currentStreak++;
                if (stats.currentStreak > stats.streak) {
                    stats.streak = stats.currentStreak;
                }
            } else if (result === 'loss') {
                stats.currentStreak = 0;
            }

            switch (gameType) {
                case 'tictactoe':
                case 'rps':
                case 'connectfour':
                    if (result === 'win') {
                        gameStats.won++;
                        stats.wins++;
                    } else if (result === 'loss') {
                        gameStats.lost++;
                        stats.losses++;
                    } else {
                        gameStats.draw++;
                        stats.draws++;
                    }
                    break;

                case 'hangman':
                case 'guess':
                    if (result === 'win') {
                        gameStats.won++;
                        stats.wins++;
                    } else {
                        gameStats.lost++;
                        stats.losses++;
                    }
                    if (gameType === 'guess' && extraData.attempts) {
                        gameStats.avgAttempts =
                            (gameStats.avgAttempts * (gameStats.played - 1) + extraData.attempts) / gameStats.played;
                    }
                    break;

                case 'wordle':
                    if (result === 'win') {
                        gameStats.won++;
                        stats.wins++;
                        if (extraData.attempts) {
                            gameStats.avgAttempts =
                                (gameStats.avgAttempts * (gameStats.won - 1) + extraData.attempts) / gameStats.won;
                        }
                    } else {
                        gameStats.lost++;
                        stats.losses++;
                    }
                    break;

                case 'memory':
                    gameStats.won++;
                    stats.wins++;
                    if (extraData.moves && extraData.moves < gameStats.bestMoves) {
                        gameStats.bestMoves = extraData.moves;
                    }
                    break;

                case 'trivia':
                    if (extraData.score !== undefined) {
                        gameStats.totalScore += extraData.score;
                        if (extraData.score > gameStats.bestScore) {
                            gameStats.bestScore = extraData.score;
                        }
                    }
                    break;

                case 'reaction':
                    if (extraData.avgTime) {
                        gameStats.avgTime = gameStats.avgTime === 0 ?
                            extraData.avgTime :
                            (gameStats.avgTime * (gameStats.played - 1) + extraData.avgTime) / gameStats.played;
                        if (extraData.bestTime < gameStats.bestTime) {
                            gameStats.bestTime = extraData.bestTime;
                        }
                    }
                    break;

                case 'quizbattle':
                    if (extraData.score !== undefined) {
                        gameStats.totalScore += extraData.score;
                        if (extraData.score > gameStats.bestScore) {
                            gameStats.bestScore = extraData.score;
                        }
                    }
                    break;

                case 'shooter':
                    gameStats.played++;
                    if (extraData.hits !== undefined) {
                        gameStats.hits += extraData.hits;
                    }
                    if (extraData.score !== undefined && extraData.score > gameStats.bestScore) {
                        gameStats.bestScore = extraData.score;
                    }
                    gameStats.points += points;
                    break;
            }
        }

        // Check for achievements
        const newAchievements = this.checkAchievements(userId);

        // Save stats to file
        this.saveStats();

        return { points, newAchievements };
    }

    // Achievement definitions with point rewards
    getAchievementInfo() {
        return {
            // Beginner Achievements
            first_steps: { name: 'First Steps', icon: '🎮', points: 5, desc: 'Play your first game' },
            quick_learner: { name: 'Quick Learner', icon: '🎯', points: 10, desc: 'Win your first game' },
            variety_player: { name: 'Variety Player', icon: '🎲', points: 20, desc: 'Play 3 different games' },

            // Veteran Achievements
            veteran: { name: 'Veteran', icon: '🏅', points: 25, desc: 'Play 10 total games' },
            winner: { name: 'Winner', icon: '🏆', points: 50, desc: 'Win 10 games' },
            entertainer: { name: 'Entertainer', icon: '🎪', points: 30, desc: 'Play 5 different games' },

            // Expert Achievements
            legend: { name: 'Legend', icon: '👑', points: 100, desc: 'Play 50 total games' },
            unstoppable: { name: 'Unstoppable', icon: '💪', points: 150, desc: 'Win 50 games' },
            champion: { name: 'Champion', icon: '🌟', points: 200, desc: 'Play 100 games' },

            // Game-Specific Achievements
            trivia_master: { name: 'Trivia Master', icon: '🧠', points: 75, desc: 'Get perfect score in trivia' },
            memory_genius: { name: 'Memory Genius', icon: '🧩', points: 100, desc: 'Complete memory under 15 moves' },
            speed_demon: { name: 'Speed Demon', icon: '⚡', points: 80, desc: 'Reaction time under 200ms average' },
            quiz_champion: { name: 'Quiz Champion', icon: '🏆', points: 60, desc: 'Win 5 quiz battles' },
            connect_four_pro: { name: 'Connect Four Pro', icon: '🔴', points: 70, desc: 'Win 10 Connect Four games' },
            wordle_wizard: { name: 'Wordle Wizard', icon: '📝', points: 90, desc: 'Win Wordle in 3 attempts' },
            hangman_hero: { name: 'Hangman Hero', icon: '🎭', points: 65, desc: 'Win 20 Hangman games' },
            tictactoe_expert: { name: 'Tic Tac Toe Expert', icon: '🎮', points: 55, desc: 'Win 15 Tic Tac Toe games' },
            rps_champion: { name: 'RPS Champion', icon: '✊', points: 45, desc: 'Win 20 RPS games' },
            number_master: { name: 'Number Master', icon: '🎲', points: 40, desc: 'Win Number Guess in 3 attempts' },

            // Ultimate Achievements
            perfect_streak: { name: 'Perfect Streak', icon: '🔥', points: 250, desc: 'Win 5 games in a row' },
            game_master: { name: 'Game Master', icon: '🎯', points: 500, desc: 'Play all 10 games at least once' },
            completionist: { name: 'Completionist', icon: '💎', points: 1000, desc: 'Unlock all other achievements' }
        };
    }

    // Check and award achievements
    checkAchievements(userId) {
        const stats = this.getUserStats(userId);
        const achievements = [];
        const achievementInfo = this.getAchievementInfo();

        // Beginner Achievements
        if (stats.totalGames === 1 && !stats.achievements.includes('first_steps')) {
            achievements.push('first_steps');
        }
        if (stats.wins === 1 && !stats.achievements.includes('quick_learner')) {
            achievements.push('quick_learner');
        }
        const gamesPlayed = Object.values(stats.gameStats).filter(g => g.played > 0).length;
        if (gamesPlayed >= 3 && !stats.achievements.includes('variety_player')) {
            achievements.push('variety_player');
        }

        // Veteran Achievements
        if (stats.totalGames >= 10 && !stats.achievements.includes('veteran')) {
            achievements.push('veteran');
        }
        if (stats.wins >= 10 && !stats.achievements.includes('winner')) {
            achievements.push('winner');
        }
        if (gamesPlayed >= 5 && !stats.achievements.includes('entertainer')) {
            achievements.push('entertainer');
        }

        // Expert Achievements
        if (stats.totalGames >= 50 && !stats.achievements.includes('legend')) {
            achievements.push('legend');
        }
        if (stats.wins >= 50 && !stats.achievements.includes('unstoppable')) {
            achievements.push('unstoppable');
        }
        if (stats.totalGames >= 100 && !stats.achievements.includes('champion')) {
            achievements.push('champion');
        }

        // Game-Specific Achievements
        if (stats.gameStats.trivia.bestScore === 5 && !stats.achievements.includes('trivia_master')) {
            achievements.push('trivia_master');
        }
        if (stats.gameStats.memory.bestMoves <= 15 && !stats.achievements.includes('memory_genius')) {
            achievements.push('memory_genius');
        }
        if (stats.gameStats.reaction.avgTime < 200 && stats.gameStats.reaction.avgTime > 0 && !stats.achievements.includes('speed_demon')) {
            achievements.push('speed_demon');
        }
        if (stats.gameStats.quizbattle.won >= 5 && !stats.achievements.includes('quiz_champion')) {
            achievements.push('quiz_champion');
        }
        if (stats.gameStats.connectfour.won >= 10 && !stats.achievements.includes('connect_four_pro')) {
            achievements.push('connect_four_pro');
        }
        if (stats.gameStats.wordle.avgAttempts <= 3 && stats.gameStats.wordle.won > 0 && !stats.achievements.includes('wordle_wizard')) {
            achievements.push('wordle_wizard');
        }
        if (stats.gameStats.hangman.won >= 20 && !stats.achievements.includes('hangman_hero')) {
            achievements.push('hangman_hero');
        }
        if (stats.gameStats.tictactoe.won >= 15 && !stats.achievements.includes('tictactoe_expert')) {
            achievements.push('tictactoe_expert');
        }
        if (stats.gameStats.rps.won >= 20 && !stats.achievements.includes('rps_champion')) {
            achievements.push('rps_champion');
        }
        if (stats.gameStats.guess.avgAttempts <= 3 && stats.gameStats.guess.won > 0 && !stats.achievements.includes('number_master')) {
            achievements.push('number_master');
        }

        // Ultimate Achievements
        if (stats.streak >= 5 && !stats.achievements.includes('perfect_streak')) {
            achievements.push('perfect_streak');
        }
        if (gamesPlayed >= 10 && !stats.achievements.includes('game_master')) {
            achievements.push('game_master');
        }
        // Completionist - all other achievements unlocked
        const totalAchievements = Object.keys(achievementInfo).length - 1; // Exclude completionist itself
        if (stats.achievements.length >= totalAchievements && !stats.achievements.includes('completionist')) {
            achievements.push('completionist');
        }

        // Add new achievements and award points
        achievements.forEach(achievement => {
            if (!stats.achievements.includes(achievement)) {
                stats.achievements.push(achievement);
                const info = achievementInfo[achievement];
                if (info && info.points) {
                    this.awardPoints(userId, info.points, 'achievement');
                }
            }
        });

        return achievements;
    }

    // Get leaderboard for a specific game
    getLeaderboard(gameType, limit = 10) {
        const leaderboard = [];

        for (const [userId, stats] of this.stats.entries()) {
            const gameStats = stats.gameStats[gameType];
            if (gameStats && gameStats.played > 0) {
                let score = 0;

                switch (gameType) {
                    case 'tictactoe':
                    case 'rps':
                        score = gameStats.won;
                        break;
                    case 'hangman':
                    case 'guess':
                    case 'wordle':
                        score = gameStats.won;
                        break;
                    case 'memory':
                        score = gameStats.bestMoves === Infinity ? 0 : 1000 - gameStats.bestMoves;
                        break;
                    case 'trivia':
                        score = gameStats.bestScore;
                        break;
                }

                leaderboard.push({
                    userId,
                    score,
                    played: gameStats.played,
                    stats: gameStats
                });
            }
        }

        return leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Get overall leaderboard
    getOverallLeaderboard(limit = 10) {
        const leaderboard = [];

        for (const [userId, stats] of this.stats.entries()) {
            if (stats.totalGames > 0) {
                const winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
                leaderboard.push({
                    userId,
                    totalGames: stats.totalGames,
                    wins: stats.wins,
                    winRate,
                    totalPoints: stats.totalPoints,
                    achievementPoints: stats.achievementPoints,
                    achievements: stats.achievements.length
                });
            }
        }

        return leaderboard
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, limit);
    }

    // Get total score for a user
    getTotalScore(userId) {
        const stats = this.getUserStats(userId);
        return stats.totalPoints;
    }

    // Get achievement points for a user
    getAchievementPoints(userId) {
        const stats = this.getUserStats(userId);
        return stats.achievementPoints;
    }
}

// Export singleton instance
const gameStats = new GameStats();
export default gameStats;
