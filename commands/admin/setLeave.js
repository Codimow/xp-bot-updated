// commands/admin/setLeave.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const supabase = require('../../utils/supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setleave')
    .setDescription('Set a leave message for members who leave')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The leave message (use {user} for username)')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel where leave messages will be sent')
        .setRequired(false)
    ),
  async execute(interaction) {
    const leaveMessage = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const guildId = interaction.guild.id;

    const { data, error } = await supabase
      .from('guild_settings')
      .upsert({ guild_id: guildId, leave_message: leaveMessage, leave_channel_id: channel.id });

    if (error) {
      console.error('Supabase error:', error);
      return interaction.reply({ content: 'Error setting leave message', ephemeral: true });
    }

    return interaction.reply({ content: 'Leave message set successfully!', ephemeral: true });
  },
};
