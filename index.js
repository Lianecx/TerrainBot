const Discord = require('discord.js');
const Bree = require('bree');
const { token } = require('./config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });

const bree = new Bree({
    jobs: [
        {
            name: 'update_subs',
            timeout: "1 second",
            interval: '1 day',
        },
    ],
});

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });
    bree.start();
});

client.login(token);

module.exports = { client };