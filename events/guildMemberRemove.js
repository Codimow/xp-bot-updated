// events/guildMemberRemove.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getLogChannel(guild) {
    const logChannelsPath = path.join(__dirname, '..', 'data', 'logChannels.json');
    if (fs.existsSync(logChannelsPath)) {
        const logChannels = JSON.parse(fs.readFileSync(logChannelsPath, 'utf-8'));
        const channelId = logChannels[guild.id];
        return channelId ? guild.channels.cache.get(channelId) : null;
    }
    return null;
}

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const logChannel = getLogChannel(member.guild);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('👋 Member Left')
                .setColor(0xFF0000)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})` },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
                    { name: 'Member Count', value: `${member.guild.memberCount}` }
                )
                .setFooter({ 
                    text: 'Made by nexcoding', 
                    iconURL: 'https://cdn.discordapp.com/icons/1275096433304801451/c2de013fea9fab521bde864abea9a3d0.png?size=512' 
                })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberRemove:', error);
        }
    }
};