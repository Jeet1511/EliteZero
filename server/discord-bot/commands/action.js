import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';

const actions = {
    hug: { emoji: '🤗', text: 'hugged', color: config.colors.accent },
    kiss: { emoji: '💋', text: 'kissed', color: config.colors.error },
    slap: { emoji: '👋', text: 'slapped', color: config.colors.warning },
    punch: { emoji: '👊', text: 'punched', color: config.colors.error },
    pat: { emoji: '👋', text: 'patted', color: config.colors.success },
    highfive: { emoji: '🙌', text: 'high-fived', color: config.colors.primary },
    wave: { emoji: '👋', text: 'waved at', color: config.colors.primary },
    dance: { emoji: '💃', text: 'danced with', color: config.colors.accent },
    cry: { emoji: '😢', text: 'cried with', color: config.colors.secondary },
    laugh: { emoji: '😂', text: 'laughed with', color: config.colors.success },
    poke: { emoji: '👉', text: 'poked', color: config.colors.primary },
    tickle: { emoji: '🤭', text: 'tickled', color: config.colors.accent },
    bonk: { emoji: '🔨', text: 'bonked', color: config.colors.warning },
    boop: { emoji: '👃', text: 'booped', color: config.colors.primary },
    cuddle: { emoji: '🫂', text: 'cuddled', color: config.colors.accent },
    bite: { emoji: '😬', text: 'bit', color: config.colors.error },
    feed: { emoji: '🍰', text: 'fed', color: config.colors.success },
    stare: { emoji: '👀', text: 'stared at', color: config.colors.secondary }
};

export default {
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('🎭 Perform an action with someone!')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Choose an action')
                .setRequired(true)
                .addChoices(
                    { name: '🤗 Hug', value: 'hug' },
                    { name: '💋 Kiss', value: 'kiss' },
                    { name: '👋 Slap', value: 'slap' },
                    { name: '👊 Punch', value: 'punch' },
                    { name: '👋 Pat', value: 'pat' },
                    { name: '🙌 High Five', value: 'highfive' },
                    { name: '👋 Wave', value: 'wave' },
                    { name: '💃 Dance', value: 'dance' },
                    { name: '😢 Cry', value: 'cry' },
                    { name: '😂 Laugh', value: 'laugh' },
                    { name: '👉 Poke', value: 'poke' },
                    { name: '🤭 Tickle', value: 'tickle' },
                    { name: '🔨 Bonk', value: 'bonk' },
                    { name: '👃 Boop', value: 'boop' },
                    { name: '🫂 Cuddle', value: 'cuddle' },
                    { name: '😬 Bite', value: 'bite' },
                    { name: '🍰 Feed', value: 'feed' },
                    { name: '👀 Stare', value: 'stare' }
                )
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to perform the action with')
                .setRequired(false)
        ),

    async execute(interaction) {
        const actionType = interaction.options.getString('type');
        const targetUser = interaction.options.getUser('user');
        const action = actions[actionType];

        if (!action) {
            return interaction.reply({ content: 'Invalid action!', ephemeral: true });
        }

        let description;
        if (targetUser) {
            if (targetUser.id === interaction.user.id) {
                description = `${action.emoji} **${interaction.user.username}** ${action.text} themselves!`;
            } else {
                description = `${action.emoji} **${interaction.user.username}** ${action.text} **${targetUser.username}**!`;
            }
        } else {
            description = `${action.emoji} **${interaction.user.username}** ${action.text} the air!`;
        }

        const embed = new EmbedBuilder()
            .setColor(action.color)
            .setDescription(description)
            .setFooter({ text: config.footer.text })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
