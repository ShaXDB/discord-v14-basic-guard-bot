const { EmbedBuilder } = require('discord.js');
const db = require('../../databases/database.js');
const client = require(`../../app.js`);
const config = require(`../../config.js`);

exports.run = async (client, message, args) => {
    const authorId = message.author.id;


    if(message.author.id !== config.ServerOwnerID) return;
    
    db.all('SELECT user_id FROM trusted_users', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('TRUSTED USERS LIST')
            .setDescription('Trusted Users in this server:')
            .setTimestamp();


        const fields = rows.map(row => ({
            name: `Kullanıcı ID: ${row.user_id}`,
            value: `<@${row.user_id}>`,
            inline: true
        }));

        embed.addFields(fields);

        message.channel.send({ embeds: [embed] });
    });
};

exports.conf = {
    aliases: ["trustedusers", "trusted-list", "trustedlist"]
};

exports.help = {
    name: "trusted-list"
};