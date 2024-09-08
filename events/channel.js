const { Intents, EmbedBuilder } = require('discord.js');
const client = require(`../app.js`);
const db = require('../databases/database.js');
const config = require('../config.js');

const AuditLogActionTypes = {
    CHANNEL_CREATE: 10,
    CHANNEL_DELETE: 12,
    CHANNEL_UPDATE: 11
};

client.on('channelCreate', async (channel) => {
    const logChannel = await client.channels.fetch(config.channellog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');

    const auditLogs = await channel.guild.fetchAuditLogs({
        type: AuditLogActionTypes.CHANNEL_CREATE,
        limit: 1
    });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('There is an Error While Trying To Import Executor');
        return;
    }

    const executorId = executor.id;
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executorId, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                await channel.delete();

                const member = await channel.guild.members.fetch(executorId);
                await channel.guild.members.ban(member.id, { reason: `Not in Trusted Users | Channel Protection` });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Channel Protection - ( A Channel Created )')
                    .setDescription(`A Channel Created: ${channel.name} (\`${channel.id}\`)\n**Executor:** ${executor}\n\n**Not in Trusted Users!**`)
                    .setTimestamp()
                    .setThumbnail(channel.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Channel Protection - ( A Channel Created )')
                .setDescription(`A Channel Created: ${channel.name} (\`${channel.id}\`)\n**Executor:** ${executor} \n**User is in Trusted Users.**`)
                .setTimestamp()
                .setThumbnail(channel.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});

client.on('channelDelete', async (channel) => {
    const logChannel = await client.channels.fetch(config.channellog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');

    const auditLogs = await channel.guild.fetchAuditLogs({
        type: AuditLogActionTypes.CHANNEL_DELETE,
        limit: 1
    });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Import Executor');
        return;
    }

    const executorId = executor.id;
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executorId, async (err, row) => {
        if (err) {
            console.error('Veritabanı hatası:', err.message);
            return;
        }

        if (!row) {
            try {
                const channelData = {
                    name: channel.name,
                    type: channel.type,
                    parent: channel.parentId,
                    position: channel.rawPosition,
                    permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow.bitfield,
                        deny: overwrite.deny.bitfield
                    })),
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser
                };

                const newChannel = await channel.guild.channels.create({
                    name: channelData.name,
                    type: channelData.type,
                    parent: channelData.parent,
                    position: channelData.position,
                    permissionOverwrites: channelData.permissionOverwrites,
                    topic: channelData.topic,
                    nsfw: channelData.nsfw,
                    rateLimitPerUser: channelData.rateLimitPerUser
                });

                console.log(`Channel Succesfully Restored: ${newChannel.name} (${newChannel.id})`);

                const member = await channel.guild.members.fetch(executorId);
                await channel.guild.members.ban(member.id, { reason: `Not in Trusted Users Tried To Delete A Channel` });  

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Channel Protection - ( Channel Delte )')
                    .setDescription(`A Channel Delted: ${channel.name} (\`${channel.id}\`)\n**Executor:** ${executor}\n\n**User Not In Trusted Users!.**`)
                    .setTimestamp()
                    .setThumbnail(channel.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Channel Protection - ( Channel Delete )')
                .setDescription(`A Channel Deleted: ${channel.name} (\`${channel.id}\`)\n**Executor:** ${executor} \n**User is in Trusted Users!**`)
                .setTimestamp()
                .setThumbnail(channel.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    const logChannel = await client.channels.fetch(config.channellog);
    if (!logChannel) return console.error('Couldnt find The Log Channel Please Check config.js.');

    const auditLogs = await oldChannel.guild.fetchAuditLogs({
        type: AuditLogActionTypes.CHANNEL_UPDATE,
        limit: 1
    });
    const logEntry = auditLogs.entries.first();
    const executor = logEntry ? logEntry.executor : null;

    if (!executor) {
        console.error('Couldnt Import The Executor');
        return;
    }

    const executorId = executor.id;
    db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executorId, async (err, row) => {
        if (err) {
            console.error('Database Error:', err.message);
            return;
        }

        if (!row) {
            try {
                await newChannel.edit({
                    name: oldChannel.name,
                    parent: oldChannel.parentId,
                    position: oldChannel.rawPosition,
                    permissionOverwrites: oldChannel.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow.bitfield,
                        deny: overwrite.deny.bitfield
                    })),
                    topic: oldChannel.topic,
                    nsfw: oldChannel.nsfw,
                    rateLimitPerUser: oldChannel.rateLimitPerUser
                });
                console.log(`Channel Succesfully Restored: ${oldChannel.name} (${oldChannel.id})`);

                const member = await oldChannel.guild.members.fetch(executorId);
                await oldChannel.guild.members.ban(member.id, { reason: `User is not in trusted users | channel edited` });

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Channel Protection - ( Channel Update )')
                    .setDescription(`A Channel Updated: ${oldChannel.name} (\`${oldChannel.id}\`)\n**Executor:** ${executor}\n\n**User is not in Trusted Users.**`)
                    .setTimestamp()
                    .setThumbnail(oldChannel.guild.iconURL({ dynamic: true, size: 4096 }));

                logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Channel Protection - ( Channel Update )')
                .setDescription(`A Channel Updated: ${newChannel.name} (\`${newChannel.id}\`)\n**Executor:** ${executor} \n**User Is In Trusted Users!**`)
                .setTimestamp()
                .setThumbnail(oldChannel.guild.iconURL({ dynamic: true, size: 4096 }));

            logChannel.send({ embeds: [logEmbed] });
        }
    });
});