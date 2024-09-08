const client = require("../app.js");
const { EmbedBuilder } = require('discord.js');
const db = require('../databases/database.js');
const config = require(`../config.js`);

client.on('guildBanRemove', async (ban) => {

    const logChannelId = config.banlog; 
    const logChannel = ban.guild.channels.cache.get(logChannelId);

    if (!logChannel) {
        console.error('Couldnt find The Log Channel Please Check config.js.');
        return;
    }

    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 23, 
    });

    const banRemoveLog = fetchedLogs.entries.first();

    if (!banRemoveLog) {
        console.error('Couldnt find Executor!');
        return;
    }

    const { executor } = banRemoveLog;

    
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        if (!row) {
            try {
                
                await ban.guild.bans.create(ban.user.id, { reason: `User is not in Trusted Users!` });

                const member = await ban.guild.members.fetch(executor.id);
                await member.ban({ reason: `User is not in Trusted Users!` });

                const banRemoveEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle('Ban Protection - ( User is not in Trusted Users! )')
                    .setDescription(`<@${ban.user.id}> Named User's Ban Removed By <@${executor.id}> - **( ${executor.tag} )**\nModerator is not in Trusted Users\n\nExecutor is banned and unbanned person is banned again.`)
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setThumbnail(ban.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [banRemoveEmbed] });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error: ${error}`);
            }
        } else {
            const banRemoveEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
                .setTitle('Ban Protection - ( User is in Trusted Users! )')
                .setDescription(`<@${ban.user.id}> Named User is Unbanned By <@${executor.id}> - **( ${executor.tag} ) \n\n**\`Moderator is in Trusted Users!\`**`)
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(ban.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [banRemoveEmbed] });
        }
    });
});