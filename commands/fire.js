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
        ).addSubcommand(subcommand =>
            subcommand.setName('setfirelevel')
                .setDescription('Set the current fire level in a specific channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Set the channel')
                        .setRequired(true)
                ).addNumberOption(option =>
                    option.setName('level')
                        .setDescription('Set the level')
                        .setRequired(true)
                )
        ),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        const fireEmbed = new Discord.MessageEmbed()
            .setTitle('Fire Incident');

        if(subcommand === 'start') {
            fireEmbed.setDescription(`🔥 Starting fire in <#${channel.id}>`);

            interaction.editReply({ embeds: [fireEmbed] });
            await fire.startFire(channel);

        } else if(subcommand === 'end') {
            fireEmbed.setDescription(`🔥 Ending fire in <#${channel.id}>`);

            interaction.editReply({ embeds: [fireEmbed] });
            await fire.endFire(channel);

        } else if(subcommand === 'endall') {
            fireEmbed.setDescription(`🔥 Ending all fires in this server`);

            interaction.editReply({ embeds: [fireEmbed] });
            fire.endAllFires();

        } else if(subcommand === 'setfirelevel') {

            const level = interaction.options.getNumber('level');

            fireEmbed.setDescription(`🔥 Setting fire level in <#${channel.id}> to ${level}`);

            interaction.editReply({ embeds: [fireEmbed] });
            fire.setFireLevel(channel, level);
        }
    }
};