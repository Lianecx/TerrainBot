const Discord = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const config = require('./config.json');
const youtube = require('./youtube');
const help = require('./help');

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

    const subcountChannel = client.channels.cache.get(config.channels.subcount);
    await youtube.updateSubcount(subcountChannel, config.youtubeId);
    cron.schedule('0 */12 * * *', async () => await youtube.updateSubcount(subcountChannel, config.youtubeId)); //Update subs every 12 hours
});

client.on('interactionCreate', async interaction => {
    interaction.reply = function (content) {
        return interaction.editReply(content);
    }

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
                client.channels.cache.get("941037761891270666").send({ embeds: [commandErrEmbed] });
            }
        }
    }
});

process.on("unhandledRejection", async error => {
    const apiErrEmbed = new Discord.MessageEmbed()
        .setTitle("New Discord API Error")
        .setDescription(`${error.message}`)
        .addField("Status", `${error.httpStatus}`)
        .addField("Request", `${error.method.toUpperCase()} ${error.path}`)
        .addField("Data", `${JSON.stringify(error.requestData.json)}`)
        .addField("Stack", `${error.stack}`)
        .setColor(config.colors.error);

    if(error instanceof Discord.DiscordAPIError) client.channels.cache.get("941037761891270666").send({ embeds: [apiErrEmbed]});
    else console.error(error)
});

client.on("messageCreate", async(message) => {
    if(message.channel.type === 'DM'){
        if(message.author.id === client.user.id) return;

        const DMEmbed = new Discord.MessageEmbed().setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true })}).setColor(config.colors.command).setDescription(`${message}`).setFooter({ text: `ID: ${message.author.id}`});
        if(message.attachments.size > 0) DMEmbed.setImage(message.attachments.first().url.toString());
        client.channels.cache.get("907641751588704357").send({ embeds: [DMEmbed] });
    }
});

client.login(config.token);