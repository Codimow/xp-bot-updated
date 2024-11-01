const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblog')
        .setDescription('Log information about Rob')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Rob\'s name')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('member')
            .setDescription('Rob\'s member information')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('date')
            .setDescription('Date of the log')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('photos')
            .setDescription('Photos associated with the log')
            .setRequired(false))
        .addBooleanOption(option => 
            option.setName('c4')
            .setDescription('C4 Confirmation')
            .setRequired(false)),

    async execute(interaction) {
        // Retrieve the options
        const name = interaction.options.getString('name');
        const member = interaction.options.getString('member');
        const date = interaction.options.getString('date');
        const photos = interaction.options.getString('photos') || 'No photos';
        const c4 = interaction.options.getBoolean('c4') || false;

        // Create the log entry
        const logEntry = `
**Rob Log Entry**
**Name:** ${name}
**Member:** ${member}
**Date:** ${date}
**Photos:** ${photos}
**C4 Confirmation:** ${c4 ? 'Yes' : 'No'}
        `;

        // Reply to the interaction
        await interaction.reply({
            content: logEntry,
            ephemeral: false  // Set to true if you want only the command user to see it
        });

        // Optional: You might want to log this to a specific channel or database
        // For example:
        // await logChannel.send(logEntry);
    }
};