const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('➕ Add a role to a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to add role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to add')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');
        
        await target.roles.add(role);
        await interaction.reply(`➕ Added role ${role.name} to ${target.user.tag}`);
    }
};
