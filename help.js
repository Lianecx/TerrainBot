const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Description of every command')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('Set the command')
            .setRequired(false)
            .setAutocomplete(true)
        ),
    async autocomplete(interaction, client) {
        const commandArray = [];

        const commandFiles = await fs.readdir('./commands/').catch(err => console.log('Could not read commands folder', err));
        if(!commandFiles) return;

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commandArray.push({ name: command.name.cap(), value: command.name });
        }

        interaction.respond(commandArray);
    },
    async execute(interaction, client) {
        const command = interaction.options.getString('command');

        await interaction.deferReply();

        if(!command) {
            console.log(`${interaction.user.tag} executed /help`);

            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help Menu')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: false }) })
                .setColor('DARK_BUT_NOT_BLACK');

            client.commands.forEach(command => helpEmbed.addField(command.name.cap(), command.description, true));

            interaction.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        } else {
            console.log(`${interaction.user.tag} executed /help ${command}`);

            const helpCommand = client.commands.get(command);
            if(!helpCommand) {
                interaction.reply(`:warning: That command [**${command}**] doesnt exist.`);
                return;
            }

            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help Menu')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: false }) })
                .setColor('DARK_BUT_NOT_BLACK')
                .addField(helpCommand.name.cap(), helpCommand.description);
            if(helpCommand.usage) helpEmbed.addField('Usage', helpCommand.usage);
            if(helpCommand.example) helpEmbed.addField('\nExample', helpCommand.example);

            interaction.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        }
    }
}