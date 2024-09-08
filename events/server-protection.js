const client = require("../app.js");
const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const db = require('../databases/database.js');


client.on('guildUpdate', async (oldGuild, newGuild) => {
    const logChannel = await client.channels.fetch(config.serverlog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');

    const auditLogs = await newGuild.fetchAuditLogs({ type: 1, limit: 1 });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Find Executor');
        return;
    }

    const changes = [];
    if (oldGuild.name !== newGuild.name) {
        changes.push(`Server Name Changed: \`${oldGuild.name}\` ➔ \`${newGuild.name}\``);

        const OwnerID = config.ServerOwnerID;
        try {
            const user = await client.users.fetch(OwnerID);
            for (let i = 1; i <= 3; i++) {
                await user.send(`<@${OwnerID}> Your Servers Name Has Been Changed!! \n\n \`${oldGuild.name}\` ➔ \`${newGuild.name}\``);
            }
        } catch (error) {
            console.error('Couldnt Send The DM Message To The Server Owner!', error);
        }
    }

    if (oldGuild.icon !== newGuild.icon) {
        changes.push('Server Icon Changed!');
    }

    if (oldGuild.banner !== newGuild.banner) {
        changes.push('Server Banner Changed!');
    }

    if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
        changes.push(`Server VanıtyURL Changed \`${oldGuild.vanityURLCode}\` ➔ \`${newGuild.vanityURLCode}\``);

        const OwnerID = config.ServerOwnerID;
        try {
            const user = await client.users.fetch(OwnerID);
            for (let i = 1; i <= 5; i++) {
                await user.send(`<@${OwnerID}> Your Server Vanıty URL Has Been Changed!!! \n\n \`${oldGuild.vanityURLCode}\` ➔ \`${newGuild.vanityURLCode}\``);
            }
        } catch (error) {
            console.error('Couldnt Send DM Message To The Server Owner!:', error);
        }    
    }

   
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        if (row) {
           
            const logEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('Server Protection')
                .setDescription(`Server Updated: ${newGuild.name} (\`${newGuild.id}\`)\nChanges:\n${changes.join('\n')}\nExecutor: ${executor}\n**\`User is in Trusted Users!\`**`)
                .setTimestamp()
                .setThumbnail(newGuild.iconURL({ dynamic: true, size: 4096 }));

            await logChannel.send({ embeds: [logEmbed] });
        } else {
            
            try {
                const guildMember = await newGuild.members.fetch(executor.id);
                await guildMember.ban({ reason: 'User is not in Trusted Users' });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setTitle('Server Protection')
                    .setDescription(`Server Updated: ${newGuild.name} (\`${newGuild.id}\`)\nChanges:\n${changes.join('\n')}\nExecutor: ${executor}\n**\`User is not in Trusted Users / User Banned!\`**`)
                    .setTimestamp()
                    .setThumbnail(newGuild.iconURL({ dynamic: true, size: 4096 }));

                await logChannel.send({ embeds: [logEmbed] });

            } catch (error) {
                console.error('Error:', error);
                await logChannel.send(`There is an Error: ${error}`);
            }
        }
    });
});