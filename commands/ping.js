module.exports = {
    name: 'ping',
    description: 'returns latency',
    aliases: ['pong'],
    cooldown: 5,
    execute: function (receivedMessage, args) {
        receivedMessage.channel.send(`Pinging...`).then(m => {
            m.edit(
                `
                ========PONG! (Shard ID:${receivedMessage.client.shard.id})=========
• Message edit time                         :: ${m.createdTimestamp -
                receivedMessage.createdTimestamp} ms 
• Discord API heartbeat                     :: ${Math.round(receivedMessage.client.ping)} ms`,
                { code: "asciidoc" }
            );
        });
    }
}
