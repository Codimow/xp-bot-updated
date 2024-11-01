require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, Partials, Events } = require('discord.js');
const { supabaseClient } = require('./utils/supabaseClient');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ],
  presence: {
    status: 'online'
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isModalSubmit()) {
    const command = client.commands.get('application');
    if (command) {
      try {
        await command.handleModal(interaction);
      } catch (error) {
        console.error(error);
        if (!interaction.replied) {
          await interaction.reply({
            content: 'There was an error processing your application!',
            ephemeral: true
          });
        }
      }
    }
  }
});

const reactionHandler = require('./events/reactionHandler.js');

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  try {
    await reactionHandler.execute(reaction, user);
  } catch (error) {
    console.error('Error in reaction handler:', error);
  }
});

// Giveaway system setup
const { loadGiveaways, endGiveaway } = require('./commands/utility/giveaway.js');

// Initialize when bot is ready
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Load and process giveaways
  const giveaways = loadGiveaways();
  for (const [messageId, giveaway] of Object.entries(giveaways)) {
    if (!giveaway.ended) {
      const timeLeft = giveaway.endTime - Date.now();
      if (timeLeft > 0) {
        setTimeout(() => endGiveaway(messageId, client), timeLeft);
      } else {
        endGiveaway(messageId, client);
      }
    }
  }
});

// Handle invite updates for new guilds
client.on('guildCreate', async guild => {
  client.invites.set(guild.id, await cacheGuildInvites(guild));
});

// Handle invite creates
client.on('inviteCreate', async invite => {
  const guildInvites = client.invites.get(invite.guild.id) ?? new Collection();
  guildInvites.set(invite.code, {
    code: invite.code,
    uses: invite.uses,
    maxUses: invite.maxUses,
    inviter: invite.inviter?.id
  });
  client.invites.set(invite.guild.id, guildInvites);
  
  // Update stats in database
  await getOrCreateInviteStats(invite.guild.id);
});

// Handle invite deletes
client.on('inviteDelete', async invite => {
  const guildInvites = client.invites.get(invite.guild.id);
  if (guildInvites) {
    guildInvites.delete(invite.code);
    // Update stats in database
    await getOrCreateInviteStats(invite.guild.id);
  }
});

// Load event handlers
fs.readdirSync('./events').forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Initialize commands collection
client.commands = new Collection();

// Load commands from folders
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data.name === 'giveaway') {
      client.commands.set(command.data.name, { ...command, supabaseClient });
    } else {
      client.commands.set(command.data.name, command);
    }
  }
}

// Handle command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    if (command.supabaseClient) {
      await command.execute(interaction, command.supabaseClient);
    } else {
      await command.execute(interaction);
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ 
      content: 'There was an error while executing this command!', 
      ephemeral: true 
    });
  }
});

// Login with token
client.login(process.env.TOKEN);