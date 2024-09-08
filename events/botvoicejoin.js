var config = require("../config.js");
const client = require("../app.js");
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

client.once('ready', () => {
    connectToVoiceChannel();
});

function connectToVoiceChannel() {
    let botses = config.botVoiceID;
    if (botses) {
        const botseskanali = client.channels.cache.get(botses);
        if (!botseskanali) return console.log(`${botses} ID'li Ses Kanalı Bulunamadı`);

        try {
            const connection = joinVoiceChannel({
                channelId: botseskanali.id,
                guildId: botseskanali.guild.id,
                adapterCreator: botseskanali.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: true
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    console.log('Voice Connection Lost Trying To Reconnect...');
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    console.log('Bot Succesfully Reconnected.');
                } catch (error) {
                    console.error(`There is an Error While Trying To Reconnect Error: ${error}`);
                    connection.destroy();
                    connectToVoiceChannel(); 
                }
            });

            console.log(`Bot Sucessfully Connected To Voice Chhannel Named: ${botseskanali.name}`);
        } catch (error) {
            console.error(`There is an Error While Trying To Connect To Voice, Error: ${error}`);
        }
    }
}