// commands/admin/deletevc.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletevc')
    .setDescription('Force delete a specified voice channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The voice channel to delete')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admins only
  
  async execute(interaction) {
    const { options } = interaction;
    const targetChannel = options.getChannel('channel');

    if (targetChannel && targetChannel.deletable) {
      await targetChannel.delete();
      interaction.reply({ content: `Voice channel ${targetChannel.name} has been deleted.`, ephemeral: true });
    } else {
      interaction.reply({ content: 'Unable to delete the specified channel.', ephemeral: true });
    }
  },
};
