// events/messageCreate.js
const { Events, EmbedBuilder } = require('discord.js');
const { stickyMessages } = require('../utils/stickyMessages');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages and commands
        if (message.author.bot || message.content.startsWith('/')) return;

        // Check if channel has active sticky message
        const stickyData = stickyMessages.get(message.channel.id);
        if (!stickyData || !stickyData.isActive) return;

        // Send sticky message
        const embed = new EmbedBuilder()
            .setDescription(stickyData.content)
            .setColor('#2F3136')
            .setFooter({ text: '📌 Sticky Message' });

        await message.channel.send({ embeds: [embed] });
    }
};