const { SlashCommandBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('presence')
        .setDescription('Sets the bot presence status (Admin only)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of status to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Watching', value: 'WATCHING' },
                    { name: 'Playing', value: 'PLAYING' },
                    { name: 'Listening', value: 'LISTENING' },
                    { name: 'Competing', value: 'COMPETING' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You need Administrator permissions to use this command.',
                ephemeral: true
            });
        }

        try {
            const type = interaction.options.getString('type');
            const status = process.env.STATUS || 'Hello';

            // Convert string type to ActivityType enum
            const activityType = {
                'PLAYING': ActivityType.Playing,
                'WATCHING': ActivityType.Watching,
                'LISTENING': ActivityType.Listening,
                'COMPETING': ActivityType.Competing
            }[type];

            // Set both presence and activity
            await interaction.client.user.setPresence({
                activities: [{
                    name: status,
                    type: activityType
                }],
                status: 'online'
            });

            await interaction.reply({ 
                content: `Status updated to: ${type} ${status}`,
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error setting presence:', error);
            await interaction.reply({ 
                content: 'There was an error while setting the presence.',
                ephemeral: true 
            });
        }
    },
};