const { SlashCommandBuilder } = require('@discordjs/builders');
const fire = require('../fire');

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
        ),
    execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if(subcommand === 'start') {
            interaction.editReply(`🔥 Starting fire in <#${channel.id}>...`);
            fire.startFire(channel);
        } else if(subcommand === 'end') {
            interaction.editReply(`🔥 Ending fire in <$${channel.id}>...`);
            fire.endFire(channel);
        }
    }
};