const { SlashCommandBuilder } = require('@discordjs/builders');
const youtube = require('../youtube');
const { youtubeId } = require('../config.json');

module.exports = {
    name: 'subcount',
    usage: 'subcount',
    example: 'subcount',
    description: 'Gets TheTerrain\'s current youtube subcount!',
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping! Pong!'),
    async execute(interaction, client) {
        console.log(`${interaction.member.user.tag} executed /subcount`);

        const subs = await youtube.getSubcount(youtubeId);

        const subEmbed = new Discord.MessageEmbed()
            .setTitle("TheTerrain's subscriber count")
            .setDescription(`TheTerrain's current subscriber count is ${subs / 1000}K`)
            .setColor("#f1c40f")

        interaction.reply({ embeds: subEmbed });
    }
}