import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete multiple messages at once')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);

            const embed = embedBuilder.success(
                'Messages Cleared',
                `Successfully deleted **${deleted.size}** message(s)!`
            );

            const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

            // Delete the confirmation message after 5 seconds
            setTimeout(() => reply.delete().catch(() => { }), 5000);
        } catch (error) {
            const embed = embedBuilder.error('Error', 'Failed to delete messages. Messages older than 14 days cannot be bulk deleted.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
