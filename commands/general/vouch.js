const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
 .setName('vouch')
 .setDescription('Vouch for a user')
 .addUserOption(option =>
      option.setName('user')
      .setDescription('The user to vouch for')
      .setRequired(true))
 .addStringOption(option =>
      option.setName('reason')
      .setDescription('The reason for vouching')
      .setRequired(true))
 .setDefaultPermission(false)
 .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const vouchEmbed = new EmbedBuilder()
   .setTitle('Vouch')
   .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}`)
   .setColor('#0099ff')
   .setTimestamp();

    await interaction.channel.send({
      embeds: [vouchEmbed]
    });

    interaction.editReply({
      content: 'Vouch sent!',
      ephemeral: true
    });
  }
};