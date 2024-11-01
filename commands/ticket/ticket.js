const { SlashCommandBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const dataPath = './data/data.json';

function saveConfig(guildId, config) {
    let data = {};
    if (fs.existsSync(dataPath)) {
        try {
            const fileData = fs.readFileSync(dataPath);
            data = JSON.parse(fileData);
        } catch (error) {
            console.error('Error reading data file:', error);
        }
    }
    data[guildId] = config;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function loadConfig(guildId) {
    if (!fs.existsSync(dataPath)) return null;
    try {
        const data = fs.readFileSync(dataPath);
        const parsedData = JSON.parse(data);
        return parsedData[guildId];
    } catch (error) {
        console.error('Error reading data file:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket management system')
        .addSubcommand(subcommand =>
            subcommand.setName('setup')
                .setDescription('Setup the ticket system')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Select category for tickets')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory))
                .addChannelOption(option =>
                    option.setName('logchannel')
                        .setDescription('Select log channel')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText))
                .addRoleOption(option =>
                    option.setName('supportrole')
                        .setDescription('Role that will manage tickets')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('sendpanel')
                .setDescription('Send the ticket creation panel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send the ticket panel')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand.setName('close')
                .setDescription('Close the current ticket'))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Delete the current ticket')),
    async execute(interaction) {
        const { guild, options, member } = interaction;
        const subcommand = options.getSubcommand();

        if (subcommand === 'setup') {
            const category = options.getChannel('category');
            const logChannel = options.getChannel('logchannel');
            const supportRole = options.getRole('supportrole');

            const config = {
                category: category.id,
                logChannel: logChannel.id,
                supportRole: supportRole.id,
            };

            saveConfig(guild.id, config);

            await interaction.reply({ content: 'Ticket system setup complete!', ephemeral: true });
        } else if (subcommand === 'sendpanel') {
            const channel = options.getChannel('channel');

            const embed = new EmbedBuilder()
                .setTitle('Create a Ticket')
                .setDescription('Click the button below to create a ticket')
                .setColor(Colors.Blue);

            const button = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Ticket creation panel has been sent!', ephemeral: true });
        } else if (subcommand === 'close') {
            const config = loadConfig(guild.id);
            if (!config) {
                return interaction.reply({ content: 'Configuration not found. Please run /ticket setup first.', ephemeral: true });
            }

            const ticketChannel = interaction.channel;
            const logChannel = guild.channels.cache.get(config.logChannel);

            if (!logChannel) {
                return interaction.reply({ content: 'Log channel not found. Please run /ticket setup first.', ephemeral: true });
            }

            await logChannel.send(`Ticket closed by ${member.user.username}: ${ticketChannel.name}`);
            await ticketChannel.setName(`closed-${ticketChannel.name}`);
            await ticketChannel.permissionOverwrites.edit(member, { ViewChannel: false });
            await interaction.reply({ content: 'Ticket closed and logged.', ephemeral: true });
        } else if (subcommand === 'delete') {
            const ticketChannel = interaction.channel;

            try {
                // Reply to interaction first to confirm deletion
                await interaction.reply({ content: 'Ticket will be deleted shortly.', ephemeral: true });

                // Then delete the ticket channel
                await ticketChannel.delete();
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
                await interaction.followUp({ content: 'Failed to delete ticket channel.', ephemeral: true });
            }
        }
    },
};
