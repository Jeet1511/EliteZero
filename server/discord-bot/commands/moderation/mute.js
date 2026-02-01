import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) // Max 28 days
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for muting'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        // Protect server owner
        if (user.id === interaction.guild.ownerId) {
            const embed = embedBuilder.error('Error', '❌ Cannot mute the server owner! They have absolute power.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member) {
            const embed = embedBuilder.error('Error', 'User not found in this server!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.moderatable) {
            const embed = embedBuilder.error('Error', 'I cannot mute this user! They may have higher permissions.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);
            const embed = embedBuilder.success(
                'Member Muted',
                `**${user.tag}** has been muted for **${duration} minute(s)**.\n**Reason:** ${reason}`
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = embedBuilder.error('Error', 'Failed to mute the user.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
