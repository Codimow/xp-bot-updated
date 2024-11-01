const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getInviter(member) {
    const invites = await member.guild.invites.fetch();
    // This is a simple example. You'll need to implement your own invite tracking system
    // as Discord doesn't provide direct way to get who invited a member
    const invite = invites.first();
    return invite ? invite.inviter : null;
}

function getAccountAge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    return `${years} years, ${months} months`;
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // Get inviter
            const inviter = await getInviter(member);
            const inviterName = inviter ? inviter.username : 'Unknown';

            // Welcome message functionality with new embed design
            const { data, error } = await supabase
                .from('guild_settings')
                .select('welcome_channel_id')
                .eq('guild_id', member.guild.id)
                .single();

            if (error || !data) return;

            const welcomeChannelId = data.welcome_channel_id;
            if (!welcomeChannelId) return;

            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            if (!welcomeChannel) return;

            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x2F3136) // Discord dark theme color
                .setDescription(`🎉 Welcome to our Server! 🎉\n\n@${member.user.username}\nYou are the ${member.guild.memberCount}th member of ${member.guild.name}!\nInvited by: ${inviterName}\nAccount Age: ${getAccountAge(member.user.createdAt)}`)
                .setImage('https://cdn.discordapp.com/attachments/1297972212627931247/1299000676629745848/Sequence01_2-ezgif.com-video-to-gif-converter.gif?ex=6724d6a7&is=67238527&hm=8423dc2d46b6ddf11ae0eee0a716cfbc975b21747ec1f50a961d83b91d76eea6&') // Replace with your XP-STORE graphics designer GIF
                .setFooter({ 
                    text: `Made by nexcoding • Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
                })
                .setTimestamp();

            await welcomeChannel.send({ embeds: [welcomeEmbed] });

        } catch (error) {
            console.error('Error in guildMemberAdd:', error);
        }
    }
};