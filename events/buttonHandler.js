const { Events, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const dataPath = './data/data.json';

function loadConfig(guildId) {
    if (!fs.existsSync(dataPath)) return null;
    const data = JSON.parse(fs.readFileSync(dataPath));
    return data[guildId];
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('verify_approve_') || interaction.customId.startsWith('verify_deny_')) {
                const [action, type, userId] = interaction.customId.split('_');
                const member = await interaction.guild.members.fetch(userId).catch(() => {
                    return interaction.reply({ content: 'There was an error processing this verification.', ephemeral: true });
                });
                if (!member) return;
                const subscriberRole = interaction.guild.roles.cache.find(role => role.name === 'Subscriber');
                if (!subscriberRole) {
                    return interaction.reply({ content: 'There was an error processing this verification.', ephemeral: true });
                }
                if (type === 'approve') {
                    try {
                        await member.roles.add(subscriberRole);
                        await interaction.reply({ content: `Approved verification for ${member.user.tag}`, ephemeral: true });
                        await member.send('Your YouTube subscription verification has been approved! You now have the Subscriber role.').catch(() => {
                            console.error('Error sending direct message to member');
                        });
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'There was an error processing this verification.', ephemeral: true });
                    }
                } else if (type === 'deny') {
                    await interaction.reply({ content: `Denied verification for ${member.user.tag}`, ephemeral: true });
                    await member.send('Your YouTube subscription verification has been denied. Please make sure you are subscribed to XP Store and try again.').catch(() => {
                        console.error('Error sending direct message to member');
                    });
                }
            } else if (interaction.customId === 'create_ticket') {
                const { guild, member } = interaction;
                const config = loadConfig(guild.id);

                if (!config) {
                    return interaction.reply({ content: 'Configuration not found. Please run /ticket setup first.', ephemeral: true });
                }

                const category = guild.channels.cache.get(config.category);

                if (!category) {
                    return interaction.reply({ content: 'Ticket category not found. Please run /ticket setup first.', ephemeral: true });
                }

                const ticketChannel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: member.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: config.supportRole,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageMessages],
                        },
                    ],
                });

                await ticketChannel.send(`New support ticket from ${member.user.username}`);
                await interaction.reply({ content: 'Your support ticket has been created!', ephemeral: true });
            }
        }
    },
};
