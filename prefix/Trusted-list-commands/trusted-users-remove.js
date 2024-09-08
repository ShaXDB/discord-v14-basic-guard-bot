const { MessageEmbed } = require('discord.js');
const db = require('../../databases/database.js');
const config = require(`../../config.js`);

exports.run = async (client, message, args) => {
    if(message.author.id !== config.ServerOwnerID) return;
    
    const userId = args[0];

    // Kullanıcıyı güvenli listeden çıkarma işlemi
    db.run('DELETE FROM trusted_users WHERE user_id = ?', userId, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Removed ${userId} from the database`);
        message.reply(`Successfully <@${userId}> Named User Removed From Trusted Users!`);
    });
};

exports.conf = {
    aliases: ["untrust", "trusted-users-remove", "removetrusted", "trustedremove", "remove-trusted", "trusted-remove"]
};

exports.help = {
    name: "untrust"
};