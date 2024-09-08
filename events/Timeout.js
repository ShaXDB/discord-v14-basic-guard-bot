const client = require("../app.js");
const { EmbedBuilder } = require("discord.js");
const db = require('../databases/database.js');
const channels = require("../server/channels.json");


client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const logChannel = newMember.guild.channels.cache.get(channels.mutelog);

        if (!logChannel) {
            console.error("Couldnt find The Log Channel Please Check config.js.");
            return;
        }

        try {
            if (newMember.communicationDisabledUntilTimestamp) {

                const timeoutUntil = new Date(newMember.communicationDisabledUntilTimestamp);
                const timeoutDuration = timeoutUntil - new Date(); 
                const hours = Math.floor(timeoutDuration / (1000 * 60 * 60));
                const minutes = Math.floor((timeoutDuration % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeoutDuration % (1000 * 60 * 60)) / (1000 * 60) / (1000 * 60));
                const formattedDuration = `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;

                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: 24,
                });

                const timeoutLog = fetchedLogs.entries.first();
                const executor = timeoutLog ? timeoutLog.executor || 'Unknown Moderator' : 'Unknown Moderator';

                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle('Timeout Protection - ( User is not in Trusted Users! )')
                    .setDescription(`<@${newMember.user.id}> Named Member Timeouted By ${executor} \nDuration: \`${formattedDuration}\`\nModerator is not in Trusted Users! / Moderator Banned`)
                    .setTimestamp()
                    .setThumbnail(newMember.guild.iconURL({ dynamic: true, size: 4096 }))
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    if (!row) {
                        try {
                            const member = await newMember.guild.members.fetch(executor.id);
                            await member.ban({ reason: `User is not in Trusted Users!` });
                            logChannel.send({ embeds: [timeoutEmbed] });
                            await newMember.timeout(null);
                        } catch (error) {
                            console.error('Error:', error);
                            logChannel.send(`There is an Error: ${error}`);
                        }
                    }
                });
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const logChannel = newMember.guild.channels.cache.get(channels.mutelog);

        if (!logChannel) {
            console.error("Couldnt find The Log Channel Please Check config.js.");
            return;
        }

        try {
            if (newMember.communicationDisabledUntilTimestamp) {
               
                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: 24,
                });

                const timeoutLog = fetchedLogs.entries.first();
                const executor = timeoutLog ? timeoutLog.executor || 'Unknown Moderator' : 'Unknown Moderator';

                const timeoutEmbed = new EmbedBuilder() 
                    .setColor(0x0099FF)
                    .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle('Timeout Protection - ( User is not in Trusted Users )')
                    .setDescription(`<@${newMember.user.id}> named member timeouted by ${executor}\nUser is not in Trusted Users!\n\n**\`Executor Banned And User's Timeout Removed\``)
                    .setTimestamp()
                    .setThumbnail(newMember.guild.iconURL({ dynamic: true, size: 4096 }))
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });


                db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    if (!row) {
                        try {
                            const member = await newMember.guild.members.fetch(executor.id);
                            await member.ban({ reason: `User is not in Trusted Users.` });
                            await newMember.timeout(null);
                            
                           
                            logChannel.send({ embeds: [timeoutEmbed] });
                        } catch (error) {
                            console.error('Error:', error);
                            logChannel.send(`There is an Error: ${error}`);
                        }
                    } else {
                        
                        logChannel.send({
                            embeds: [timeoutEmbed.setDescription(`Timeouted by <@${executor.id}> User is in Trusted Users!`)]
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            logChannel.send(`There is an Error: ${error}`);
        }
    }
});
            } else if (oldMember.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp) {
            
                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: 24,
                });

                const removeTimeoutLog = fetchedLogs.entries.first();
                const executor = removeTimeoutLog ? removeTimeoutLog.executor : 'Unknown Moderator';

                db.get('SELECT user_id FROM trusted_users WHERE user_id = ?', executor.id, async (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    if (!row) {
                        try {
                     
                            const member = await newMember.guild.members.fetch(executor.id);
                            await member.ban({ reason: 'User in not in Trusted Users' });

                    
                            const timeoutDuration = 30 * 60 * 1000; 
                            await newMember.timeout(timeoutDuration, 'Unauthorized timeout remove User Timeouted 30 mins.');

                            const timeoutEmbed2 = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
                                .setTitle('Timeout Protection - ( User is not in Trusted Users! )')
                                .setDescription(`<@${newMember.user.id}> Named User's timeout removed by <@${executor.id}> \n<@${newMember.user.id}> is timeouted again. \n\n User is not in Trusted User's ${executor.username} banned`)
                                .setTimestamp()
                                .setThumbnail(newMember.guild.iconURL({ dynamic: true, size: 4096 }))
                                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                            logChannel.send({ embeds: [timeoutEmbed2] });
                        } catch (error) {
                            console.error('Error:', error);
                            logChannel.send(`There is an Error: ${error}`);
                        }
                    } else {

                        const timeoutEmbed3 = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
                            .setTitle('Timeout Protection - ( User is in Trusted Users )')
                            .setDescription(`<@${newMember.user.id}> Named User's Timeout Removed By <@${executor.id}> \n**\`Moderator is in Trusted Users!\`**`)
                            .setTimestamp()
                            .setThumbnail(newMember.guild.iconURL({ dynamic: true, size: 4096 }))
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                        logChannel.send({ embeds: [timeoutEmbed3] });
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            logChannel.send(`There is an Error: ${error}`);
        }
    }
});