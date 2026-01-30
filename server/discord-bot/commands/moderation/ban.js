import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        if (member && !member.bannable) {
            const embed = embedBuilder.error('Error', 'I cannot ban this user! They may have higher permissions.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(user, { reason });
            const embed = embedBuilder.success(
                'Member Banned',
                `**${user.tag}** has been banned from the server.\n**Reason:** ${reason}`
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = embedBuilder.error('Error', 'Failed to ban the user.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
