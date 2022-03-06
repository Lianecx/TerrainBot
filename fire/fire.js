const Discord = require('discord.js');
const fs = require('fs/promises');
const config = require('../config.json');

const fireChannels = new Map();
const expansionIntervals = new Map();
const waterLevels = new Map();
const fireLevels = new Map();
const fireThreads = new Map();
const leaderboard = new Discord.Collection();

//CONFIGURATION
const msPerLevel = 300000;
const maxLevel = 5;
const waterPerLevel = 60;
const slowmode = 3;

let logChannel;

async function startFire(channel) {
    fireChannels.set(channel.id, channel);

    await channel.setName(`🔥${channel.name}🔥`, 'Start Fire');
    if(channel instanceof Discord.TextChannel) await channel.setRateLimitPerUser(slowmode, 'Start Fire'); //Set slowmode

    sendLog(`Started fire in ${channel.name}`);
    await startExpanding(channel);
}

async function endFire(channel) {
    if(!fireChannels.get(channel.id)) return sendLog(`${channel.name} is not on fire`);

    await channel.setName(channel.name.replaceAll('🔥', ''), 'End Fire');
    if(channel instanceof Discord.TextChannel) await channel.setRateLimitPerUser(0, 'End Fire'); //Set 0 sec slowmode

    fireChannels.delete(channel.id);

    sendLog(`Ended fire in ${channel.name}`);
    await endExpanding(channel);
}

function endAllFires() {
    fireChannels.forEach(channel => endFire(channel));
    leaderboard.clear();
}


async function startExpanding(channel) {
    if(!(channel instanceof Discord.TextChannel)) {
        const randChannel = findNewChannel(channel);
        sendLog(`Skipping expansion in ${channel.name}`);
        if(randChannel) return startFire(randChannel);
        sendLog('Did not find new channel to expand to');
        return;
    }

    //If fire thread does not exist yet
    if(!fireThreads.get(channel.id)) {
        const startLevel = fireLevels.get(channel.id) ?? 1; //Start with fire level 1
        const fireLevelEmbed = new Discord.MessageEmbed()
            .setTitle('Current Fire Level')
            .setDescription('🔥'.repeat(startLevel) + '⚪'.repeat(maxLevel-startLevel))
            .setColor('DARK_RED');

        //Send embed and create thread
        const startMessage = await channel.send({ embeds: [fireLevelEmbed] });

        const thread = await channel.threads.create({
            startMessage,
            name: 'Fire Level',
            reason: 'Start Fire Expansion',
            rateLimitPerUser: 21600,
        });

        fireThreads.set(channel.id, thread);
    }

    const interval = setInterval(async () => {
        const currentLevel = fireLevels.get(channel.id) ?? 1;

        //Reached max level
        if(currentLevel >= maxLevel) {
            await expand(channel);
            return;
        }

        //Increase fire level
        await setFireLevel(channel, currentLevel+1);

    }, msPerLevel);

    expansionIntervals.set(channel.id, interval);

    saveData();
    sendLog(`Started expansion in ${channel.name}`);
}

async function endExpanding(channel) {
    if(!(channel instanceof Discord.TextChannel)) return sendLog(`Skipping expansion end in ${channel.name}`);

    //Delete Starter Message and Thread
    const thread = fireThreads.get(channel.id);
    const starterMessage = await thread.fetchStarterMessage();

    //Prevent more expansion
    const interval = expansionIntervals.get(channel.id);
    if(interval) {
        clearInterval(interval);
        expansionIntervals.delete(channel.id);
    }

    await starterMessage.delete();
    await thread.delete('End Fire Expansion');

    await channel.permissionOverwrites.edit(config.roles.Member, { SEND_MESSAGES: true }); //Unlock Channel

    fireLevels.delete(channel.id);
    waterLevels.delete(channel.id);
    fireThreads.delete(channel.id);

    saveData();
    sendLog(`Ended expansion in ${channel.name}`);
}


async function expand(channel) {
    clearInterval(expansionIntervals.get(channel.id)); //End Expanding in old channel
    expansionIntervals.delete(channel.id);

    await channel.permissionOverwrites.edit(config.roles.Member, { SEND_MESSAGES: false }); //Lock Channel

    const randChannel = findNewChannel(channel);
    if (randChannel) {
        sendLog(`Reached max level in ${channel.name}. Expanding to ${randChannel.name}`);
        return startFire(randChannel);
    }

    sendLog('Could not find new channel to expand to');
}


async function saveData() {
    const channels = [];
    let channel = {};

    fireChannels.forEach(c => {
        channel.id = c.id;
        channel.fire = fireLevels.get(c.id) ?? 1;
        channel.interval = !!expansionIntervals.get(c.id);
        if(fireThreads.get(c.id)) channel.thread = fireThreads.get(c.id).id;

        channels.push(channel);
        channel = {};
    });

    await fs.writeFile('./fire/channels.json', JSON.stringify(channels, null, 2), 'utf-8');
    sendLog('Saved channels');

    const users = [];
    let user = {};

    leaderboard.forEach((points, id) => {
        user.id = id;
        user.points = points;

        users.push(user);
        user = {};
    });

    await fs.writeFile('./fire/leaderboard.json', JSON.stringify(users, null, 2), 'utf-8');
    sendLog('Saved leaderboard');
}

async function loadData(guild) {
    const channels = JSON.parse(await fs.readFile('./fire/channels.json', 'utf-8'));

    for (const channel of channels) {
        fireChannels.set(channel.id, guild.channels.cache.get(channel.id));
        fireLevels.set(channel.id, channel.fire);
        if(channel.thread) fireThreads.set(channel.id, fireChannels.get(channel.id).threads.cache.get(channel.thread));
        if(channel.interval) await startExpanding(guild.channels.cache.get(channel.id));
    }

    sendLog('Loaded channels');

    const users = JSON.parse(await fs.readFile('./fire/leaderboard.json', 'utf-8'));
    users.forEach(user => leaderboard.set(user.id, user.points));

    sendLog('Loaded leaderboard');
}

function saveDataInterval(ms) {
    setInterval(saveData, ms);
}


async function addWater(user, channel) {
    //Increase waterLevels and add points to leaderboard
    let points = leaderboard.get(user.id) ?? 0;
    let channelWater = waterLevels.get(channel.id) ?? 0;
    channelWater++; points++;

    waterLevels.set(channel.id, channelWater);
    leaderboard.set(user.id, points);

    if(channelWater >= waterPerLevel) {
        waterLevels.set(channel.id, 0); //Reset waterLevels

        const fireLevel = await fireThreads.get(channel.id).fetchStarterMessage();
        let fireLevelEmbed = fireLevel.embeds[0];
        const description = fireLevelEmbed.description;

        const level = fireLevels.get(channel.id) ?? 0;
        if(level === 0) {
            //Put out fire
            fireLevelEmbed.setDescription('💦'.repeat(maxLevel));
            await fireLevel.edit({ embeds: [fireLevelEmbed] });
            setTimeout(() => endFire(channel), 1000);
            return;
        }

        //Replace last occurrence of 🔥 with 💦
        const lastIndex = description.lastIndexOf('🔥');
        fireLevelEmbed.setDescription(description.substring(0, lastIndex) + '💦' + description.substring(lastIndex + 1));

        await fireLevel.edit({ embeds: [fireLevelEmbed] });
        sendLog(`Added water to ${channel.name}`);

        //Reduce fire level after 1 second
        setTimeout(() => setFireLevel(channel, level-1), 1000);
    }
}


async function setFireLevel(channel, level) {
    if(!fireChannels.get(channel.id)) return sendLog('Channel is not on fire.');
    else if(isNaN(level)) return sendLog('Specified fire level is NaN');
    else if(level > maxLevel) return sendLog('Specified fire level is too big');
    else if(level < 0) return sendLog('Specified fire level is too small');

    fireLevels.set(channel.id, level);

    const fireLevel = await fireThreads.get(channel.id).fetchStarterMessage();
    const fireLevelEmbed = fireLevel.embeds[0].setDescription('🔥'.repeat(level) + '⚪'.repeat(maxLevel-level));

    fireLevel.edit({ embeds: [fireLevelEmbed] });

    saveData();
    sendLog(`Set fire level in ${channel.name} to ${level}`);
}


function findNewChannel(channel) {
    const sortedChannels = sortChannels(channel.guild);
    let index = sortedChannels.findIndex(id => id === channel.id);

    //index+1 or index-1
    let randIndex = Math.random() < 0.5 ? index-1 : index+1;

    let randChannel = channel.guild.channels.cache.get(sortedChannels[randIndex]);
    if(!randChannel) {
        //If channel below doesnt exist, use channel above and likewise
        randIndex = randIndex === index-1 ? index+1 : index-1;
        randChannel = channel.guild.channels.cache.get(sortedChannels[randIndex]);
    }

    if(fireChannels.get(randChannel.id)) {
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
    for (let [categoryId, children] of channels) {
        const category = guild.channels.cache.get(categoryId);

        //Push category
        if (category) idList.push(category.id);

        //Loop over children of categories and push children
        for (let [, child] of children) idList.push(child.id);
    }

    return idList;
}


function setLogChannel(channel) {
    logChannel = channel;
}
function sendLog(content) {
    console.log(content);
    logChannel.send(content);
}


function getIntervals() {
    return expansionIntervals;
}
function getLeaderboard() {
    return leaderboard;
}

module.exports = { startFire, endFire, endAllFires, loadData, saveDataInterval, getIntervals, getLeaderboard, addWater, setFireLevel, setLogChannel };