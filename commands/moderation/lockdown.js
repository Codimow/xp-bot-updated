const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('🔒 Lock down the current channel')
        .addBooleanOption(option =>
            option.setName('lock')
                .setDescription('true to lock, false to unlock')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const lock = interaction.options.getBoolean('lock');
        
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: !lock
        });
        
        await interaction.reply(`${lock ? '🔒 Channel locked' : '🔓 Channel unlocked'}`);
    }
};
