const client = require("../app.js");
const { Collection } = require("discord.js")
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs")
const path = require("path");
const config = require("../config.js");
const { joinVoiceChannel } = require('discord.js');
client.on("ready", () => {

    client.prefixCommands = new Collection();
    client.prefixAliases = new Collection();

    const prefixCommandFolders = fs.readdirSync('./prefix');
    for (const folder of prefixCommandFolders) {
        const folderPath = path.join('./prefix', folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const props = require("../" + filePath);

            console.log(`[COMMAND LOADER] | ${props.help.name}/${folder} Command Loaded!`)
            client.prefixCommands.set(props.help.name, props);

            props.conf.aliases.forEach(alias => {
                client.prefixAliases.set(alias, props.help.name);
            });
        }
    }

    console.log(`➤ | ${client.user.tag} Active! | Developed By ShaX`)
    client.user.setActivity(config.botStatus);

    process.title = config.botStatus
});
