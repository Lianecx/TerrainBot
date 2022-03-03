const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fire = require('../fire/fire');

module.exports = {
    name: 'fire',
    description: 'Manage the fire incident',
    options: {
        defer: true
    },
    permissions: ["Administrator", "Moderator"],
    data: new SlashCommandBuilder()
        .setName('fire')
        .setDescription('Manage the fire incident')
        .addSubcommand(subcommand =>
            subcommand.setName('start')
                .setDescription('Start a fire in a specific channel')
                .addChannelOption(channel =>
                    channel.setName('channel')
                        .setDescription('Set the channel')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName('end')
                .setDescription('End a fire in a specific channel')
                .addChannelOption(channel =>
                    channel.setName('channel')
                        .setDescription('Set the channel')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName('endall')
                .setDescription('End all fires in the server')
        ),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if(subcommand === 'start') {
            const fireEmbed = new Discord.MessageEmbed()
                .setTitle('Fire Incident')
                .setDescription(`🔥 Starting fire in <#${channel.id}>`);

            interaction.editReply({ embeds: [fireEmbed] });
            await fire.startFire(channel);

        } else if(subcommand === 'end') {
            const fireEmbed = new Discord.MessageEmbed()
                .setTitle('Fire Incident')
                .setDescription(`🔥 Ending fire in <#${channel.id}>`);

            interaction.editReply({ embeds: [fireEmbed] });
            await fire.endFire(channel);

        } else if(subcommand === 'endall') {
            const fireEmbed = new Discord.MessageEmbed()
                .setTitle('Fire Incident')
                .setDescription(`🔥 Ending all fires in this server`);

            interaction.editReply({ embeds: [fireEmbed] });
            fire.endAllFires();
        }
    }
};