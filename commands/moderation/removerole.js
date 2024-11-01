const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('➖ Remove a role from a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to remove role from')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to remove')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');
        
        await target.roles.remove(role);
        await interaction.reply(`➖ Removed role ${role.name} from ${target.user.tag}`);
    }
};
