import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import config from '../config.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REMINDERS_FILE = join(__dirname, '../data/reminders.json');

// In-memory storage for reminders
let reminders = [];
let reminderIntervals = new Map();

// Load reminders from file
async function loadReminders() {
    try {
        const data = await fs.readFile(REMINDERS_FILE, 'utf-8');
        reminders = JSON.parse(data);
    } catch (error) {
        reminders = [];
    }
}

// Save reminders to file
async function saveReminders() {
    try {
        await fs.mkdir(join(__dirname, '../data'), { recursive: true });
        await fs.writeFile(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
    } catch (error) {
        console.error('Failed to save reminders:', error);
    }
}

// Initialize reminders on bot start
loadReminders();

export default {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('⏰ Set a reminder for yourself')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new reminder')
                .addStringOption(option =>
                    option
                        .setName('time')
                        .setDescription('Time (e.g., 5m, 1h, 2d, or HH:MM)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('What to remind you about')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View your active reminders')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a reminder')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('Reminder ID to delete')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            await handleSetReminder(interaction);
        } else if (subcommand === 'list') {
            await handleListReminders(interaction);
        } else if (subcommand === 'delete') {
            await handleDeleteReminder(interaction);
        }
    },
};

async function handleSetReminder(interaction) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const userId = interaction.user.id;

    // Parse time
    const milliseconds = parseTime(timeStr);

    if (!milliseconds) {
        const embed = embedBuilder.error(
            'Invalid Time Format',
            'Please use formats like:\n' +
            '• `5m` - 5 minutes\n' +
            '• `1h` - 1 hour\n' +
            '• `2d` - 2 days\n' +
            '• `14:30` - Specific time today'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const remindAt = Date.now() + milliseconds;
    const reminderId = Date.now();

    const reminder = {
        id: reminderId,
        userId,
        channelId: interaction.channelId,
        message,
        remindAt,
        createdAt: Date.now()
    };

    reminders.push(reminder);
    await saveReminders();

    // Schedule the reminder
    scheduleReminder(interaction.client, reminder);

    const embed = embedBuilder.success(
        '⏰ Reminder Set!',
        `I'll remind you about:\n**${message}**\n\n` +
        `⏱️ Time: <t:${Math.floor(remindAt / 1000)}:R>\n` +
        `🆔 Reminder ID: \`${reminderId}\``
    );

    await interaction.reply({ embeds: [embed] });
}

async function handleListReminders(interaction) {
    const userId = interaction.user.id;
    const userReminders = reminders.filter(r => r.userId === userId);

    if (userReminders.length === 0) {
        const embed = embedBuilder.info(
            '⏰ No Active Reminders',
            'You don\'t have any active reminders.\nUse `/remind set` to create one!'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reminderList = userReminders
        .sort((a, b) => a.remindAt - b.remindAt)
        .map((r, index) => {
            const timeLeft = r.remindAt - Date.now();
            const timeStr = formatTimeLeft(timeLeft);
            return `**${index + 1}.** ${r.message}\n` +
                `⏱️ <t:${Math.floor(r.remindAt / 1000)}:R> (${timeStr})\n` +
                `🆔 ID: \`${r.id}\``;
        })
        .join('\n\n');

    const embed = embedBuilder.custom(
        '⏰ Your Active Reminders',
        reminderList,
        config.colors.primary
    ).setFooter({ text: `Total: ${userReminders.length} reminder(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleDeleteReminder(interaction) {
    const reminderId = interaction.options.getInteger('id');
    const userId = interaction.user.id;

    const index = reminders.findIndex(r => r.id === reminderId && r.userId === userId);

    if (index === -1) {
        const embed = embedBuilder.error(
            'Reminder Not Found',
            'Could not find a reminder with that ID.\nUse `/remind list` to see your active reminders.'
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reminder = reminders[index];
    reminders.splice(index, 1);
    await saveReminders();

    // Clear the scheduled timeout
    if (reminderIntervals.has(reminderId)) {
        clearTimeout(reminderIntervals.get(reminderId));
        reminderIntervals.delete(reminderId);
    }

    const embed = embedBuilder.success(
        '🗑️ Reminder Deleted',
        `Deleted reminder:\n**${reminder.message}**`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

function scheduleReminder(client, reminder) {
    const delay = reminder.remindAt - Date.now();

    if (delay <= 0) {
        // Reminder time has passed, remove it
        reminders = reminders.filter(r => r.id !== reminder.id);
        saveReminders();
        return;
    }

    const timeout = setTimeout(async () => {
        try {
            const channel = await client.channels.fetch(reminder.channelId);
            const user = await client.users.fetch(reminder.userId);

            const embed = embedBuilder.custom(
                '⏰ Reminder!',
                `<@${reminder.userId}>, you asked me to remind you:\n\n**${reminder.message}**`,
                config.colors.accent
            ).setFooter({ text: `Set ${formatTimeAgo(Date.now() - reminder.createdAt)} ago` });

            await channel.send({ content: `<@${reminder.userId}>`, embeds: [embed] });

            // Remove from reminders list
            reminders = reminders.filter(r => r.id !== reminder.id);
            await saveReminders();
            reminderIntervals.delete(reminder.id);
        } catch (error) {
            console.error('Failed to send reminder:', error);
        }
    }, delay);

    reminderIntervals.set(reminder.id, timeout);
}

// Parse time string to milliseconds
function parseTime(timeStr) {
    // Check for relative time (5m, 1h, 2d)
    const relativeMatch = timeStr.match(/^(\d+)([mhd])$/i);
    if (relativeMatch) {
        const value = parseInt(relativeMatch[1]);
        const unit = relativeMatch[2].toLowerCase();

        const multipliers = {
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };

        return value * multipliers[unit];
    }

    // Check for specific time (14:30)
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);

        if (hours > 23 || minutes > 59) return null;

        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);

        // If time has passed today, set for tomorrow
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }

        return target.getTime() - now.getTime();
    }

    return null;
}

function formatTimeLeft(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

function formatTimeAgo(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

// Export function to reschedule reminders on bot restart
export function rescheduleAllReminders(client) {
    loadReminders().then(() => {
        reminders.forEach(reminder => {
            scheduleReminder(client, reminder);
        });
    });
}
