const { apikey, channels } = require('../config.json');
const fetch = require('node-fetch');
const { workerData } = require('worker_threads');

console.log(workerData.client)
fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apikey}`)
    .then(response => {
        return response.json()
    }).then(async data => {
    const subs = parseInt(data["items"][0].statistics.subscriberCount).toLocaleString();

    const subchannel = client.channels.cache.get(channels.subcount);
    subchannel.setName(`👀 Subscribers: ${subs}`);
});