const Discord = require('discord.js');

const channelsOnFire = new Map();
const expansionIntervals = new Map();

const msPerLevel = 2000;
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

function endAllFires() {
    channelsOnFire.forEach(channel => endFire(channel));
}

async function startExpanding(channel) {
    if(!(channel instanceof Discord.TextChannel)) {
        const randChannel = findNewChannel(channel);
        console.log(`Skipping expansion in ${channel.name}`);
        if(randChannel) return startFire(randChannel);
        return console.log('Did not find new channel to expand to');
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
            clearInterval(interval); //End Expansion

            const randChannel = findNewChannel(channel);
            if (randChannel) {
                console.log(`Reached max level in ${channel.name}. Expanding to ${randChannel.name}`);
                return startFire(randChannel);
            }

            return console.log('Could not find new channel to expand to'); //End expansion
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
    const sortedChannels = sortChannels(channel.guild);
    let index = sortedChannels.findIndex(id => id === channel.id);

    //index+1 or index-1
    let randIndex = Math.floor(Math.random() * (index+1 - index)) + index-1;

    console.log(randIndex, sortedChannels[randIndex])

    let randChannel = channel.guild.channels.cache.get(sortedChannels[randIndex]);
    if(!randChannel) {
        //If channel below doesnt exist, use channel above and likewise
        randIndex = randIndex === index-1 ? index+1 : index-1;
        randChannel = channel.guild.channels.cache.get(sortedChannels[randIndex]);
    }

    console.log(randIndex, sortedChannels[randIndex])
    console.log(channelsOnFire.get(randChannel.id));

    if(channelsOnFire.get(randChannel.id)) {
        //If new channel is already on fire, find new channel
        return findNewChannel(randChannel);
    }

    return randChannel;
}

//Sort channels in a guild by their position
function sortChannels(guild) {

    //Sorting by type (text over voice) and by position
    const descPos = (a, b) => {
        if (a.type === b.type) return a.position - b.position;
        else if (a.type === 'voice') return 1;
        else return -1;
    };

    const channels = new Discord.Collection();

    //Set No category/parent
    channels.set('__none', guild.channels.cache.filter(channel => !channel.parent && channel.type !== 'GUILD_CATEGORY').sort(descPos));

    //Set Categories with their children
    const categories = guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY').sort(descPos);
    categories.forEach(category => channels.set(category.id, category.children.sort(descPos)));

    const idList = [];
    //Loop over all categories
    for (let [categoryID, children] of channels) {
        const category = guild.channels.cache.get(categoryID);

        //Push category
        if (category) idList.push(category.id);

        //Loop over children of categories and push children
        for (let [, child] of children) idList.push(child.id);
    }

    return idList;
}

module.exports = { startFire, endFire, endAllFires };