const Discord = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const config = require('./config.json');
const youtube = require('./youtube');
const help = require('./help');

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

//Set all commandFiles in ./commands in client.commands collection
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}.`);
    client.user.setActivity('over TheTerrain', { type: 'WATCHING' });

    const subcountChannel = client.channels.cache.get(config.channels.subcount);
    await youtube.updateSubcount(subcountChannel, config.youtubeId);
    cron.schedule('0 */12 * * *', async () => await youtube.updateSubcount(subcountChannel, config.youtubeId)); //Update subs every 12 hours
});

client.on('interactionCreate', async interaction => {
    if(interaction.isAutocomplete) {
        if (interaction.commandName === 'help') {
            //Help Command
            await help.autocomplete(interaction, client);
        } else {
            //Other Commands
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            command.autocomplete(interaction, client);
        }
    }

    if(interaction.isCommand()) {
        if (interaction.commandName === 'help') {
            //Help Command
            await help.execute(interaction, client);
        } else {
            //Other Commands
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            command.execute(interaction, client);
        }
    }
});

client.login(config.token);