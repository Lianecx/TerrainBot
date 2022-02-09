//config.json format: 
//{
//    "token":"BOT-TOKEN",
//    "clientId": "BOT-CLIENT-ID",
//	  "guildId": "GUILD ID",
//    "roleIds": {
//        "ROLENAME": ROLEID,
//        "2ndROLENAME", 2ndROLEID
//        etc...
//    },
//}
//Must be in same folder as main.js
const { token, clientId, guildId, roleIds } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

//Help SlashCommandBuilder
const helpData = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Detailed Description of every command.')
    .addStringOption(option =>
        option.setName('command')
        .setDescription('Set the command of which you want to get information.')
        .setRequired(false)
    );

//Still Help SlashCommandBuilder
helpData.options[0].choices = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    helpData.options[0].choices.push({ name: command.name, value: command.name });
}

//Push all SlashBuilders (in JSON) and permissions from all command files to array
const commands = [];
const permissions = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
	if(command.permissions) {
        let perms = [];
        for(const perm of command.permissions) {
            if(roleIds[perm]) perms.push({ id: roleIds[perm], type: 1, permission: true });
            else if(!isNaN(perm)) perms.push({ id: perm, type: 1, permission: true });
        }
        permissions.push({ name: command.name, perms: perms });
    }
}

//Push help SlashBuilder (in JSON) to array
commands.push(helpData.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        //Upload all SlashCommands to discord (only for one guild)
        const response = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        //For GLOBAL Slash commands:
        //await rest.put(
        //    Routes.applicationCommands(clientId),
        //    { body: commands },
        //);

		//Slash Command Permissions
		const fullPermissions = [];
		for(const permission of permissions) {
			fullPermissions.push({
				id: response.find(cmd => cmd.name === permission.name).id,
				permissions: permissions.find(cmd => cmd.name === permission.name).perms,
			});
		}
        console.log(fullPermissions)

        //Upload permissions to discord
        await rest.put(
            Routes.guildApplicationCommandsPermissions(clientId, guildId),
            { body: fullPermissions },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (err) {
        console.log('Error while reloading application (/) commands.', err);
    }
})();