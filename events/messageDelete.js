// events/messageDelete.js
const { Events } = require('discord.js');
const { getLogChannel } = require('../utils/logger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.author?.bot) return;
        
        const logChannel = getLogChannel(message.guild, message.client);
        if (!logChannel) return;

        await logChannel.send({
            embeds: [{
                color: 0xff0000,
                title: 'Message Deleted',
                fields: [
                    { name: 'Author', value: `${message.author.tag} (${message.author.id})` },
                    { name: 'Channel', value: `${message.channel} (${message.channel.id})` },
                    { name: 'Content', value: message.content || 'No content' }
                ],
                timestamp: new Date()
            }]
        });
    },
};