const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Color mapping object
const COLORS = {
    RED: 0xFF0000,
    BLUE: 0x0000FF,
    GREEN: 0x00FF00,
    YELLOW: 0xFFFF00,
    PURPLE: 0x800080,
    BLACK: 0x000000,
    WHITE: 0xFFFFFF
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom embed message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('The title of the embed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('The main text of the embed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('The color of the embed')
                .setRequired(false)
                .addChoices(
                    { name: '🔴 Red', value: 'RED' },
                    { name: '🔵 Blue', value: 'BLUE' },
                    { name: '🟢 Green', value: 'GREEN' },
                    { name: '🟡 Yellow', value: 'YELLOW' },
                    { name: '🟣 Purple', value: 'PURPLE' },
                    { name: '⚫ Black', value: 'BLACK' },
                    { name: '⚪ White', value: 'WHITE' }
                )
        )
        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('URL of the image')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('thumbnail')
                .setDescription('URL of the thumbnail')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('footer')
                .setDescription('Footer text')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const color = interaction.options.getString('color') || 'BLUE';
            const image = interaction.options.getString('image');
            const thumbnail = interaction.options.getString('thumbnail');
            const footer = interaction.options.getString('footer');

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(COLORS[color] || COLORS['BLUE']) // Fallback to BLUE if color is invalid
                .setTimestamp();

            if (image) embed.setImage(image);
            if (thumbnail) embed.setThumbnail(thumbnail);
            if (footer) embed.setFooter({ text: footer });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error creating the embed!');
        }
    },
};
