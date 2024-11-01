const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (connection) {
            connection.destroy();
            await interaction.reply('Left the voice channel!');
        } else {
            await interaction.reply('I am not in a voice channel!');
        }
    },
};
