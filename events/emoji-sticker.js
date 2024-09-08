const { Client, Intents, EmbedBuilder } = require('discord.js');
const client = require("../app.js");
const db = require('../databases/database.js');
const config = require('../config.js');


client.on('emojiCreate', async (emoji) => {
    const logChannel = await client.channels.fetch(config.emojilog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');


    const auditLogs = await emoji.guild.fetchAuditLogs({ type: 60, limit: 1 });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt İmport Executor');
        return;
    }

 
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                const member = await emoji.guild.members.fetch(executor.id);
                await member.ban(member.id, { reason: `User Not In Trusted Users!` });
               
                const logEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('EMOJI PROTECTION - ( Emoji Create )')
                    .setDescription(`${emoji} (\`${emoji.id}\`)\n**Executor:** ${executor}\n\nUser is not in Trusted Users.`)
                    .setTimestamp()
                    .setThumbnail(emoji.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error While Trying To Ban Executor!, ${error}`);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Emoji Protection - ( Emoji Create )')
                .setDescription(`${emoji} (\`${emoji.id}\`)\n**Executor:** ${executor} \n**\`User is in Trusted Users!.\`**`)
                .setTimestamp()
                .setThumbnail(emoji.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});

client.on('emojiDelete', async (emoji) => {
    const logChannel = await client.channels.fetch(config.emojilog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');


    const auditLogs = await emoji.guild.fetchAuditLogs({ type: 61, limit: 1 });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Import Executor');
        return;
    }


    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                const member = await emoji.guild.members.fetch(executor.id);
                await member.ban(member.id, { reason: `User is not in Trusted Users` });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Emoji Protection - ( Emoji Delete )')
                    .setDescription(`${emoji} (\`${emoji.id}\`)\n**Executor:** ${executor}\n\nUser is not in Trusted Users.`)
                    .setTimestamp()
                    .setThumbnail(emoji.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error: ${error}`);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Emoji Protection - ( Emoji Delete )')
                .setDescription(`${emoji} (\`${emoji.id}\`)\n**Executor:** ${executor}\n**\`User is in Trusted Users.\`**`)
                .setTimestamp()
                .setThumbnail(emoji.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});

client.on('stickerCreate', async (sticker) => {
    const logChannel = await client.channels.fetch(config.emojilog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');


    const auditLogs = await sticker.guild.fetchAuditLogs({ type: 92, limit: 1 });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Import Executor!');
        return;
    }


    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                const member = await sticker.guild.members.fetch(executor.id);

                await member.ban(member.id, { reason: `User is not in Trusted Users` });

                const logEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Sticker Protection - ( Sticker Create )')
                    .setDescription(`${sticker} (\`${sticker.id}\`)\n**Executor:** ${executor}\n\n**\`User is not in Trusted Users.\`**`)
                    .setTimestamp()
                    .setThumbnail(sticker.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error: ${error}`);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Sticker Protection - ( Sticker Create )')
                .setDescription(`${sticker} (\`${sticker.id}\`)\n**Executor:** ${executor}\nKUser is in Trusted Users`)
                .setTimestamp()
                .setThumbnail(sticker.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});

client.on('stickerDelete', async (sticker) => {
    const logChannel = await client.channels.fetch(config.emojilog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');


    const auditLogs = await sticker.guild.fetchAuditLogs({ type: 93, limit: 1 });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Import Executor!');
        return;
    }


    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                const member = await sticker.guild.members.fetch(executor.id);

                await member.ban(member.id, { reason: `User is not in Trusted Users.` });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Sticker Protection - ( Sticker Delete )')
                    .setDescription(`${sticker} (\`${sticker.id}\`)\n**Executor:** ${executor}\n\nUser is not in Tursted Users.`)
                    .setTimestamp()
                    .setThumbnail(sticker.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
                logChannel.send(`There is an Error: ${error}`);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Sticker Delete - ( Sticker Delete )')
                .setDescription(`${sticker} (\`${sticker.id}\`)\n**Executor:** ${executor}\n**\`User is in Trusted Users.\`**`)
                .setTimestamp()
                .setThumbnail(sticker.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});