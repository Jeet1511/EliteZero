// Game Animation Helpers
// Provides visual effects and animations for action games

class GameAnimations {
    // Create a progress bar
    static createProgressBar(current, max, length = 10, fillChar = '█', emptyChar = '░') {
        const filled = Math.round((current / max) * length);
        const empty = length - filled;
        return fillChar.repeat(filled) + emptyChar.repeat(empty);
    }

    // Create a health bar with color
    static createHealthBar(hp, maxHp, length = 10) {
        const percentage = (hp / maxHp) * 100;
        const filled = Math.round((hp / maxHp) * length);
        const empty = length - filled;

        let fillChar = '🟩'; // Green
        if (percentage <= 25) fillChar = '🟥'; // Red
        else if (percentage <= 50) fillChar = '🟧'; // Orange
        else if (percentage <= 75) fillChar = '🟨'; // Yellow

        return fillChar.repeat(filled) + '⬜'.repeat(empty);
    }

    // Create a grid
    static createGrid(rows, cols, fillChar = '⬜') {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                grid[r][c] = fillChar;
            }
        }
        return grid;
    }

    // Update a grid cell
    static updateGridCell(grid, row, col, emoji) {
        if (grid[row] && grid[row][col] !== undefined) {
            grid[row][col] = emoji;
        }
    }

    // Convert grid to string
    static gridToString(grid) {
        return grid.map(row => row.join(' ')).join('\n');
    }

    // Explosion animation sequence
    static getExplosionFrames() {
        return ['💥', '💫', '✨', '⭐'];
    }

    // Hit effect
    static getHitEffect() {
        return '💥';
    }

    // Miss effect
    static getMissEffect() {
        return '❌';
    }

    // Success effect
    static getSuccessEffect() {
        return '✅';
    }

    // Combo multiplier display
    static getComboDisplay(combo) {
        if (combo >= 5) return '🔥🔥🔥';
        if (combo >= 3) return '🔥🔥';
        if (combo >= 2) return '🔥';
        return '';
    }

    // Countdown animation
    static getCountdownEmoji(seconds) {
        const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
        return emojis[seconds] || '⏰';
    }

    // Rank display
    static getRankEmoji(rank) {
        const ranks = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return ranks[rank] || '🏅';
    }

    // Score animation (add sparkles for high scores)
    static formatScore(score, threshold = 100) {
        if (score >= threshold * 2) return `✨ ${score} ✨`;
        if (score >= threshold) return `⭐ ${score} ⭐`;
        return `${score}`;
    }

    // Create a timer display
    static formatTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Direction arrows
    static getDirectionArrow(direction) {
        const arrows = {
            left: '⬅️',
            right: '➡️',
            up: '⬆️',
            down: '⬇️',
            center: '⏺️'
        };
        return arrows[direction] || '❓';
    }

    // Attack animations
    static getAttackAnimation(type) {
        const animations = {
            sword: '⚔️',
            magic: '✨',
            fire: '🔥',
            ice: '❄️',
            lightning: '⚡',
            critical: '💥⚡💥'
        };
        return animations[type] || '👊';
    }

    // Defense animations
    static getDefenseAnimation(type) {
        const animations = {
            shield: '🛡️',
            dodge: '💨',
            block: '🚫',
            parry: '✨🛡️'
        };
        return animations[type] || '🛡️';
    }

    // Status effects
    static getStatusEffect(status) {
        const effects = {
            stunned: '😵',
            poisoned: '🤢',
            burning: '🔥',
            frozen: '🧊',
            blessed: '✨',
            cursed: '💀'
        };
        return effects[status] || '';
    }

    // Victory animation
    static getVictoryAnimation() {
        return '🎉🏆🎉';
    }

    // Defeat animation
    static getDefeatAnimation() {
        return '💀😔💀';
    }

    // Loading animation frames
    static getLoadingFrames() {
        return ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    }

    // Create a 3-lane runner display
    static createRunnerLanes(playerLane, obstacles) {
        const lanes = ['⬜', '⬜', '⬜'];
        lanes[playerLane] = '🏃';

        let display = lanes.join(' ') + '\n';

        // Add obstacle rows
        for (let i = 0; i < obstacles.length; i++) {
            const row = ['⬜', '⬜', '⬜'];
            if (obstacles[i] !== null) {
                row[obstacles[i]] = '🪨';
            }
            display += row.join(' ') + '\n';
        }

        return display;
    }

    // Create a whack-a-mole grid
    static createMoleGrid(molePositions, hitPositions) {
        const grid = this.createGrid(3, 3, '🕳️');

        // Add moles
        molePositions.forEach(pos => {
            const row = Math.floor(pos / 3);
            const col = pos % 3;
            grid[row][col] = '🦫';
        });

        // Add hit effects
        hitPositions.forEach(pos => {
            const row = Math.floor(pos / 3);
            const col = pos % 3;
            grid[row][col] = '💫';
        });

        return this.gridToString(grid);
    }

    // Create a battle display
    static createBattleDisplay(playerHp, playerMaxHp, enemyHp, enemyMaxHp) {
        const playerBar = this.createHealthBar(playerHp, playerMaxHp);
        const enemyBar = this.createHealthBar(enemyHp, enemyMaxHp);

        return `🛡️ **You** ${playerBar} ${playerHp}/${playerMaxHp}\n👹 **Enemy** ${enemyBar} ${enemyHp}/${enemyMaxHp}`;
    }

    // Random emoji selector for variety
    static getRandomTargetEmoji() {
        const targets = ['🎯', '🔴', '🟢', '🔵', '🟡', '🟣'];
        return targets[Math.floor(Math.random() * targets.length)];
    }

    static getRandomObstacleEmoji() {
        const obstacles = ['🪨', '🌵', '🚧', '🛑', '⚠️'];
        return obstacles[Math.floor(Math.random() * obstacles.length)];
    }
}

export default GameAnimations;
