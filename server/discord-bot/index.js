import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import http from 'http';
import logger from './utils/logger.js';

// Load environment variables
dotenvConfig();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Create commands collection
client.commands = new Collection();

// Function to recursively load commands from directories
async function loadCommands(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            // Recursively load commands from subdirectories
            await loadCommands(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const command = await import(`file://${fullPath}`);

            if ('data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
                logger.success(`Loaded command: ${command.default.data.name}`);
            } else {
                logger.warn(`Command at ${entry.name} is missing required "data" or "execute" property.`);
            }
        }
    }
}

// Load commands
const commandsPath = join(__dirname, 'commands');

logger.info(`Loading commands...`);

await loadCommands(commandsPath);

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

logger.info(`Loading ${eventFiles.length} events...`);

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(`file://${filePath}`);

    if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
        client.on(event.default.name, (...args) => event.default.execute(...args));
    }

    logger.success(`Loaded event: ${event.default.name}`);
}

// Error handling
process.on('unhandledRejection', error => {
    logger.error(`Unhandled promise rejection: ${error}`);
});

process.on('uncaughtException', error => {
    logger.error(`Uncaught exception: ${error}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Login to Discord
logger.info('Starting EliteZero bot...');

if (!process.env.DISCORD_TOKEN) {
    logger.error('DISCORD_TOKEN is not set in .env file!');
    logger.error('Please copy .env.example to .env and add your bot token.');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(error => {
    logger.error(`Failed to login: ${error.message}`);
    process.exit(1);
});

// Create HTTP server for Render.com health checks
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            bot: client.user ? client.user.tag : 'Starting...',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    logger.success(`Health check server running on port ${PORT}`);
});
