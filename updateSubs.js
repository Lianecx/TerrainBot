const fetch = require('node-fetch');
const { apikey } = require('./config.json');

async function updateSubcount(channel, youtubeId) {
    const subs = getSubcount(youtubeId);

    channel.setName(`👀 Subscribers: ${subs / 1000}K`);
    console.log(`Updated sub count: ${subs / 1000}K`);
}

async function getSubcount(youtubeId) {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apikey}`);
    const data = await resp.json();

    return `${data['items'][0].statistics.subscriberCount / 1000}K`;
}

module.exports = { updateSubcount, getSubcount };