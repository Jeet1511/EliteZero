import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            const embed = embedBuilder.error('Error', 'User not found in this server!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.kickable) {
            const embed = embedBuilder.error('Error', 'I cannot kick this user! They may have higher permissions.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.kick(reason);
            const embed = embedBuilder.success(
                'Member Kicked',
                `**${user.tag}** has been kicked from the server.\n**Reason:** ${reason}`
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = embedBuilder.error('Error', 'Failed to kick the user.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
