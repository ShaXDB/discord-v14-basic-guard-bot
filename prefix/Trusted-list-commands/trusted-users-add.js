const { EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const client = require(`../../app.js`);
const db = require('../../databases/database.js');
const config = require(`../../config.js`);

exports.run = async (client, message, args) => {
  
    if(message.author.id !== config.ServerOwnerID) return;

    const userId = args[0]



    db.run('INSERT INTO trusted_users (user_id) VALUES (?)', userId, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Inserted ${userId} into the database`);
        message.reply(`Successfully <@${userId}> Named User Added To Trusted Users!`);
    });
};

exports.conf = {
    aliases: ["trust", "trusted-add", "trustedadd", "addtrusted", "trustedadd", "add-trusted", "trusted-add"]
};

exports.help = {
    name: "trust"
};