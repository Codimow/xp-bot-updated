// reactionHandler.js
const { Events } = require('discord.js');
const fs = require('fs');

function loadReactionRoles() {
    try {
        const data = fs.readFileSync('./reactionRoles.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading reaction roles:', error);
        return {};
    }
}

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        console.log('Reaction detected!');
        console.log('User:', user.tag);
        console.log('Emoji:', reaction.emoji.name);
        console.log('Message ID:', reaction.message.id);

        // Ignore bot reactions
        if (user.bot) {
            console.log('Ignoring bot reaction');
            return;
        }

        // If the reaction is partial, fetch it
        if (reaction.partial) {
            try {
                console.log('Fetching partial reaction...');
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        // Load reaction roles
        const reactionRoles = loadReactionRoles();
        console.log('Loaded reaction roles:', reactionRoles);

        const messageId = reaction.message.id;
        const roleConfigs = reactionRoles[messageId];

        if (!roleConfigs) {
            console.log('No role configurations found for this message');
            return;
        }

        console.log('Found role configs:', roleConfigs);

        // Check for both Unicode emoji and custom emoji
        const emojiIdentifier = reaction.emoji.id 
            ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
            : reaction.emoji.name;

        console.log('Looking for emoji:', emojiIdentifier);

        const config = roleConfigs.find(rc => rc.emoji === emojiIdentifier || rc.emoji === reaction.emoji.name);
        
        if (!config) {
            console.log('No matching emoji configuration found');
            return;
        }

        console.log('Found matching config:', config);

        try {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = await guild.roles.fetch(config.roleId);

            if (!role) {
                console.log('Role not found:', config.roleId);
                return;
            }

            console.log('Adding role:', role.name);
            await member.roles.add(role);
            console.log(`Successfully added role ${role.name} to user ${user.tag}`);

        } catch (error) {
            console.error('Error in role assignment:', error);
        }
    }
};