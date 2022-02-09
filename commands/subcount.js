const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'subcount',
    usage: 'subcount',
    example: 'subcount',
    description: 'Gets TheTerrain\'s current youtube subcount!',
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping! Pong!')
            .setDefaultPermission(false),
    execute(interaction, args) {
        interaction.reply('Pong!');
    }
}