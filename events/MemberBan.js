const client = require("../app.js");
const { EmbedBuilder } = require('discord.js');
const db = require('../databases/database.js');
const config = require('../config.js');

client.on('guildBanAdd', async (ban) => {

    const logChannelId = config.banlog; 
    const logChannel = ban.guild.channels.cache.get(logChannelId);

    if (!logChannel) {
        console.error('Couldnt find The Log Channel Please Check config.js.');
        return;
    }

    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 22,
    });

    const banLog = fetchedLogs.entries.first();
    const { executor } = banLog;

  
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        if (!row) {
            try {
           
                await ban.guild.bans.remove(ban.user.id);

              
                const member = await ban.guild.members.fetch(executor.id);
                await member.ban({ reason: `User is not in Trusted Users.` });

                const banLogEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle('Ban Protection - ( Executor is Not in Trusted Users! )')
                    .setDescription(`<@${ban.user.id}> named User Banned By <@${executor.id}>.\n**${executor.tag}** \n\n Moderator is not in Trusted Users!\n**\`Executor is Banned and User is Unbanned!\`**`)
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setThumbnail(ban.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [banLogEmbed] }).then(() => {
                    console.log('Sending Log Message...');
                }).catch(error => {
                    console.error('Couldnt Send Log Message..:', error);
                });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error: ${error}`);
            }
        } else if(row) {
            const banLogEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
                .setTitle('Ban Protection - ( Executor is in Trusted Users! )')
                .setDescription(`<@${ban.user.id}> named User Banned By <@${executor.id}>.\n**${executor.tag}** \n\n Moderator is in Trusted Users!`)
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(ban.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [banLogEmbed] }).then(() => {
                console.log('Sending The Log Message...');
            });
        }
    });
});