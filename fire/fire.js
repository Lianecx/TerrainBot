const Discord = require('discord.js');

const channelsOnFire = new Map();
const expansionIntervals = new Map();

const msPerLevel = 10000;
const maxLevel = 5;

async function startFire(channel) {
    channelsOnFire.set(channel.id, channel);

    await channel.setName(`🔥${channel.name}🔥`, 'Start Fire');
    if(channel instanceof Discord.TextChannel) await channel.setRateLimitPerUser(3, 'Start Fire'); //Slowmode

    console.log(`Started fire in ${channel.name}`);
    await startExpanding(channel);
}

async function endFire(channel) {
    if(!channelsOnFire.get(channel.id)) return console.log(`${channel.name} is not on fire`);

    await channel.setName(channel.name.replaceAll('🔥', ''), 'End Fire');
    if(channel instanceof Discord.TextChannel) await channel?.setRateLimitPerUser(0, 'End Fire'); //Slowmode

    channelsOnFire.delete(channel.id);
    console.log(`Ended fire in ${channel.name}`);
    await endExpanding(channel);
}

async function startExpanding(channel) {
    if(!channel instanceof Discord.TextChannel) {
        const randChannel = findNewChannel(channel);
        if(randChannel) await startFire(randChannel);
        console.log(`Skipping expansion in ${channel.name}`);
        return;
    }

    const thread = await channel.threads.create({
        name: 'Fire Level',
        reason: 'Start Fire Expansion',
    });

    const fireLevelEmbed = new Discord.MessageEmbed()
        .setTitle('Current Fire Level')
        .setDescription('⚪'.repeat(maxLevel))
        .setColor('DARK_RED');

    const fireLevel = await thread.send({ embeds: [fireLevelEmbed] });

    let currentLevel = 0;
    const interval = setInterval(async () => {
        if(currentLevel >= maxLevel) { //Reached max level
            const randChannel = findNewChannel(channel);
            if (randChannel) {
                console.log(`Reached max level in ${channel.name}. Expanding to ${randChannel.name}`);
                await startFire(randChannel);
            }

            return clearInterval(interval); //End expansion
        }

        fireLevelEmbed.setDescription(fireLevelEmbed.description.replace('⚪', '🔥'));
        await fireLevel.edit({ embeds: [fireLevelEmbed] });
        currentLevel++;
        console.log(`Expanded in ${channel.name} to level ${currentLevel}`);
    }, msPerLevel);
    expansionIntervals.set(channel.id, interval);

    console.log(`Started expansion in ${channel.name}`);
    return interval;
}

async function endExpanding(channel) {
    const interval = expansionIntervals.get(channel.id);
    if(!interval) return console.log(`${channel.name} is not expanding`);

    await channel.threads.cache.find(thread => thread.ownerId === channel.client.user.id).delete('End Fire Expansion');
    clearInterval(interval);
    console.log(`Ended expansion in ${channel.name}`);
}

function findNewChannel(channel) {
    const position = channel.rawPosition;
    let randPosition = Math.random() * (position+1 - position-1) + position-1;
    let randChannel = channel.guild.channels.cache.find(c => c.rawPosition === randPosition);

    if(!randChannel) {
        //If channel below doesnt exist, use channel above and likewise
        randPosition = randPosition === position-1 ? randPosition = position+1 : randPosition = position-1;
        randChannel = channel.guild.channels.cache.find(c => c.rawPosition === randPosition);
    }
    if(channelsOnFire.get(randChannel.id)) {
        //If new channel is on fire, find new channel
        return findNewChannel(randChannel);
    }

    if(channelsOnFire.get(randChannel.id)) return console.log('Could not find new channel to expand to.');

    return randChannel;
}

function endAllFires() {
    channelsOnFire.forEach(channel => endFire(channel));
}

module.exports = { startFire, endFire, endAllFires };