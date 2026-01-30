import logger from '../utils/logger.js';
import embedBuilder from '../utils/embedBuilder.js';

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                logger.command(interaction.user.tag, `/${interaction.commandName}`);
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing ${interaction.commandName}: ${error.message}`);

                const errorEmbed = embedBuilder.error(
                    'Command Error',
                    'There was an error executing this command. Please try again later.'
                );

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }

        // Handle button interactions
        if (interaction.isButton()) {
            logger.debug(`Button interaction: ${interaction.customId}`);
            // Button handlers can be added here
        }

        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            logger.debug(`Select menu interaction: ${interaction.customId}`);
            // Select menu handlers can be added here
        }
    },
};
