const fetch = require('node-fetch');
const client = require("./index.js");

function getSubs(user, key){
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeUser}&key=${youtubeKey}`).then(response => { 
        return response.json() 
    }).then(data => { 
        let subCount = parseInt(data["items"][0].statistics.subscriberCount).toLocaleString();
        client.channels.cache.get("940328103455125565").setName(`👀 Subscribers: ${subCount}`);
    });
}

module.exports = {getSubs}
