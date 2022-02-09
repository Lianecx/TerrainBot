const config = require(`./config.json`)
const Discord = require('discord.js');

function sendError(description){
    return new Discord.MessageEmbed().setColor(config.colors.error).setDescription(`${description}`).setAuthor({ iconURL: 'https://images-ext-2.discordapp.net/external/6HgbQ8ajjgJozMXg37BWe53K5YTN3YMVmWC93ioekY8/https/raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f6ab.png', name: "Error" })
}

module.exports = { sendError }