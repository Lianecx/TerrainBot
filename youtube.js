const fetch = require('node-fetch');
const { apikey } = require('./config.json');

async function updateSubcount(channel, youtubeId) {
    const subs = await getSubcount(youtubeId);
    if(!subs) return;

    channel.setName(`👀 Subscribers: ${subs / 1000}K`);
    console.log(`Updated sub count: ${subs / 1000}K`);
}

async function getSubcount(youtubeId) {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apikey}`)
        .catch(err => console.log('Could not fetch subscriber count', err));
    if(!resp) return;

    const data = await resp.json();
    if(!data.items) return console.log(`Invalid response value from the youtube api`);
    return data.items[0].statistics.subscriberCount;
}

module.exports = { updateSubcount, getSubcount };