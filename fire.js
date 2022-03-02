const channelsOnFire = [];
const expansionIntervals = new Map();

const msPerLevel = 60000;
const maxLevel = 5;

function startFire(channel) {
    channel.setName(`🔥${channel.name}🔥`, 'Start Fire');
    channel.setRateLimitPerUser(3, 'Start Fire'); //Slowmode

    channelsOnFire.push(channel);
    console.log(`Started fire in ${channel.name}`);
    startExpanding(channel);
}

function endFire(channel) {
    channel.setName(channel.name.replaceAll('🔥', ''), 'End Fire');
    channel.setRateLimitPerUser(0, 'End Fire');

    const index = channelsOnFire.findIndex(c => c.name === channel.name);
    if(!index) return console.log(`${channel.name} is not on fire`);

    channelsOnFire.splice(index, 1);
    console.log(`Ended fire in ${channel.name}`);
    endExpanding(channel);
}

function startExpanding(channel) {
    channel.setTopic('Fire Level: ' + '-'.repeat(maxLevel-1) + `\n${channel.topic}`, 'Fire Expansion');

    let currentLevel = 0;
    const interval = setInterval(() => {
        if(currentLevel >= maxLevel) { //Reached max level
            //Channel either above or below
            const randPosition = Math.random() * (channel.position+1 - channel.position-1) + channel.position-1;
            const randChannel = channel.guild.channels.cache.find(c => c.position === randPosition);
            startFire(randChannel);

            console.log(`Reached max level in ${channel.name}. Expanding to ${randChannel.name}`);
            return clearInterval(interval); //End expansion
        }

        channel.setTopic(channel.topic.replace('-', '🔥'), 'Fire Expansion');
        currentLevel++;
        console.log(`Expanded in ${channel.name} to level ${currentLevel}`);
    }, msPerLevel);
    expansionIntervals.set(channel.id, interval);

    console.log(`Started expansion in ${channel.name}`);
    return interval;
}

function endExpanding(channel) {
    const interval = expansionIntervals.get(channel.id);
    if(!interval) return console.log(`${channel.name} is not expanding`);

    channel.setTopic(channel.topic.replaceAll(/[-🔥\n]/, ''));
    clearInterval(interval);
    console.log(`Ended expansion in ${channel.name}`);
}

module.exports = { startFire, endFire };