const Nkeys = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"api-keys"})
module.exports = {
    name:'generateAPIKey',
    description:'generate an Nick Chan Bot API key',
    cooldown:30,
    async execute(message,args) {
        const keys = await Nkeys.get("keys") || Object.create(null)
        const key = message.client.commands.get("randomstring").random(64)
        keys[key] = message.author.id
        Nkeys.set("keys",keys)
        message.author.send(key).catch(error => { 
            if (error.code === 50007) 
        })
    }
}