import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../../utils/embedBuilder.js';

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = embedBuilder.info(
            `User Info: ${user.tag}`,
            `**ID:** ${user.id}\n` +
            `**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n` +
            `**Joined Server:** ${member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A'}\n` +
            `**Roles:** ${member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(', ') || 'None' : 'N/A'}\n` +
            `**Bot:** ${user.bot ? 'Yes' : 'No'}`
        )
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));

        await interaction.reply({ embeds: [embed] });
    },
};
