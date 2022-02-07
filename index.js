const Discord = require('discord.js');
const Bree = require('bree');
const { token, apikey } = require('./config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });

const bree = new Bree({
    jobs: [
        {
            name: 'update_subs',
            interval: '1 day'
        },
    ],
});

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });
    bree.start();
});

client.login(token);