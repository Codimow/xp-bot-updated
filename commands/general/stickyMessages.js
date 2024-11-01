const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { stickyMessages } = require('../../utils/stickyMessages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stickymessage')
        .setDescription('Manage sticky messages in channels')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a sticky message in a channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send the sticky message in')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The message to make sticky')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop the sticky message in a channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to remove the sticky message from')
                        .setRequired(true))),

    async execute(interaction) {
        // Check permissions
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return await interaction.reply({
                content: 'You need the Manage Messages permission to use this command!',
                ephemeral: true
            });
        }

        const subCommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if (subCommand === 'start') {
            const stickyMessage = interaction.options.getString('message');

            // Store the channel and message info
            stickyMessages.set(channel.id, {
                content: stickyMessage,
                isActive: true
            });

            // Send initial sticky message
            const embed = new EmbedBuilder()
                .setDescription(stickyMessage)
                .setColor('#2F3136')
                .setFooter({ text: '📌 Sticky Message' });

            await channel.send({ embeds: [embed] });
            
            await interaction.reply({
                content: `Sticky message activated in ${channel}`,
                ephemeral: true
            });

        } else if (subCommand === 'stop') {
            if (!stickyMessages.has(channel.id)) {
                return await interaction.reply({
                    content: 'No sticky message found in this channel.',
                    ephemeral: true
                });
            }

            // Deactivate sticky message
            stickyMessages.delete(channel.id);
            
            await interaction.reply({
                content: 'Sticky message deactivated.',
                ephemeral: true
            });
        }
    }
};