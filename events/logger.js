// events/logger.js
const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const fs = require('node:fs');

function getLogChannel(guild) {
    try {
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        if (!config[guild.id]) return null;
        return guild.channels.cache.get(config[guild.id].logChannel);
    } catch (err) {
        return null;
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // Member Join
        client.on('guildMemberAdd', async (member) => {
            const logChannel = getLogChannel(member.guild);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('👋 Member Joined')
                .setColor('#00FF00')
                .addFields([
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Account Created', value: member.user.createdAt.toDateString(), inline: true }
                ])
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        // Member Leave
        client.on('guildMemberRemove', async (member) => {
            const logChannel = getLogChannel(member.guild);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('👋 Member Left')
                .setColor('#FF9999')
                .addFields([
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Joined At', value: member.joinedAt.toDateString(), inline: true }
                ])
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        // Member Ban
        client.on('guildBanAdd', async (ban) => {
            const logChannel = getLogChannel(ban.guild);
            if (!logChannel) return;

            try {
                const auditLogs = await ban.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberBan,
                    limit: 1
                });
                const banLog = auditLogs.entries.first();
                
                const embed = new EmbedBuilder()
                    .setTitle('🔨 Member Banned')
                    .setColor('#FF0000')
                    .addFields([
                        { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                        { name: 'Reason', value: ban.reason || 'No reason provided', inline: true },
                        { name: 'Banned By', value: banLog ? banLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in ban log:', error);
            }
        });

        // Role Create
        client.on('roleCreate', async (role) => {
            const logChannel = getLogChannel(role.guild);
            if (!logChannel) return;

            try {
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleCreate,
                    limit: 1
                });
                const roleLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('📝 Role Created')
                    .setColor('#00FF00')
                    .addFields([
                        { name: 'Role Name', value: role.name, inline: true },
                        { name: 'Role ID', value: role.id, inline: true },
                        { name: 'Created By', value: roleLog ? roleLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in role create log:', error);
            }
        });

        // Role Delete
        client.on('roleDelete', async (role) => {
            const logChannel = getLogChannel(role.guild);
            if (!logChannel) return;

            try {
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleDelete,
                    limit: 1
                });
                const roleLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Role Deleted')
                    .setColor('#FF0000')
                    .addFields([
                        { name: 'Role Name', value: role.name, inline: true },
                        { name: 'Role ID', value: role.id, inline: true },
                        { name: 'Deleted By', value: roleLog ? roleLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in role delete log:', error);
            }
        });

        // Role Update
        client.on('roleUpdate', async (oldRole, newRole) => {
            const logChannel = getLogChannel(oldRole.guild);
            if (!logChannel) return;

            try {
                const changes = [];
                if (oldRole.name !== newRole.name) {
                    changes.push(`Name: ${oldRole.name} → ${newRole.name}`);
                }
                if (oldRole.color !== newRole.color) {
                    changes.push(`Color: ${oldRole.hexColor} → ${newRole.hexColor}`);
                }
                if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                    changes.push('Permissions were updated');
                }

                if (changes.length === 0) return;

                const auditLogs = await oldRole.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleUpdate,
                    limit: 1
                });
                const roleLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('📝 Role Updated')
                    .setColor('#FFA500')
                    .addFields([
                        { name: 'Role', value: newRole.name, inline: true },
                        { name: 'Changes', value: changes.join('\n'), inline: false },
                        { name: 'Updated By', value: roleLog ? roleLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in role update log:', error);
            }
        });

        // Channel Create
        client.on('channelCreate', async (channel) => {
            if (!channel.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;

            try {
                const auditLogs = await channel.guild.fetchAuditLogs({
                    type: AuditLogEvent.ChannelCreate,
                    limit: 1
                });
                const channelLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('📝 Channel Created')
                    .setColor('#00FF00')
                    .addFields([
                        { name: 'Channel Name', value: `${channel.name} (<#${channel.id}>)`, inline: true },
                        { name: 'Channel Type', value: channel.type.toString(), inline: true },
                        { name: 'Created By', value: channelLog ? channelLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in channel create log:', error);
            }
        });

        // Channel Delete
        client.on('channelDelete', async (channel) => {
            if (!channel.guild) return;
            const logChannel = getLogChannel(channel.guild);
            if (!logChannel) return;

            try {
                const auditLogs = await channel.guild.fetchAuditLogs({
                    type: AuditLogEvent.ChannelDelete,
                    limit: 1
                });
                const channelLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Channel Deleted')
                    .setColor('#FF0000')
                    .addFields([
                        { name: 'Channel Name', value: channel.name, inline: true },
                        { name: 'Channel Type', value: channel.type.toString(), inline: true },
                        { name: 'Deleted By', value: channelLog ? channelLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in channel delete log:', error);
            }
        });

        // Channel Update
        client.on('channelUpdate', async (oldChannel, newChannel) => {
            if (!oldChannel.guild) return;
            const logChannel = getLogChannel(oldChannel.guild);
            if (!logChannel) return;

            try {
                const changes = [];
                if (oldChannel.name !== newChannel.name) {
                    changes.push(`Name: ${oldChannel.name} → ${newChannel.name}`);
                }
                if (oldChannel.type !== newChannel.type) {
                    changes.push(`Type: ${oldChannel.type} → ${newChannel.type}`);
                }
                if (oldChannel.topic !== newChannel.topic) {
                    changes.push(`Topic: ${oldChannel.topic || 'None'} → ${newChannel.topic || 'None'}`);
                }

                if (changes.length === 0) return;

                const auditLogs = await oldChannel.guild.fetchAuditLogs({
                    type: AuditLogEvent.ChannelUpdate,
                    limit: 1
                });
                const channelLog = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                    .setTitle('📝 Channel Updated')
                    .setColor('#FFA500')
                    .addFields([
                        { name: 'Channel', value: `${newChannel.name} (<#${newChannel.id}>)`, inline: true },
                        { name: 'Changes', value: changes.join('\n'), inline: false },
                        { name: 'Updated By', value: channelLog ? channelLog.executor.tag : 'Unknown', inline: true }
                    ])
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in channel update log:', error);
            }
        });

        console.log('✅ Logger events initialized');
    }
};