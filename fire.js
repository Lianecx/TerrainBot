const channelsOnFire = [];

function startFire(channel) {
    channel.setName(`🔥${channel.name}🔥`);
    channelsOnFire.push(channel);
    console.log(`Started fire in ${channel.name}`);
}

function endFire(channel) {
    channel.setName(channel.name.replaceAll('🔥', ''));
    const index = channelsOnFire.findIndex(c => c.name === channel.name);
    if(index) {
        channelsOnFire.splice(index, 1);
        console.log(`Ended fire in ${channel.name}`);
    } else console.log(`${channel.name} is not on fire`);
}

module.exports = { startFire, endFire };