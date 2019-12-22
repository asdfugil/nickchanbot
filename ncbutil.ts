const { Collection } = require('discord.js')
//Internal Types
type Client = {
    channels: Map<Snowflake, TextChannel>
}
type TextChannel = {
    send: (Message: String, Options: Object) => Promise<Object>
}
//External Types
type sendErrorInfo = {
    client: Client
    error: Error
    channelID: Snowflake
}
type Snowflake = string
module.exports = {
    sendError: function (info: sendErrorInfo) {
        info.client.channels.get(info.channelID).send(info.error.stack, { code: "prolog" })
        console.log(info.error)
    },
    botError: function (message: string) {
        var error = new Error(message);
        error.name = "NickChanBotError";
        return error;
    },
    collection2json: function (collection: any) {
        const obj = {};
        if (collection instanceof Collection) {
            for (const key of collection.keys()) {
                const child = collection.get(key);
                if (child instanceof Collection) {
                    obj[key] = this.collection2json(child);
                } else {
                    obj[key] = child;
                }
            }
        } else {
            let error = new Error("Expected class Collection, received class " + collection.constructor.name)
            throw error
        }
    },
    json2colllction: (obj: Object) => {
        const collection = new Collection();
        for (const key of Object.keys(obj)) {
            const child = obj[key];

            if (child != null) {
                if (typeof child === "object") {
                    collection.set(key, this.json2collection(child));
                } else {
                    collection.set(key, child);
                }
            }
        }

        return collection;
    },
    Rank: class {
        xp: number
        guildID: Snowflake
        memberID: Snowflake
        getLevel: () => number
        getLevelXP: () => string
        toString: () => string
        constructor(guildID: Snowflake, memberID: Snowflake, xp) {
            "use strict";
            if (xp) {
                this.xp = xp;
            } else {
                this.xp = 0;
            }
            this.guildID = guildID;
            this.memberID = memberID;
            this.getLevel = function () {
                let xpRequiredToLevelUp = 100;
                let level = 1;
                let xpo = this.xp;
                for (let i = 0; xpo > 0; i++) {
                    xpo = xpo - xpRequiredToLevelUp;
                    xpRequiredToLevelUp += 100;
                    level += 1;
                }
                level -= 1;
                return level;
            };
            this.getLevelXP = function () {
                let xpRequiredToLevelUp = 0;
                let xpo = this.xp;
                for (let i = 0; xpo > 0; i++) {
                    xpo = xpo - xpRequiredToLevelUp;
                    if (xpo > 0) {
                        xpRequiredToLevelUp += 100;
                    }
                    i += 1;
                }
                return Math.floor(xpRequiredToLevelUp + xpo) + "/" + xpRequiredToLevelUp;
            };
            this.toString = function() {
                return this.xp.toString()
            }
        }
    }
}