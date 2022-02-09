const Discord = require('discord.js');
const cron = require('node-cron');
const { token, channels } = require('./config.json');
const { updateSubs } = require('./updateSubs');
const client = new Discord.Client({ intents: ['GUILDS'] });

const youtubeId = 'UCLlVS9RRl8nC2Yirs1YbrOg'; //TheTerrains Youtube Id

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });

    const subcountChannel = client.channels.cache.get(channels.subcount);
    updateSubs(subcountChannel, youtubeId);
    cron.schedule('0 */12 * * *', () => updateSubs(subcountChannel, youtubeId)); //Update subs every 12 hours
});

client.login(token);