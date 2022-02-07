const Discord = require('discord.js');
const Bree = require('bree');
const { token } = require('./config.json');
const { updateSubs } = require("./jobs/update_subs");

const client = new Discord.Client({ intents: ['GUILDS'] });

const youtubeId = 'UCLlVS9RRl8nC2Yirs1YbrOg'; //TheTerrains youtube Id

const bree = new Bree({
    worker: {
        workerData: {
            client: client,
            youtubeId: youtubeId,
        },
    },
    jobs: [
        {
            name: 'update_subs',
            timeout: "1 seconds",
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

function getClient() {
    return client;
}
module.exports = { getClient };