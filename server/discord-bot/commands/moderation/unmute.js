import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            const embed = embedBuilder.error('Error', 'User not found in this server!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.isCommunicationDisabled()) {
            const embed = embedBuilder.warn('Notice', 'This user is not currently muted.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.timeout(null);
            const embed = embedBuilder.success(
                'Member Unmuted',
                `**${user.tag}** has been unmuted.`
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = embedBuilder.error('Error', 'Failed to unmute the user.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
