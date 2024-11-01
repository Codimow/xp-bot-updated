// commands/utility/logchannel.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logchannel')
        .setDescription('Set the channel for server logs')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send logs to')
                .setRequired(true)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        // Load existing config
        let config = {};
        try {
            if (fs.existsSync('./config.json')) {
                const data = fs.readFileSync('./config.json', 'utf8');
                config = JSON.parse(data);
            }
        } catch (err) {
            console.error('Error reading config:', err);
            return interaction.reply({ content: 'There was an error setting up the log channel.', ephemeral: true });
        }

        // Update config
        config[guildId] = {
            logChannel: channel.id
        };

        // Save config
        try {
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
            await interaction.reply(`✅ Log channel successfully set to ${channel}`);
        } catch (err) {
            console.error('Error writing config:', err);
            await interaction.reply({ content: 'There was an error saving the log channel configuration.', ephemeral: true });
        }
    },
};