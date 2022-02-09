const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const youtube = require('../youtube');
const config = require('../config.json');

module.exports = {
    name: 'subcount',
    usage: 'subcount',
    example: 'subcount',
    description: 'Gets TheTerrain\'s current youtube subcount!',
    data: new SlashCommandBuilder()
            .setName('subcount')
            .setDescription('Gets TheTerrain\'s current youtube subcount!'),
    async execute(interaction, client) {
        await interaction.deferReply();

        console.log(`${interaction.member.user.tag} executed /subcount`);

        const subs = await youtube.getSubcount(config.youtubeId);

        const subEmbed = new Discord.MessageEmbed()
            .setTitle("TheTerrain's subscriber count")
            .setDescription(`TheTerrain's current subscriber count is ${subs / 1000}K`)
            .setColor("#f1c40f");

        interaction.reply({ embeds: [subEmbed] });
    }
}