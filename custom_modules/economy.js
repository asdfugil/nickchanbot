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
    }
}