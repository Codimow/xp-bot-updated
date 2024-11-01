const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerinfo')
        .setDescription('Get FiveM player information using CFX')
        .addStringOption(option =>
            option.setName('cfx')
                .setDescription('The CFX server identifier (e.g., "abcd123")')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            let cfx = interaction.options.getString('cfx');
            
            // Remove common prefixes and clean the input
            cfx = cfx.replace('cfx.re/', '')
                    .replace('cfx.', '')
                    .replace('https://', '')
                    .replace('http://', '')
                    .trim();

            // Validate CFX format
            if (cfx.includes('.') || cfx.includes('/')) {
                await interaction.editReply({
                    content: '❌ Invalid CFX identifier format. Please use the server\'s CFX code (e.g., "abcd123") instead of a domain name or URL. You can find the CFX code in the server\'s connection information or FiveM server listing.',
                    embeds: []
                });
                return;
            }

            console.log(`Attempting to fetch info for server: ${cfx}`);

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://servers.fivem.net',
                'Referer': 'https://servers.fivem.net/',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            };

            const endpoints = [
                `https://servers-frontend.fivem.net/api/servers/single/${cfx}`,
                `https://servers.fivem.net/api/servers/single/${cfx}`,
                `https://servers-live.fivem.net/api/servers/single/${cfx}`
            ];

            let serverData = null;
            let lastError = null;
            let responseDetails = [];

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await axios.get(endpoint, {
                        headers,
                        timeout: 5000,
                        validateStatus: function (status) {
                            return status >= 200 && status < 500;
                        }
                    });

                    responseDetails.push({
                        endpoint,
                        status: response.status,
                        hasData: Boolean(response.data?.Data)
                    });

                    if (response.status === 200 && response.data && response.data.Data) {
                        serverData = response.data.Data;
                        break;
                    }
                } catch (e) {
                    lastError = e;
                    responseDetails.push({
                        endpoint,
                        error: e.message,
                        status: e.response?.status
                    });
                    continue;
                }
            }

            if (!serverData) {
                console.log('Response details:', responseDetails);
                throw lastError || new Error('Could not fetch server data from any endpoint');
            }

            // Rest of your existing code for creating and sending the embed
            // ... (keeping the existing embed creation and player listing code)

        } catch (error) {
            console.error('Detailed error information:', {
                message: error.message,
                code: error.code,
                response: error.response?.status,
                data: error.response?.data,
            });
            
            let errorMessage = 'An error occurred while fetching server information.';
            
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    errorMessage = '⏱️ Request timed out. The server might be offline.';
                } else if (error.response) {
                    switch (error.response.status) {
                        case 403:
                            errorMessage = '🔒 Server information is currently restricted. Please try again later.';
                            break;
                        case 404:
                            errorMessage = '❌ Server not found. Please verify the CFX identifier. Remember to use the server\'s CFX code (e.g., "abcd123"), not the domain name.';
                            break;
                        case 429:
                            errorMessage = '⌛ Rate limited. Please try again in a few minutes.';
                            break;
                        case 500:
                            errorMessage = '🔧 FiveM API server error. Please try again later.';
                            break;
                        default:
                            errorMessage = `❌ Unable to fetch server information (Status: ${error.response.status}). Error: ${error.response.data?.error || error.message}`;
                    }
                } else if (error.request) {
                    errorMessage = `📡 Unable to reach the FiveM API. Error: ${error.code || error.message}`;
                }
            }
            
            await interaction.editReply({ 
                content: errorMessage,
                embeds: []
            });
        }
    },
};