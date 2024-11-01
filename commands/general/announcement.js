const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
   .setName('announce')
   .setDescription('Make an announcement to the server')
   .addStringOption(option =>
      option.setName('message')
       .setDescription('The message to announce')
       .setRequired(true))
   .addChannelOption(option =>
      option.setName('channel')
       .setDescription('The channel to announce in')
       .setRequired(true))
   .setDefaultPermission(false)
   .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');

    if (!channel.permissionsFor(interaction.client.user).has('SEND_MESSAGES')) {
      return interaction.editReply({
        content: 'I don\'t have permission to send messages in that channel.',
        ephemeral: true
      });
    }

    const announcementEmbed = new EmbedBuilder()
     .setTitle('📢 Announcement 📢')
     .setDescription(message)
     .setColor('#0099ff')
     .setTimestamp();

    await channel.send({
      embeds: [announcementEmbed]
    });

    await interaction.editReply({
      content: 'Announcement sent! 📢',
      ephemeral: true
    });
  }
};