// reactionRoleCommand.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

// Helper function to load reaction roles data
function loadReactionRoles() {
    try {
        const data = fs.readFileSync('./reactionRoles.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Helper function to save reaction roles data
function saveReactionRoles(data) {
    fs.writeFileSync('./reactionRoles.json', JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Add a reaction role to a message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addStringOption(option =>
            option
                .setName('message_id')
                .setDescription('The ID of the message to add the reaction to')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role to give when reacting')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('The emoji to react with')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the message is located')
                .setRequired(false)
        
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
        

    async execute(interaction) {
        try {
            const messageId = interaction.options.getString('message_id');
            const role = interaction.options.getRole('role');
            const emoji = interaction.options.getString('emoji');
            const channel = interaction.options.getChannel('channel') || interaction.channel;

            // Fetch the message
            const message = await channel.messages.fetch(messageId);
            if (!message) {
                return await interaction.reply({ 
                    content: 'Could not find that message!', 
                    ephemeral: true 
                });
            }

            // Add the reaction
            await message.react(emoji);

            // Save the reaction role configuration
            const reactionRoles = loadReactionRoles();
            if (!reactionRoles[messageId]) {
                reactionRoles[messageId] = [];
            }
            
            reactionRoles[messageId].push({
                emoji: emoji,
                roleId: role.id,
                channelId: channel.id,
                guildId: interaction.guildId
            });
            
            saveReactionRoles(reactionRoles);

            await interaction.reply({ 
                content: `✅ Successfully set up reaction role:\nMessage: ${messageId}\nEmoji: ${emoji}\nRole: ${role.name}`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error in reaction role command:', error);
            await interaction.reply({ 
                content: 'There was an error setting up the reaction role!', 
                ephemeral: true 
            });
        }
    },
    
};
