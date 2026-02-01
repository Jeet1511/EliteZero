import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import openclawManager from '../utils/openclawManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('zero')
        .setDescription('🦞 Activate OpenClaw AI mode for advanced conversations')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Optional: Send an initial message to OpenClaw')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const username = interaction.user.username;
        const initialMessage = interaction.options.getString('message');

        logger.info(`${username} is activating OpenClaw mode`);

        // Create OpenClaw session
        const result = await openclawManager.createSession(userId, username);

        if (!result.success) {
            // Error creating session
            const errorEmbed = embedBuilder.error(
                '❌ OpenClaw Unavailable',
                result.error + '\n\n**Troubleshooting:**\n' +
                '1. Run `openclaw gateway start` (as Administrator)\n' +
                '2. Check status with `openclaw gateway status`\n' +
                '3. Verify gateway token in bot configuration'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Session created successfully
        if (result.existing) {
            const embed = embedBuilder.custom(
                '🦞 OpenClaw Already Active',
                'You already have an active OpenClaw session!\n\n' +
                'Just send me a message and I\'ll respond using OpenClaw AI.\n' +
                'Use `/stop` to deactivate OpenClaw mode.',
                '#00D9FF'
            ).setFooter({ text: 'Powered by OpenClaw' });

            await interaction.editReply({ embeds: [embed] });
        } else {
            const embed = embedBuilder.custom(
                '🦞 OpenClaw Mode Activated',
                '**Advanced AI mode is now active!**\n\n' +
                '✨ Your messages will now be processed by OpenClaw AI\n' +
                '🧠 I\'ll remember our conversation context\n' +
                '🎯 More intelligent and context-aware responses\n\n' +
                'Just send me a message to start chatting!\n' +
                'Use `/stop` to return to normal mode.',
                '#00D9FF'
            )
                .setFooter({ text: 'Powered by OpenClaw' })
                .setThumbnail('https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/logo.png');

            await interaction.editReply({ embeds: [embed] });
        }

        // If initial message provided, send it to OpenClaw
        if (initialMessage) {
            logger.debug(`Sending initial message to OpenClaw: ${initialMessage}`);

            const messageResult = await openclawManager.sendMessage(userId, initialMessage);

            if (messageResult.success) {
                const responseEmbed = embedBuilder.custom(
                    '🦞 OpenClaw',
                    messageResult.response,
                    '#B24BF3'
                )
                    .setAuthor({
                        name: username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setFooter({ text: 'Powered by OpenClaw' });

                await interaction.followUp({ embeds: [responseEmbed] });
            } else {
                const errorEmbed = embedBuilder.error(
                    'Message Failed',
                    messageResult.error
                );
                await interaction.followUp({ embeds: [errorEmbed] });
            }
        }
    },
};
