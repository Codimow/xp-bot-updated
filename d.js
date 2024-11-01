const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');

// Create commands directory if it doesn't exist
if (!fs.existsSync(foldersPath)) {
    fs.mkdirSync(foldersPath, { recursive: true });
    console.log('Created commands directory');
}

try {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory
        const commandsPath = path.join(foldersPath, folder);
        
        // Skip if it's not a directory
        if (!fs.statSync(commandsPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded command: ${command.data.name}`);
                } else {
                    console.log(`⚠️  [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                console.log(`❌ Error loading command from ${filePath}:`);
                console.error(error);
            }
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.TOKEN);

    // Guild-based command deployment
    (async () => {
        try {
            if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
                throw new Error('Missing required environment variables. Please check your .env file.');
            }

            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // Deploy commands to a specific guild (server)
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );

            console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error('❌ Could not deploy the commands:');
            console.error(error);
            process.exit(1);
        }
    })();

} catch (error) {
    console.error('❌ Error reading commands directory:');
    console.error(error);
    process.exit(1);
}