const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Learn more about XP Store')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the about message to')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const aboutEmbed = new EmbedBuilder()
      .setTitle('About Us – XP Store')
      .setAuthor({ name: 'XP Store', iconURL: 'https://yt3.googleusercontent.com/WVkV8Z-BXGnpAnSXawRDSvupHl68zbBnF1ll_ugObZ002n_4x-vezUvZxdd2brtHm5gevIbDAQ=s900-c-k-c0x00ffffff-no-rj' })
      .setDescription('Welcome to XP Store, your ultimate destination for premium digital services and creative solutions!')
      .addFields(
        { name: 'What We Offer', value: 'We provide a wide range of services, including:', inline: true },
        { name: 'Graphic Design', value: 'Custom logos, banners, and branding kits', inline: true },
        { name: 'Website Development', value: 'Responsive websites and online stores', inline: true },
        { name: 'Discord Bot Development', value: 'Custom bots, reaction roles, server setup, and moderation tools', inline: true },
        { name: 'FiveM Files & Custom Scripts', value: 'High-performance handling files and optimized mods', inline: true },
        { name: 'Microsoft Office Module', value: 'Full Microsoft Office suite licenses', inline: true }
      )
      .addFields(
        { name: 'Join Our Community', value: 'Connect with us on:', inline: true },
        { name: 'Discord', value: 'https://discord.gg/xpstorex', inline: true },
        { name: 'YouTube', value: 'https://www.youtube.com/@XPStore92', inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/attachments/1297972212627931247/1299000676629745848/Sequence01_2-ezgif.com-video-to-gif-converter.gif?ex=671e3f27&is=671ceda7&hm=1b9084c075e5db1d1d9c1754e631f59a715255901363eef33e62eae0e1e214bc&')
      .setColor('#ff69b4')
      .setTimestamp();

    try {
      if (channel) {
        // Send to specified channel and reply to interaction
        await channel.send({ embeds: [aboutEmbed] });
        await interaction.reply({ content: `About message sent to ${channel}!`, ephemeral: true });
      } else {
        // Reply directly to interaction
        await interaction.reply({ embeds: [aboutEmbed] });
      }
    } catch (error) {
      console.error(error);
      // Handle any errors that might occur
      await interaction.reply({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      });
    }
  }
};