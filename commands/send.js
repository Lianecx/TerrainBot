const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const config = require('../config.json');
const fn = require(`../functions`);

module.exports = {
    name: 'send',
    description: 'Send a message to a specific channel or user',
    options: {
        defer: true
    },
    permissions: ["Administrator", "Moderator"],
    data: new SlashCommandBuilder()
            .setName('send')
            .setDescription('Send a message to a specific channel or user')
            .setDefaultPermission(false)
            .addSubcommand(subcommand =>
                subcommand.setName("channel")   
                .setDescription("Send a message to a specific channel")
                .addStringOption(option => option.setName("id").setRequired(true).setDescription("The ID of the channel to send the message to"))
                .addStringOption(option => option.setName("message").setRequired(true).setDescription("The message to send"))
            ).addSubcommand(subcommand =>
                subcommand.setName("user")
                .setDescription("Send a message to a specific user")
                .addStringOption(option => option.setName("id").setRequired(true).setDescription("The ID of the user to send the message to"))
                .addStringOption(option => option.setName("message").setRequired(true).setDescription("The message to send"))
            ),
    async execute(interaction, client) {
        const id = interaction.options.getString("id");
        const msg = interaction.options.getString("message");

        if(interaction.options.getSubcommand() === "channel"){
            try {
                client.channels.cache.get(id).send(`${msg}`);
            } catch(err) {
                return interaction.reply({ embeds: [fn.sendError("Could not reach channel, the id might've been invalid or I do not have access to that channel")] });
            }

            return interaction.reply({ embeds: [new Discord.MessageEmbed().setAuthor({ name: "Success!", iconURL: "https://cdn.discordapp.com/emojis/914130307362484265.webp?size=96&quality=lossless"}).setDescription(`Successfully sent \`${msg}\` to the ${client.channels.cache.get(id).name} channel`).setColor(config.colors.success)] });
        } else if(interaction.options.getSubcommand() === "user"){
            try {
                client.users.cache.get(id).send(`${msg}`)
            } catch(err){
                return interaction.reply({ embeds: [fn.sendError("Could not reach user, the id might've been invalid or their dm's are not enbaled")] });
            }
            return interaction.reply({ embeds: [new Discord.MessageEmbed().setAuthor({ name: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }) }).setDescription(msg).setFooter({ text: `Sent to ID: ${id}` }).setColor(bot.accentColor)], ephemeral: false });
        }
    }
}