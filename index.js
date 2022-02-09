const Discord = require('discord.js');
const cron = require('node-cron');
const config = require('./config.json');

const { updateSubcount } = require('./updateSubs');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });

    const subcountChannel = client.channels.cache.get(config.channels.subcount);
    updateSubcount(subcountChannel, config.youtubeId);
    cron.schedule('0 */12 * * *', () => updateSubcount(subcountChannel, config.youtubeId)); //Update subs every 12 hours
});

client.login(config.token);