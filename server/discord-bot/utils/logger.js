import chalk from 'chalk';

// Logger utility with colored output
class Logger {
    constructor() {
        this.prefix = chalk.bold.cyan('[EliteZero]');
    }

    // Get timestamp
    getTimestamp() {
        const now = new Date();
        return chalk.gray(
            `[${now.getHours().toString().padStart(2, '0')}:${now
                .getMinutes()
                .toString()
                .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`
        );
    }

    // Info log (cyan)
    info(message) {
        console.log(`${this.getTimestamp()} ${this.prefix} ${chalk.cyan('ℹ')} ${message}`);
    }

    // Success log (green)
    success(message) {
        console.log(`${this.getTimestamp()} ${this.prefix} ${chalk.green('✓')} ${message}`);
    }

    // Warning log (yellow)
    warn(message) {
        console.log(`${this.getTimestamp()} ${this.prefix} ${chalk.yellow('⚠')} ${message}`);
    }

    // Error log (red)
    error(message) {
        console.log(`${this.getTimestamp()} ${this.prefix} ${chalk.red('✖')} ${message}`);
    }

    // Debug log (magenta)
    debug(message) {
        console.log(`${this.getTimestamp()} ${this.prefix} ${chalk.magenta('◆')} ${message}`);
    }

    // Command log (blue)
    command(user, command) {
        console.log(
            `${this.getTimestamp()} ${this.prefix} ${chalk.blue('⚡')} ${chalk.bold(
                user
            )} used ${chalk.bold(command)}`
        );
    }
}

export default new Logger();
