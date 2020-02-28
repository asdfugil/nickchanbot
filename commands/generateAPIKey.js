const keys = new (require("keyv"))("sqlite://.data/database.sqlite",{namespace:"api-keys"})
module.exports = {
    name:'generateAPIKey',
    description:'generate an Nick Chan Bot API key',
    cooldown:30,
    async execute(message,args) {
        consrt keymessage.client.commands.get("randomstring").random(64)
    }
}