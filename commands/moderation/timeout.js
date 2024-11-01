const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('⏰ Timeout a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Timeout duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        
        await target.timeout(minutes * 60 * 1000, reason);
        await interaction.reply(`⏰ Timed out ${target.user.tag} for ${minutes} minutes | Reason: ${reason}`);
    }
};
