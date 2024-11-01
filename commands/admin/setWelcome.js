const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Ensure these are set in your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Sets a custom welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The welcome message (use {user} for username)')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel where welcome messages will be sent')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const welcomeMessage = interaction.options.getString('message');
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const guildId = interaction.guild.id;

      const { data, error } = await supabase
        .from('guild_settings')
        .upsert({ guild_id: guildId, welcome_message: welcomeMessage, welcome_channel_id: channel.id });

      if (error) {
        console.error('Supabase error:', error);
        return interaction.reply({ content: 'Error setting welcome message', ephemeral: true });
      }

      return interaction.reply({ content: 'Welcome message set successfully!', ephemeral: true });
    } catch (err) {
      console.error('Unexpected error:', err);
      return interaction.reply({ content: 'An unexpected error occurred', ephemeral: true });
    }
  },
};