const { apikey } = require('../config.json');
const fetch = require('node-fetch');

const youtubeId = 'UCLlVS9RRl8nC2Yirs1YbrOg'; //TheTerrains youtube ID

fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apikey}`)
    .then(response => {
        return response.json()
    }).then(data => {
        console.log(parseInt(data["items"][0].statistics.subscriberCount).toLocaleString());
    });