const Discord = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const config = require('./config.json');
const youtube = require('./youtube');
const help = require('./help');
const fire = require('./fire/fire');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

/*
 * Converts the first letter of a string to uppercase.
 * @returns {String} The formatted string.
 */
String.prototype.cap = function() {
    return this[0].toUpperCase() + this.slice(1, this.length).toLowerCase()
};

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

    await fire.loadData(config.guildId);

    const subcountChannel = client.channels.cache.get(config.channels.subcount);
    await youtube.updateSubcount(subcountChannel, config.youtubeId);
    cron.schedule('0 */12 * * *', async () => await youtube.updateSubcount(subcountChannel, config.youtubeId)); //Update subs every 12 hours
});

client.on('interactionCreate', async interaction => {
    interaction.reply = function (content) {
        return interaction.editReply(content);
    };

    if(interaction.isAutocomplete()) {
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

            if(command.options?.defer) await interaction.deferReply();

            try {
                await command.execute(interaction, client);
            } catch(err) {
                const commandErrEmbed = new Discord.MessageEmbed()
                    .setTitle("🚫 An Error Occurred!")
                    .addField(`Caused by:`, `${interaction.member.user.tag}`)
                    .addField(`From the command:`, `${interaction.commandName}`)
                    .addField("Error:", `${err}`)
                    .setColor(config.colors.error);

                console.log(`Command ${command.name} threw an error`, err);
                client.channels.cache.get(config.channels.error).send({ embeds: [commandErrEmbed] });
            }
        }
    }
});

client.on('messageCreate', message => {
    if(fire.getChannels().has(message.channel.id)) fire.addWater(message.channel);

    if(message.channel.type === 'DM') {
        if(message.author.id === client.user.id) return;

        const dmEmbed = new Discord.MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true })})
            .setColor(config.colors.command)
            .setDescription(message.content)
            .setFooter({ text: `Id: ${message.author.id}`});
        if(message.attachments.size > 0) dmEmbed.setImage(message.attachments.first().url.toString());
        client.channels.cache.get(config.channels.dms).send({ embeds: [dmEmbed] });
    }
});

process.on('unhandledRejection', async error => {
    if(!error instanceof Discord.DiscordAPIError) return console.error(error);

    const apiErrEmbed = new Discord.MessageEmbed()
        .setTitle('New Discord API Error')
        .setDescription(error.message)
        .addField('Status', error.httpStatus)
        .addField('Request', `${error.method.toUpperCase()} ${error.path}`)
        .addField('Data', JSON.stringify(error.requestData.json))
        .addField('Stack', error.stack)
        .setColor(config.colors.error);

    client.channels.cache.get(config.channels.error).send({ embeds: [apiErrEmbed]});
});

client.login(config.token);