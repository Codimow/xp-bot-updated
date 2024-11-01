// utils/logger.js
const fs = require('fs');
const path = require('path');

function getLogChannel(guild, client) {
    const logChannelsPath = path.join(__dirname, '..', 'data', 'logChannels.json');
    if (!fs.existsSync(logChannelsPath)) return null;

    const logChannels = JSON.parse(fs.readFileSync(logChannelsPath));
    const channelId = logChannels[guild.id];
    
    return channelId ? client.channels.cache.get(channelId) : null;
}

module.exports = { getLogChannel };