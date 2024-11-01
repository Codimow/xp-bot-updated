const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
    .setName('receipt')
    .setDescription('Generate a receipt')
    .addStringOption(option =>
       option.setName('designer')
        .setDescription('The designer\'s name')
        .setRequired(true))
    .addStringOption(option =>
       option.setName('customer')
        .setDescription('The customer\'s name')
        .setRequired(true))
    .addStringOption(option =>
       option.setName('type')
        .setDescription('The type of service or product')
        .setRequired(true))
    .addStringOption(option =>
       option.setName('payment')
        .setDescription('The payment amount')
        .setRequired(true))
    .addStringOption(option =>
       option.setName('image')
        .setDescription('URL of the image')
        .setRequired(false)),

    async execute(interaction) {
     const designer = interaction.options.getString('designer');
     const customer = interaction.options.getString('customer');
     const type = interaction.options.getString('type');
     const payment = interaction.options.getString('payment');
     const imageUrl = interaction.options.getString('image');

     const receiptEmbed = new EmbedBuilder()
      .setTitle('Receipt')
      .setDescription(`**Designer:** ${designer}\n**Customer:** ${customer}\n**Type:** ${type}\n**Payment:** ${payment}`)
      .setColor('#ff69b4')
      .setTimestamp();

     // Add image to embed if a URL is provided
     if (imageUrl) {
       receiptEmbed.setImage(imageUrl);
     }

     await interaction.reply({ embeds: [receiptEmbed] });
   }
};