const client = require("../app.js");
const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const db = require('../databases/database.js');

const actionTypes = {
    ROLE_CREATE: 30,
    ROLE_DELETE: 32,
    ROLE_UPDATE: 31
};

client.on('roleCreate', async (role) => {
    try {
        const channel = await client.channels.fetch(config.rolelog);
        if (!channel) return console.error('Couldnt find The Log Channel Please Check config.js.');

        const auditLogs = await role.guild.fetchAuditLogs({ type: actionTypes.ROLE_CREATE });
        const logEntry = auditLogs.entries.first();
        if (!logEntry) return console.error('Couldnt Find Log Entry!');
        const { executor } = logEntry;
        if (!executor) {
            console.error('Couldnt Find Executor');
            return;
        }

        const description = `A new Role Created: ${role} (\`${role.id}\`), \nCreator: <@${executor.id}> (\`${executor.id}\`)`;
        const rolLogEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setThumbnail(role.guild.iconURL({ dynamic: true, size: 4096 }))
            .setDescription(description)
            .setTimestamp()
            .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL({ dynamic: true }) });

        channel.send({ embeds: [rolLogEmbed] });

        db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }

            if (!row) {
                try {
                    const member = await role.guild.members.fetch(executor.id);
                    await member.ban({ reason: 'User is not in Trusted Users.' });
                    channel.send({ content: `<@${executor.id}> User is not in Trusted Users And Tried To Create A role!` }).then(() => {
                        console.log('Sending The Log Message...');
                    }).catch(error => {
                        console.error('Couldnt Send The Log Message:', error);
                    });
                } catch (error) {
                    console.error('Error:', error);
                    channel.send(`There is an Error: ${error}`);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

client.on('roleDelete', async (role) => {
    try {
        const channel = await client.channels.fetch(config.rolelog);
        if (!channel) return console.error('Couldnt find The Log Channel Please Check config.js.');

        const auditLogs = await role.guild.fetchAuditLogs({ type: actionTypes.ROLE_DELETE });
        const logEntry = auditLogs.entries.first();
        if (!logEntry) return console.error('Couldnt Find Log Entry!');
        const { executor } = logEntry;
        if (!executor) {
            console.error('Couldnt Find Executor');
            return;
        }

        const description = `A Role Deleted: ${role.name} (\`${role.id}\`), \nExecutor: <@${executor.id}> (\`${executor.id}\`)`;
        const rolLogEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setThumbnail(role.guild.iconURL({ dynamic: true, size: 4096 }))
            .setDescription(description)
            .setTimestamp()
            .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL({ dynamic: true }) });

        channel.send({ embeds: [rolLogEmbed] });

        db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }

            if (!row) {
                try {
                    const member = await role.guild.members.fetch(executor.id);
                    await member.ban({ reason: 'User Is Not In Trusted Users.' });
                    channel.send({ content: `<@${executor.id}> Is not in Trusted Users And Tried To Delete A Role!` }).then(() => {
                        console.log('Sending The Log Message...');
                    }).catch(error => {
                        console.error('Couldnt Send The Message:', error);
                    });
                } catch (error) {
                    console.error('Error:', error);
                    channel.send(`There is an Error: ${error}`);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

client.on('roleUpdate', async (oldRole, newRole) => {
    try {
        const channel = await client.channels.fetch(config.rolelog);
        if (!channel) return console.error('Couldnt find The Log Channel Please Check config.js.');

        const auditLogs = await newRole.guild.fetchAuditLogs({ type: actionTypes.ROLE_UPDATE });
        const logEntry = auditLogs.entries.first();
        if (!logEntry) return console.error('Couldnt Find Log Entry!');
        const { executor } = logEntry;
        if (!executor) {
            console.error('Couldnt Find Executor!');
            return;
        }

        let changes = [];
        if (oldRole.name !== newRole.name) {
            changes.push(`A Role Name Changed: \`${oldRole.name}\` ➔ \`${newRole.name}\``);
        }

        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            const addedPermissions = newRole.permissions.toArray().filter(p => !oldRole.permissions.has(p));
            const removedPermissions = oldRole.permissions.toArray().filter(p => !newRole.permissions.has(p));

            if (addedPermissions.length > 0) {
                changes.push(`${newRole.name} added Permissions: \n ✅\`${addedPermissions.join(', ')}\``);
            }

            if (removedPermissions.length > 0) {
                changes.push(`${newRole.name} removed Permissions: \n ❌ \`${removedPermissions.join(', ')}\``);
            }
        }

        if (changes.length > 0) {
            const description = `A Role Updated: ${newRole} (\`${newRole.id}\`), \n Executor: <@${executor.id}> (\`${executor.id}\`)`;

            const rolLogEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setThumbnail(newRole.guild.iconURL({ dynamic: true, size: 4096 }))
                .setTitle('Role Protection')
                .setDescription(description)
                .addFields({ name: 'Changes;', value: changes.join('\n') })
                .setTimestamp()
                .setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL({ dynamic: true }) });

            channel.send({ embeds: [rolLogEmbed] });

            db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
                if (err) {
                    console.error(err.message);
                    return;
                }

                if (!row) {
                    try {
                        const member = await newRole.guild.members.fetch(executor.id);
                        await member.ban({ reason: 'User is not in Trusted Users!' });
                        channel.send({ content: `<@${executor.id}> Named Moderator Is Not In Trusted Users! \n**\`User Banned!\`**` }).then(() => {
                            console.log('Sending The Log Message...');
                        }).catch(error => {
                            console.error('Couldnt Send The Log Message:', error);
                        });
                    } catch (error) {
                        console.error('Error:', error);
                        channel.send(`There is an Error: ${error}`);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
