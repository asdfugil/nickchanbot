const Nkeys = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"api-keys"})
module.exports = {
    name:'generateAPIKey',
    description:'generate an Nick Chan Bot API key',
    aliases:["generate-api-key"],
    cooldown:30,
    async execute(message,args) {
        const keys = await Nkeys.get("keys") || Object.create(null)
        const existingKey = Object.keys(keys).find(x => keys[x] === message.author.id)
        if (existingKey) return message.reply("You don't have an API key yet.")
        message.author.send(existingKey).catch(error => { 
            if (error.code === 50007) message.reply("Please enable your DM.")
            else throw error
        })
    }
}