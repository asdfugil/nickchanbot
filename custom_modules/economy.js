module.exports = {
    userEconInfo: class {
        /**
         * Economy Info
         * @param bal - Balance of the user (cash and bank)
         * @param inv - user invntory
         * @param cooldowns - Contains time the users last used a command
         */
        constructor(bal, inv, cooldowns) {
            this.bal = bal || {
                cash: 0,
                bank: 0
            }
            this.inv = inv || Object.create(null)
            this.cooldowns = cooldowns || {
                "work": 1,
                "rob": 1,
                "slut": 1,
                "bankrob": 1
            }
        }
        /**
         * Give the user an item
         * @param { string } name - Name of the item
         * @param { number? } amount amount of the item to be given to the user
         */
        giveItem(name,amount) { this.inv[name] ? this.inv[name] += (amount || 1) : this.inv[name] = (amount || 1) }
        /**
         * Take (an) item(s) from the user.
         * @param { string } name - Name of the item
         * @param { number? | "all"? } amount amount of the item to be given to the user
         */
        takeItem(name,amount) { ((amount || "").toLowerCase()) === 'all' ? delete this.inv[name] : this.inv.name -= (amount || 1)}
    }
}