const Discord = require('discord.js');
const cron = require('node-cron');
const config = require('./config.json');

const { updateSubs, subCount } = require('./updateSubs');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });

    const subcountChannel = client.channels.cache.get(config.channels.subcount);
    updateSubs(subcountChannel, config.youtubeId);
    cron.schedule('0 */12 * * *', () => updateSubs(subcountChannel, config.youtubeId)); //Update subs every 12 hours
});

client.on("messageCreate", async(message) => {
    if(message.content === "t!subcount") return message.reply({ embeds: [ new Discord.MessageEmbed().setTitle("TheTerrain's subscriber count").setDescription(`TheTerrain's current subscriber count is \`${await subCount(config.youtubeId)}\``).setColor("#f1c40f")]}); 
});

client.login(config.token);