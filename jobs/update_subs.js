const { apikey, channels } = require('../config.json');
const fetch = require('node-fetch');
const { getClient } = require("../index");

const youtubeId = 'UCLlVS9RRl8nC2Yirs1YbrOg'; //TheTerrains youtube ID

fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apikey}`)
    .then(response => {
        return response.json()
    }).then(async data => {
        const subs = parseInt(data["items"][0].statistics.subscriberCount).toLocaleString();

        const subchannel = getClient().channels.fetch(channels.subcount);
        subchannel.setName(`👀 Subscribers: ${subs}`);
    });