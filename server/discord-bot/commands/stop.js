import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';
import openclawManager from '../utils/openclawManager.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('🛑 Deactivate OpenClaw AI mode and return to normal bot'),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const username = interaction.user.username;

        logger.info(`${username} is deactivating OpenClaw mode`);

        // Check if user has an active session
        if (!openclawManager.hasActiveSession(userId)) {
            const embed = embedBuilder.custom(
                'ℹ️ No Active Session',
                'You don\'t have an active OpenClaw session.\n\n' +
                'Use `/zero` to activate OpenClaw mode.',
                '#FFB800'
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // End the session
        const result = await openclawManager.endSession(userId);

        if (result.success) {
            const embed = embedBuilder.custom(
                '✅ OpenClaw Deactivated',
                '**Normal bot mode restored!**\n\n' +
                '🤖 I\'m back to using my built-in chatbot\n' +
                '💬 You can still chat with me normally\n' +
                '🦞 Use `/zero` anytime to activate OpenClaw again',
                '#00FF88'
            )
                .setFooter({ text: 'EliteZero • Futuristic Bot' });

            await interaction.editReply({ embeds: [embed] });
            logger.success(`Deactivated OpenClaw mode for ${username}`);
        } else {
            const embed = embedBuilder.error(
                'Deactivation Failed',
                result.error || 'An unknown error occurred while deactivating OpenClaw mode.'
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
