const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const player = createAudioPlayer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Upload an audio file to play in the voice channel')
        .addAttachmentOption(option =>
            option.setName('audio')
                .setDescription('Upload an audio file to play')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Acknowledge the interaction immediately
        console.log('Interaction deferred'); // Debug log

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            console.log('User is not in a voice channel'); // Debug log
            return interaction.followUp('You need to be in a voice channel to play music!');
        }

        // Get the uploaded attachment
        const attachment = interaction.options.getAttachment('audio');

        if (!attachment) {
            return interaction.followUp('Please upload a valid audio file.');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        try {
            console.log('Playing audio file from URL:', attachment.url); // Debug log
            const resource = createAudioResource(attachment.url);
            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Playing, () => {
                console.log('Now playing:', attachment.url); // Debug log
                interaction.followUp(`Now playing: ${attachment.name}`);
            });

            player.on('error', error => {
                console.error('Audio Player Error:', error.message);
                interaction.followUp('There was an error playing the audio file.');
            });
        } catch (error) {
            console.error('Error accessing the audio file:', error);
            interaction.followUp('There was an error accessing the audio file.');
        }
    },
};