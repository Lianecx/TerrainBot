const fetch = require('node-fetch');
function getSubs(user, key){
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeUser}&key=${youtubeKey}`).then(response => { 
        return response.json() 
    }).then(data => { 
        console.log(parseInt(data["items"][0].statistics.subscriberCount).toLocaleString());
    });
}

module.exports = {getSubs}
