import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botDir = join(__dirname, 'server', 'discord-bot');

console.log('📦 Installing dependencies...');

// Install dependencies
const install = spawn('npm', ['install'], {
    cwd: botDir,
    stdio: 'inherit',
    shell: true
});

install.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }

    console.log('✅ Dependencies installed');
    console.log('🚀 Starting bot...');

    // Start the bot
    const bot = spawn('node', ['index.js'], {
        cwd: botDir,
        stdio: 'inherit',
        shell: true
    });

    bot.on('close', (code) => {
        console.log(`Bot exited with code ${code}`);
        process.exit(code);
    });
});
