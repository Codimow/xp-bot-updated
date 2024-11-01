// commands/admin/createvc.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const activeChannels = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createvc')
    .setDescription('Create a voice channel with your name under a specified category')
    .addChannelOption(option =>
      option
        .setName('category')
        .setDescription('The category where the voice channel will be created')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    ),
  
  async execute(interaction) {
    const { options, member, guild } = interaction;
    const category = options.getChannel('category');
    const cooldown = 600000; // 10 minutes in milliseconds
    const lastUsed = activeChannels.get(member.id) || 0;

    // Check cooldown
    if (Date.now() - lastUsed < cooldown) {
      return interaction.reply({ content: 'You are on cooldown for this command. Please wait before trying again.', ephemeral: true });
    }

    // Update cooldown timer
    activeChannels.set(member.id, Date.now());

    // Create the voice channel
    const voiceChannel = await guild.channels.create({
      name: `${member.user.username}'s VC`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.Connect],
        },
        {
          id: member.id,
          allow: [PermissionFlagsBits.Connect],
        },
      ],
    });

    // Notify the user
    interaction.reply({ content: `Voice channel created: ${voiceChannel}`, ephemeral: true });

    // Automatic deletion if empty
    const deleteIfEmpty = async () => {
      if (voiceChannel.members.size === 0) {
        await voiceChannel.delete();
        activeChannels.delete(member.id);
      } else {
        setTimeout(deleteIfEmpty, 60000); // Check every minute
      }
    };

    setTimeout(deleteIfEmpty, 60000); // Start checking if empty
  },
};
