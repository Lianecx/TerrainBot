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
        .setDefaultPermission(false)
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
        ).addSubcommand(subcommand =>
            subcommand.setName('leaderboard')
                .setDescription('Send a leaderboard of the most helpful users to a specified channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Set the channel')
                        .setRequired(true)
                ).addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Set the amount of users to be shown (default 5)')
                        .setRequired(false)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName('clearleaderboard')
                .setDescription('Clear the leaderboard')
        ),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        const fireEmbed = new Discord.MessageEmbed()
            .setTitle('Fire Incident');

        switch (subcommand) {
            case 'start':
                fireEmbed.setDescription(`???? Starting fire in <#${channel.id}>`);

                interaction.editReply({ embeds: [fireEmbed] });
                await fire.startFire(channel);
                break;

            case 'end':
                fireEmbed.setDescription(`???? Ending fire in <#${channel.id}>`);

                interaction.editReply({ embeds: [fireEmbed] });
                await fire.endFire(channel);
                break;

            case 'endall':
                fireEmbed.setDescription(`???? Ending all fires in this server`);

                interaction.editReply({ embeds: [fireEmbed] });
                fire.endAllFires();
                break;

            case 'setfirelevel':
                const level = interaction.options.getNumber('level');

                fireEmbed.setDescription(`???? Setting fire level in <#${channel.id}> to **${level}**`);

                interaction.editReply({ embeds: [fireEmbed] });
                await fire.setFireLevel(channel, level);
                break;

            case 'leaderboard':

                const amount = interaction.options.getNumber('amount') ?? 5; //Amount of users to be shown

                fireEmbed.setDescription(`???? Sending leaderboard to <#${channel.id}>`);

                const leaderboard = fire.getLeaderboard();
                const bestUsers = leaderboard.sort((points1, points2) => points2 - points1).firstKey(amount); //Filter best users

                const leaderboardEmbed = new Discord.MessageEmbed()
                    .setTitle('Water Leaderboard')
                    .setDescription(`Leaderboard of the ${bestUsers.size} users who contributed the most.`);

                for (const userId of bestUsers) {
                    const index = bestUsers.indexOf(userId);
                    const user = await client.users.fetch(userId);
                    const points = leaderboard.get(userId);

                    if(!user) continue;
                    //Add emojis for 1st, 2nd and 3rd place
                    let title = `${index+1}. ${user.tag}`;
                    if(index === 0) title = '???? ' + title;
                    if(index === 1) title = '???? ' + title;
                    if(index === 2) title = '???? ' + title;

                    leaderboardEmbed.addField(title, `has contributed **${points}** water buckets.`);
                }

                interaction.editReply({ embeds: [fireEmbed] });
                channel.send({ embeds: [leaderboardEmbed] });
                break;

            case 'clearleaderboard':
                fireEmbed.setDescription('???? Clearing leaderboard');
                interaction.editReply({ embeds: [fireEmbed] });

                fire.clearLeaderboard();
                break;
        }
    }
};