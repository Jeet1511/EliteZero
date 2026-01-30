import { REST, Routes } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import chalk from 'chalk';

// Load environment variables
dotenvConfig();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

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
                commands.push(command.default.data.toJSON());
                console.log(chalk.green(`✓ Loaded: ${command.default.data.name}`));
            } else {
                console.log(chalk.yellow(`⚠ Skipped: ${entry.name} (missing data or execute)`));
            }
        }
    }
}

// Load all command files
const commandsPath = join(__dirname, 'commands');

console.log(chalk.cyan('📦 Loading commands...'));

await loadCommands(commandsPath);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(chalk.cyan(`\n🚀 Started refreshing ${commands.length} application (/) commands.`));

        // Check if we should deploy globally or to a specific guild
        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for testing)
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );

            console.log(chalk.green(`\n✅ Successfully reloaded ${data.length} guild commands!`));
            console.log(chalk.gray(`   Guild ID: ${process.env.GUILD_ID}`));
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );

            console.log(chalk.green(`\n✅ Successfully reloaded ${data.length} global commands!`));
            console.log(chalk.yellow('   Note: Global commands may take up to 1 hour to update.'));
        }

        console.log(chalk.cyan('\n📋 Registered commands:'));
        commands.forEach(cmd => {
            console.log(chalk.gray(`   • /${cmd.name} - ${cmd.description}`));
        });

        console.log(chalk.green('\n✨ Deployment complete! You can now start the bot with: npm start\n'));

    } catch (error) {
        console.error(chalk.red('\n❌ Error deploying commands:'));
        console.error(chalk.red(error));

        if (error.code === 'TokenInvalid') {
            console.log(chalk.yellow('\n⚠ Your DISCORD_TOKEN is invalid. Please check your .env file.'));
        } else if (error.code === 50001) {
            console.log(chalk.yellow('\n⚠ Missing access. Make sure your bot has the applications.commands scope.'));
        }
    }
})();
