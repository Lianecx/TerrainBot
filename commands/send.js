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
                .addChannelOption(option =>
                    option.setName("channel")
                    .setRequired(true)
                    .setDescription("The channel to send the message to"))
                .addStringOption(option =>
                    option.setName("message")
                    .setRequired(true)
                    .setDescription("The message to send"))
            ).addSubcommand(subcommand =>
                subcommand.setName("user")
                .setDescription("Send a message to a specific user")
                .addUserOption(option =>
                    option.setName("user")
                        .setRequired(true)
                        .setDescription("The user to send the message to"))
                .addStringOption(option =>
                    option.setName("message")
                        .setRequired(true)
                        .setDescription("The message to send"))
            ),
    async execute(interaction, client) {
        const user = interaction.options.getUser("user");
        const channel = interaction.options.getChannel("channel");
        const msg = interaction.options.getString("message");

        if(interaction.options.getSubcommand() === "channel") {
            try {
                await channel.send(msg);
            } catch(err) {
                return interaction.reply({ embeds: [fn.sendError("Could not reach channel, the id might've been invalid or I do not have access to that channel")] });
            }

            const successEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: "Success!", iconURL: "https://cdn.discordapp.com/emojis/914130307362484265.webp?size=96&quality=lossless"})
                .setDescription(`Successfully sent \`${msg}\` to ${channel.name}`)
                .setColor(config.colors.success);
            return interaction.reply({ embeds: [successEmbed] });
        } else if(interaction.options.getSubcommand() === "user") {
            try {
                user.send(`${msg}`);
            } catch(err){
                return interaction.reply({ embeds: [fn.sendError("Could not reach user, the id might've been invalid or their dm's are not enbaled")] });
            }

            const successEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }) })
                .setDescription(msg)
                .setFooter({ text: `Successfully sent \`${msg}\` to ${user.name}` })
                .setColor(config.colors.success);
            return interaction.reply({ embeds: [successEmbed], ephemeral: false });
        }
    }
}