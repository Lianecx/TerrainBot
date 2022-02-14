//config.json format: 
//{
//    "token":"BOT-TOKEN",
//    "clientId": "BOT-CLIENT-ID",
//	  "guildId": "GUILD ID",
//    "roles": {
//        "ROLENAME": ROLEID,
//        "2ndROLENAME", 2ndROLEID
//        etc...
//    },
//}
//Must be in same folder as main.js
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const help = require('./help');
const fs = require('fs');

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

//Push all SlashBuilders (in JSON) and permissions from all command files to array
const commands = [];
const permissions = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    console.log(`Loaded ${command.name}`);

	if(command.permissions) {
        let perms = [];
        for(const perm of command.permissions) {
            if((config.roles)[perm]) perms.push({ id: (config.roles)[perm], type: 1, permission: true });
            else if(!isNaN(perm)) perms.push({ id: perm, type: 1, permission: true });
        }
        permissions.push({ name: command.name, perms: perms });
    }
}

//Push help SlashBuilder (in JSON) to array
commands.push(help.data.toJSON());

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        //Upload all SlashCommands to discord (only for one guild)
        const response = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

		//Slash Command Permissions
		const fullPermissions = [];
		for(const permission of permissions) {
			fullPermissions.push({
				id: response.find(cmd => cmd.name === permission.name).id,
				permissions: permissions.find(cmd => cmd.name === permission.name).perms,
			});
		}

        //Upload permissions to discord
        await rest.put(
            Routes.guildApplicationCommandsPermissions(config.clientId, config.guildId),
            { body: fullPermissions },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (err) {
        console.log('Error while reloading application (/) commands.', err);
    }
})();