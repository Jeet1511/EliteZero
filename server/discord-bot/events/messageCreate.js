import chatbot from '../utils/chatbot.js';
import embedBuilder from '../utils/embedBuilder.js';
import logger from '../utils/logger.js';
import openclawManager from '../utils/openclawManager.js';

export default {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Check if bot is mentioned
        if (message.mentions.has(message.client.user)) {
            // Remove bot mention from message
            const userMessage = message.content
                .replace(/<@!?\d+>/g, '')
                .trim();

            if (!userMessage) {
                const embed = embedBuilder.info(
                    'Hey there! 👋',
                    'You mentioned me! How can I help you today?\n\nTry asking me something or use `/help` to see all my commands!'
                );
                return message.reply({ embeds: [embed] });
            }

            logger.debug(`Message from ${message.author.tag}: ${userMessage}`);

            // Show typing indicator
            await message.channel.sendTyping();

            // Check if user has OpenClaw mode enabled
            if (openclawManager.hasActiveSession(message.author.id)) {
                // Update activity tracking
                await openclawManager.sendMessage(message.author.id, userMessage);

                // Let OpenClaw handle the message natively via its Discord integration
                // OpenClaw will respond directly - we don't need to do anything
                logger.debug(`OpenClaw mode active for ${message.author.tag} - letting OpenClaw handle message`);

                // Don't reply here - OpenClaw will handle it
                return;
            } else {
                // Use built-in chatbot
                const response = chatbot.getResponse(userMessage, message.author.id);

                // Create response embed
                const embed = embedBuilder.custom(
                    '🤖 EliteZero',
                    response,
                    '#00D9FF' // Cyan color
                )
                    .setAuthor({
                        name: message.author.username,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setFooter({ text: 'EliteZero • Use /zero for advanced AI' });

                // Send response
                await message.reply({ embeds: [embed] });
            }
        }

        // Clean old chatbot contexts every 5 minutes
        if (Math.random() < 0.01) {
            chatbot.clearOldContexts();
        }
    },
};

