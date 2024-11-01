const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands'),
  async execute(interaction) {
    try {
      // Defer the reply 
      await interaction.deferReply({ ephemeral: true });

      // Predefined command categories
      const categories = {
        'Utility': [
          'reactionrole: Add a reaction role to a message',
          'setleave: Set a leave message for members who leave',
          'setwelcome: Sets a custom welcome message',
          'announce: Make an announcement to the server',
          'embed: Create a custom embed message',
          'help: Shows all available commands',
          'verify: Verify your YouTube subscription to XP Store',
          'giveaway: Start a giveaway',
          'stickymessage: Manage sticky messages in channels',
          'vouch: Vouch for a user',
          'receipt: Generate a receipt',
          'about: Learn more about XP Store'
        ],
        'Moderation': [
          'addrole: ➕ Add a role to a user',
          'ban: 🔨 Ban a user from the server',
          'kick: 👢 Kick a user from the server',
          'lockdown: 🔒 Lock down the current channel',
          'purge: 🧹 Delete multiple messages at once',
          'removerole: ➖ Remove a role from a user',
          'timeout: ⏰ Timeout a user'
        ],
        'Music/Voice': [
          'leave: Leave the voice channel',
          'play: Upload an audio file to play in the voice channel'
        ],
        'Support': [
          'ticket: Ticket management system'
        ],
        'Admin': [
          'presence: Sets the bot presence status (Admin only)'
        ],
        'Game/Misc': [
          'playerinfo: Get FiveM player information using CFX',
          'application: Application system'
        ]
      };

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('📖 Bot Commands')
        .setDescription('Here are all the available commands, organized by category:')
        .setColor('#00FF00')
        .setThumbnail('https://cdn.discordapp.com/icons/1275096433304801451/c2de013fea9fab521bde864abea9a3d0.png?size=512')
        .setFooter({ 
          text: 'Made by nexcoding', 
          iconURL: 'https://cdn.discordapp.com/icons/1275096433304801451/c2de013fea9fab521bde864abea9a3d0.png?size=512' 
        })
        .setTimestamp();

      // Add fields for each category
      Object.entries(categories).forEach(([categoryName, commands]) => {
        embed.addFields({
          name: `📋 ${categoryName} Commands`,
          value: commands.map(cmd => `**/${cmd}`).join('\n'),
          inline: false
        });
      });

      // Send the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ 
        content: 'There was an error fetching the commands!', 
        ephemeral: true 
      });
    }
  },
};