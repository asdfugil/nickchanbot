const Nkeys = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"api-keys"})
module.exports = {
    name:'generateAPIKey',
    description:'generate an Nick Chan Bot API key',
    aliases:["generate-api-key"],
    cooldown:30,
    async execute(message,args) {
        
        const keys = await Nkeys.get("keys") || Object.create(null)
        console.log(1)
        const existingKey = Object.keys(keys).find(x => keys[x] === message.author.id)
        if (existingKey) delete keys[existingKey]
        const key = message.client.commands.get("randomstring").random(64)
        keys[key] = message.author.id
        console.log(2)
        Nkeys.set("keys",keys)
        message.author.send(key).catch(error => { 
            if (error.code === 50007) message.reply("Please enable your DM.")
            else throw error
        })
    }
}