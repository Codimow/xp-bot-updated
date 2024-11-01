// verify.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
   .setName('verify')
   .setDescription('Verify your YouTube subscription to XP Store')
   .addAttachmentOption(option =>
      option.setName('screenshot')
       .setDescription('Upload a screenshot showing you are subscribed to XP Store')
       .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const screenshot = interaction.options.getAttachment('screenshot');
      if (!screenshot.contentType?.startsWith('image/')) {
        return interaction.editReply({
          content: 'Please provide a valid image screenshot.',
          ephemeral: true
        });
      }

      const subscriberRole = interaction.guild.roles.cache.find(role => role.name === 'Subscriber');
      if (!subscriberRole) {
        return interaction.editReply({
          content: 'The Subscriber role has not been set up. Please contact an administrator.',
          ephemeral: true
        });
      }

      if (interaction.member.roles.cache.has(subscriberRole.id)) {
        return interaction.editReply({
          content: 'You are already verified!',
          ephemeral: true
        });
      }

      const verifyEmbed = createVerifyEmbed(interaction, screenshot);
      const staffChannel = interaction.guild.channels.cache.find(channel => channel.name ==='verify-logs');
      if (staffChannel) {
        await staffChannel.send({
          embeds: [verifyEmbed],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Approve',
                  style: 3,
                  customId: `verify_approve_${interaction.user.id}`
                },
                {
                  type: 2,
                  label: 'Deny',
                  style: 4,
                  customId: `verify_deny_${interaction.user.id}`
                }
              ]
            }
          ]
        });
      }

      await interaction.editReply({
        content: 'Your verification request has been submitted! Please wait for staff to review it.',
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'There was an error while processing your verification request.',
        ephemeral: true
      });
    }
  }
};

function createVerifyEmbed(interaction, screenshot) {
  return new EmbedBuilder()
   .setTitle('New Verification Request')
   .setDescription(`User: ${interaction.user.tag}\nID: ${interaction.user.id}`)
   .setImage(screenshot.url)
   .setColor('#00ff00')
   .setTimestamp();
}