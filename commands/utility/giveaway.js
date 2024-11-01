// commands/utility/giveaway.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Helper functions
function loadGiveaways() {
    try {
        const data = fs.readFileSync('./giveaways.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveGiveaways(data) {
    fs.writeFileSync('./giveaways.json', JSON.stringify(data, null, 2));
}

function parseTime(timeStr) {
    const regex = /^(\d+)([mhd])$/;
    const match = timeStr.match(regex);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
}

async function endGiveaway(messageId, client) {
    try {
        const giveaways = loadGiveaways();
        const giveaway = giveaways[messageId];
        
        if (!giveaway || giveaway.ended) return;

        const channel = await client.channels.fetch(giveaway.channelId);
        if (!channel) return;

        const message = await channel.messages.fetch(messageId);
        if (!message) return;

        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) return;

        await reaction.users.fetch();
        const users = reaction.users.cache.filter(user => !user.bot);

        // Pick winners
        const winners = [];
        const usersArray = Array.from(users.values());
        
        for (let i = 0; i < Math.min(giveaway.winnerCount, usersArray.length); i++) {
            const winnerIndex = Math.floor(Math.random() * usersArray.length);
            winners.push(usersArray.splice(winnerIndex, 1)[0]);
        }

        const winnerMentions = winners.map(w => w.toString()).join(', ') || 'No valid entries';

        const endEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY ENDED 🎉')
            .setDescription(`**${giveaway.prize}**\n\n` +
                `Winners: ${winnerMentions}\n\n` +
                `Hosted by: <@${giveaway.hostId}>`)
            .setColor('#FF1493')
            .setTimestamp();

        await message.edit({ embeds: [endEmbed] });
        
        if (winners.length > 0) {
            await channel.send({
                content: `Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`,
                allowedMentions: { users: winners.map(w => w.id) }
            });
        } else {
            await channel.send('No one entered the giveaway 😔');
        }

        giveaways[messageId].ended = true;
        saveGiveaways(giveaways);

    } catch (error) {
        console.error('Error ending giveaway:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option
                .setName('prize')
                .setDescription('What are you giving away?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('How long should the giveaway last? (e.g., 1h, 2d, 30m)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('winners')
                .setDescription('Number of winners')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Additional details about the giveaway')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const prize = interaction.options.getString('prize');
            const durationStr = interaction.options.getString('duration');
            const winnerCount = interaction.options.getInteger('winners');
            const description = interaction.options.getString('description') || 'React with 🎉 to enter!';

            const duration = parseTime(durationStr);
            if (!duration) {
                return await interaction.reply({
                    content: 'Invalid duration format! Use something like 1h, 2d, or 30m.',
                    ephemeral: true
                });
            }

            const endTime = Date.now() + duration;

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY 🎉')
                .setDescription(`**${prize}**\n\n${description}\n\n` +
                    `Winners: ${winnerCount}\n` +
                    `Ends: <t:${Math.floor(endTime / 1000)}:R>\n\n` +
                    `Hosted by: ${interaction.user}`)
                .setColor('#FF1493')
                .setTimestamp(endTime);

            await interaction.reply({ content: 'Creating giveaway...', ephemeral: true });

            const message = await interaction.channel.send({ embeds: [embed] });
            await message.react('🎉');

            // Save giveaway data
            const giveaways = loadGiveaways();
            giveaways[message.id] = {
                prize,
                winnerCount,
                endTime,
                channelId: interaction.channel.id,
                guildId: interaction.guildId,
                ended: false,
                hostId: interaction.user.id
            };
            saveGiveaways(giveaways);

            // Set timeout to end giveaway
            setTimeout(() => endGiveaway(message.id, interaction.client), duration);

        } catch (error) {
            console.error('Error creating giveaway:', error);
            await interaction.reply({
                content: 'There was an error creating the giveaway!',
                ephemeral: true
            });
        }
    },

    // Add these methods to be accessible from index.js
    loadGiveaways,
    endGiveaway
};