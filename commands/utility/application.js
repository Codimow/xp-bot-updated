const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/applications.json');

if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}

let applicationData = {};
try {
    applicationData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
    fs.writeFileSync(dataPath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Application system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup a new application form')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the application')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('questions')
                        .setDescription('Enter questions separated by | (e.g.: Question 1|Question 2|Question 3)')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('active')
                        .setDescription('Enable or disable this application')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('apply')
                .setDescription('Submit an application')
                .addStringOption(option =>
                    option
                        .setName('application')
                        .setDescription('Select which application to fill')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),

    async autocomplete(interaction) {
        console.log('Autocomplete triggered');

        const focusedValue = interaction.options.getFocused();
        const guildData = applicationData[interaction.guildId] || {};

        console.log('Guild Data:', guildData);

        const choices = Object.entries(guildData)
            .filter(([_, data]) => data.active)
            .map(([name]) => ({ name: name, value: name }));

        console.log('Choices:', choices);

        const filtered = choices.filter(choice => 
            choice.name.toLowerCase().includes(focusedValue.toLowerCase())
        );

        console.log('Filtered Choices:', filtered);

        try {
            await interaction.respond(
                filtered.map(choice => ({ name: choice.name, value: choice.value }))
            );
        } catch (error) {
            console.error('Error responding to autocomplete:', error);
        }
    },

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true
                });
            }

            const name = interaction.options.getString('name');
            const questions = interaction.options.getString('questions').split('|').map(q => q.trim());
            const active = interaction.options.getBoolean('active');

            if (questions.length > 25) {
                return interaction.reply({
                    content: 'You can only have up to 25 questions due to Discord limitations.',
                    ephemeral: true
                });
            }

            if (!applicationData[interaction.guildId]) {
                applicationData[interaction.guildId] = {};
            }

            applicationData[interaction.guildId][name] = {
                questions,
                active,
                timestamp: Date.now()
            };

            fs.writeFileSync(dataPath, JSON.stringify(applicationData, null, 2));

            const embed = new EmbedBuilder()
                .setTitle('Application Setup Complete')
                .setColor('#00ff00')
                .setDescription(`Application "${name}" has been ${active ? 'enabled' : 'disabled'}`)
                .addFields(
                    questions.map((question, index) => ({
                        name: `Question ${index + 1}`,
                        value: question
                    }))
                );

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        if (interaction.options.getSubcommand() === 'apply') {
            const applicationName = interaction.options.getString('application');
            const guildData = applicationData[interaction.guildId];

            if (!guildData || !guildData[applicationName]) {
                return interaction.reply({
                    content: 'This application does not exist.',
                    ephemeral: true
                });
            }

            if (!guildData[applicationName].active) {
                return interaction.reply({
                    content: 'This application is currently closed.',
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`application-${applicationName}`)
                .setTitle(`${applicationName} Application`);

            const questions = guildData[applicationName].questions;
            const firstFiveQuestions = questions.slice(0, 5);

            const components = firstFiveQuestions.map((question, index) => {
                const actionRow = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`answer_${index}`)
                        .setLabel(question.length > 45 ? question.substring(0, 45) + '...' : question)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(1000)
                );
                return actionRow;
            });

            modal.addComponents(components);

            try {
                await interaction.showModal(modal);
            } catch (error) {
                console.error(error);
                return interaction.reply({
                    content: 'Failed to create application form. Please try again.',
                    ephemeral: true
                });
            }
        }
    },

    async handleModal(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (!interaction.customId.startsWith('application-')) return;

        const applicationName = interaction.customId.split('-')[1];
        const guildData = applicationData[interaction.guildId];

        if (!guildData || !guildData[applicationName]) {
            return interaction.reply({
                content: 'This application no longer exists.',
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.find(ch => ch.name === 'application-results');
        if (!channel) {
            return interaction.reply({
                content: 'The application results channel has not been set up properly.',
                ephemeral: true
            });
        }

        const questions = guildData[applicationName].questions;
        const answers = [];

        for (let i = 0; i < Math.min(questions.length, 5); i++) {
            answers.push(interaction.fields.getTextInputValue(`answer_${i}`));
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle(`New ${applicationName} Application`)
            .setColor('#00ff00')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`Submitted by: ${interaction.user.tag}`)
            .setTimestamp();

        for (let i = 0; i < Math.min(questions.length, 5); i++) {
            resultEmbed.addFields({
                name: questions[i],
                value: answers[i] || 'No answer provided'
            });
        }

        try {
            await channel.send({ embeds: [resultEmbed] });
            await interaction.reply({
                content: 'Your application has been submitted successfully!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error submitting your application. Please try again.',
                ephemeral: true
            });
        }
    }
};