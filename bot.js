console.log("Starting...");
const { performance } = require("perf_hooks");
const Discord = require("discord.js");
const fs = require("fs");
const moment = require(`moment`);
require("moment-duration-format");
const googleIt = require("google-it");
const fetch = require("node-fetch");
const config = require("./config/config.js");
const util = require("util")
const { Attachment, RichEmbed, Collection, Permissions, version } = require("discord.js");
const EventEmitter = require("events");
const { YTSearcher } = require("ytsearcher");
const client = new Discord.Client()
const sercher = new YTSearcher(config.youTubeAPIKey);
const queue = new Map();
const bot = new EventEmitter();
const guildRanks = new Collection();
const XPCooldowns = new Collection();
let npm;
if (fs.existsSync("./node_modules/npm/")) npm = require("npm"); //devdependencies ,only used in /eval
const ytdl = require("ytdl-core");
function map2json(map) {
    const obj = {};
    for (const key of map.keys()) {
        const child = map.get(key);
        if (child instanceof Map) {
            obj[key] = map2Json(child);
        } else {
            obj[key] = child;
        }
    }
    return obj;
}

function json2map(obj) {
    const map = new Map();
    for (const key of Object.keys(obj)) {
        const child = obj[key];

        if (child != null) {
            if (typeof child === "object") {
                map.set(key, json2Map(child));
            } else {
                map.set(key, child);
            }
        }
    }
    return map;
}
function collection2json(collection) {
    const obj = {};

    for (const key of collection.keys()) {
        const child = collection.get(key);
        if (child instanceof Collection) {
            obj[key] = collection2json(child);
        } else {
            obj[key] = child;
        }
    }
    return obj;
}

function json2collection(obj) {
    const collection = new Collection();
    for (const key of Object.keys(obj)) {
        const child = obj[key];
        if (child != null) {
            if (typeof child === "object") {
                collection.set(key, json2collection(child));
            } else {
                collection.set(key, child);
            }
        }
    }
    return collection;
}
class Rank {
    constructor(guildID, memberID, xp) {
        "use strict";
        if (xp) {
            this.xp = xp;
        } else {
            this.xp = 0;
        }
        this.guildID = guildID;
        this.member = memberID;
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
    }
}
function noPermission(perms) {
    var noPermission = new RichEmbed()
        .setColor("#ffff00")
        .setFooter(client.user.tag, client.user.displayAvatarURL)
        .setTimestamp()
        .setDescription(
            `You don't have the permissions to use this command.\nOnly members with **${perms}** permission(s) can use this command`
        );
    return noPermission;
}
process.on("uncaughtException", async error => {
    console.error(error.stack);
    try {
        client.user.setActivity("❌ uncaughtExpection | Rebooting...");
        fs.writeFileSync("error.log", error.stack);
        if (client.status === 0) {
            await client.channels
                .get(config.expectionChannelID)
                .send(`Uncaught expection \n \`\`\`${error.stack}\`\`\``);
            await client.channels
                .get(config.expectionChannelID)
                .send(new Attachment("error.log"));
        }
    } catch (error) {
        console.error("Error!");
    } finally {
        console.error(error.stack);
        setTimeout(function () {
            process.exit(1);
        }, 20000);
    }
});

process.on("exit", code => {
    console.log("Exit code:" + code);
})
process.on('SIGHUP', () => {
    if (client.status === 0) client.destroy().then(() => {
        process.exit()
    })
})
process.on("unhandledRejection", (error, promise) => {
    fs.writeFileSync("error.log", error.stack);
    if (client.status === 0) {
        client.user.setActivity("⚠️ unhandledRejection");
        client.channels
            .get(config.rejectionChannelID)
            .send(`Unhandlled Rejection \n \`\`\`prolog\n${error.stack}\`\`\`
            Promise: \`\`\`xl\n${util.inspect(promise)}\`\`\`
            `);
        client.channels
            .get(config.rejectionChannelID)
            .send(new Attachment("error.log"));
        setTimeout(function () {
            client.user.setActivity(`/help | ${client.guilds.size} server(s)`);
        }, 10000);
    }
    console.warn(
        `Oops,the following promise rejection is not caught.\n${
        error.stack
        }\n${promise}`
    );
});

bot.on("error", error => console.error(error));
bot.on("missingLogChannel", (channelID, guild, logType) => {
    var settingsExist = fs.existsSync(`./data/${guild.id}.json`);
    if (settingsExist) {
        var serverSettings = JSON.parse(
            fs.readFileSync("./data/" + guild.id + ".json", "utf8")
        );
        eval("serverSettings.logChannels." + logType + "= undefined");
        fs.writeFileSync(
            "./data/" + guild.id + ".json",
            JSON.stringify(serverSettings, null, 2)
        );
        if (serverSettings.logChannels.error != "undefined") {
            const embed = new RichEmbed()
                .setTitle("Error : Missing log channel")
                .setDescription(
                    "Likely due to the channel being deleted\nlog channel type : " +
                    logType +
                    "\n log channel ID: " +
                    channelID +
                    "\n\nThe log channel has been deleted from the settings."
                )
                .setAuthor(guild.name, guild.iconURL)
                .setColor("#ff0000")
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(serverSettings.logChannels.error) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    serverSettings.logChannels.error,
                    guild,
                    "error"
                );
            client.channels.get(serverSettings.logChannels.error).send(embed);
        }
    }
});
client.on("message", receivedMessage => {
    const processStart = performance.now();
    try {
        if (receivedMessage.author == client.user) {
            // Prevent bot from responding to its own messages
            return;
        }
        if (!receivedMessage.guild) return
        if (receivedMessage.guild) {
            //If in a server....
            const settingsExist = fs.existsSync(
                `./data/${receivedMessage.guild.id}.json`
            );
            if (settingsExist) {
                //If settings exist
                let serverSettings = JSON.parse(
                    fs.readFileSync(
                        "./data/" + receivedMessage.guild.id + ".json",
                        "utf8"
                    )
                );
                if (typeof serverSettings.logChannels.message != "undefined") {
                    if (receivedMessage.content) {
                        const embed = new RichEmbed()
                            .setTitle("Message Log")
                            .setAuthor(
                                receivedMessage.author.tag,
                                receivedMessage.author.displayAvatarURL
                            )
                            .setDescription(receivedMessage.content)
                            .addField("Channel", receivedMessage.channel)
                            .setColor("#28b9de")
                            .setTimestamp()
                            .setFooter("Nick Chan#5213", client.user.displayAvatarURL);
                        if (
                            typeof client.channels.get(serverSettings.logChannels.message) ==
                            "undefined"
                        )
                            return bot.emit(
                                "missingLogChannel",
                                serverSettings.logChannels.message,
                                receivedMessage.guild,
                                "message"
                            );
                        client.channels.get(serverSettings.logChannels.message).send(embed);
                    }
                }
                if (!receivedMessage.author.bot) {
                    processRank(receivedMessage);
                    if (receivedMessage.content.startsWith(config.prefix)) processCommand(receivedMessage, serverSettings, processStart);
                }
            } else {
                const rawData = JSON.parse(
                    fs.readFileSync("defaultServerSettings.json", "utf8")
                );
                const data = JSON.stringify(rawData, null, 2);
                fs.writeFile(
                    "./data/" + receivedMessage.guild.id + ".json",
                    data,
                    err => {
                        try {
                            if (err) throw err;
                            console.log("Setting created for server.");
                        } catch (error) {
                            receivedMessage.channel.send(
                                `An Error occured.. \n\n \`${error.name}:${error.message}\``
                            );
                            console.error(error.stack);
                        }
                    }
                );
                if (!receivedMessage.author.bot) {
                    processRank(receivedMessage);
                    if (receivedMessage.content.startsWith(config.prefix)) processCommand(receivedMessage, serverSettings, processStart);
                }
            }
        } else {
            if (receivedMessage.author.bot) return
            let serverSettings = null;
            if (receivedMessage.content.startsWith(config.prefix)) processCommand(receivedMessage, serverSettings, processStart);
        }
    } catch (error) {
        sendError(error, receivedMessage);
    }
});
async function processRank(receivedMessage) {
    if (XPCooldowns.get(receivedMessage.guild.id).has(receivedMessage.author.id))
        return;
    if (!guildRanks.get(receivedMessage.guild.id).has(receivedMessage.author.id))
        guildRanks.get(receivedMessage.guild.id).set(receivedMessage.author.id, 0);
    const newXP = Math.floor(
        guildRanks.get(receivedMessage.guild.id).get(receivedMessage.author.id) +
        (18 - Math.round(Math.random() * 10))
    );
    guildRanks
        .get(receivedMessage.guild.id)
        .set(receivedMessage.author.id, newXP);
    XPCooldowns.get(receivedMessage.guild.id).set(receivedMessage.author.id, true);
    setTimeout(function () {
        XPCooldowns.get(receivedMessage.guild.id).delete(receivedMessage.author.id);
    }, 60000);
    return;
}
client.on("typingStart", (channel, user) => {
    if (!channel.guild) return;
    var settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${channel.guild.id}.json`, "utf8")
        );
        if (typeof settings.logChannels.startTyping != "undefined") {
            const embed = new Discord.RichEmbed()
                .setTitle("Start Typing Log")
                .setAuthor(user.tag, user.displayAvatarURL)
                .setDescription(`${user.tag} started typing in ${channel}.`)
                .setColor("#ffffff")
                .setTimestamp()
                .setFooter("Nick Chan#5213", client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.startTyping) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.startTyping,
                    channel.guild,
                    "startTyping"
                );
            client.channels.get(settings.logChannels.startTyping).send(embed);
        }
    }
});
client.on("typingStop", (channel, user) => {
    if (!channel.guild) return;
    var settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${channel.guild.id}.json`, "utf8")
        );
        if (typeof settings.logChannels.stopTyping != "undefined") {
            const embed = new Discord.RichEmbed()
                .setTitle("Stop Typing Log")
                .setAuthor(user.tag, user.displayAvatarURL)
                .setDescription(`${user.tag} stoped typing in ${channel}.`)
                .setColor("#ffffff")
                .setTimestamp()
                .setFooter("Nick Chan#5213", client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.startTyping) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.stopTyping,
                    channel.guild,
                    "stopTyping"
                );
            client.channels.get(settings.logChannels.stopTyping).send(embed);
        }
    }
});
client.on("channelCreate", async channel => {
    if (!channel.guild) return;
    var settingsExist = fs.existsSync(`./data/${channel.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${channel.guild.id}.json`, "utf8")
        );
        if (typeof settings.logChannels.channelCreate != "undefined") {
            var perms = await channel.permissionsFor(channel.guild.defaultRole);
            var object = await perms.serialize();
            if (channel.type == "voice") {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel created")
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField("Name", channel.name)
                    .addField("Type", channel.type)
                    .addField("Channel ID", channel.id)
                    .setColor("#00e622");
                if (
                    typeof client.channels.get(settings.logChannels.channelCreate) ==
                    "undefined"
                )
                    return bot.emit(
                        "missingLogChannel",
                        settings.logChannels.channelCreate,
                        channel.guild,
                        "channelCreate"
                    );
                client.channels.get(settings.logChannels.channelCreate).send(embed);
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel created")
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField("Name", channel)
                    .addField("Type", channel.type)
                    .addField("Channel ID", channel.id)
                    .setColor("#00e622");
                client.channels.get(settings.logChannels.channelCreate).send(embed);
            }
            channel.guild.roles.forEach(role => {
                var perms = channel.permissionsFor(role);
                var object = perms.serialize();
                var overWrites = JSON.stringify(object, null, 2);
                const embed = new Discord.RichEmbed()
                    .addField(
                        `Permissions overwrites for ${role.name}.`,
                        `\`\`\`json\n${overWrites}\`\`\``
                    )
                    .setColor("#00e622");
                client.channels.get(settings.logChannels.channelCreate).send(embed);
            });
            const embed = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
                .setColor("#00e622")
                .setTimestamp();
            client.channels.get(settings.logChannels.channelCreate).send(embed);
        }
    }
});
client.once("ready", () => {
    client.guilds.forEach(guild => {
        const settingsExist = fs.existsSync(`./data/${guild.id}.json`);
        if (!settingsExist)
            fs.writeFileSync(
                `./data/${guild.id}.json`,
                fs.readFileSync("./defaultServerSettings.json"),
                "utf8"
            );
        let { ranks } = JSON.parse(
            fs.readFileSync(`./data/${guild.id}.json`, "utf8")
        ); //Extract the ranks property
        if (typeof ranks == "undefined") {
            ranks = {};
        }
        guildRanks.set(guild.id, json2collection(ranks)); //maps in maps
        XPCooldowns.set(guild.id, new Collection());
        setInterval(function () {
            let settings = JSON.parse(
                fs.readFileSync(`./data/${guild.id}.json`, "utf8")
            );
            ranks = collection2json(guildRanks.get(guild.id)); //map => json
            if (
                JSON.stringify(ranks, null, 2) ===
                JSON.stringify(settings.ranks, null, 2)
            )
                return; //If it is the same,don't do anything
            settings.ranks = ranks;
            fs.writeFileSync(
                `./data/${guild.id}.json`,
                JSON.stringify(settings, null, 2)
            );
        }, 30000);
    });
});
client.on("channelUpdate", async (oldChannel, channel) => {
    if (JSON.stringify(oldChannel) == JSON.stringify(channel)) return;
    if (!oldChannel.guild) return;
    var settingsExist = fs.existsSync(`./data/${oldChannel.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${oldChannel.guild.id}.json`, "utf8")
        );
        if (typeof settings.logChannels.channelUpdate != "undefined") {
            if (
                typeof client.channels.get(settings.logChannels.channelUpdate) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.channelUpdate,
                    channel.guild,
                    "channelUpdate"
                );
            var perms = await oldChannel.permissionsFor(oldChannel.guild.defaultRole);
            var object = await perms.serialize();
            if (oldChannel.type == "voice") {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel Updated (before)")
                    .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                    .addField("Name", oldChannel.name)
                    .addField("Type", oldChannel.type)
                    .addField("Channel ID", oldChannel.id)
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel Updated (Before)")
                    .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                    .addField("Name", oldChannel.name)
                    .addField("Type", oldChannel.type)
                    .addField("Channel ID", oldChannel.id)
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            }
            oldChannel.guild.roles.forEach(role => {
                var perms = oldChannel.permissionsFor(role);
                var object = perms.serialize();
                var overWrites = JSON.stringify(object, null, 2);
                const embed = new Discord.RichEmbed()
                    .addField(
                        `Old Permissions overwrites for ${role.name}.`,
                        `\`\`\`json\n${overWrites}\`\`\``
                    )
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            });
            const embed = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
                .setColor("#b3ff00")
                .setTimestamp();
            client.channels.get(settings.logChannels.channelUpdate).send(embed);
            if (channel.type == "voice") {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel Updated (After)")
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField("Name", channel.name)
                    .addField("Type", channel.type)
                    .addField("Channel ID", channel.id)
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle("Channel Updated (After)")
                    .setAuthor(channel.guild.name, channel.guild.iconURL)
                    .addField("Name", channel)
                    .addField("Type", channel.type)
                    .addField("Channel ID", channel.id)
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            }
            channel.guild.roles.forEach(role => {
                var perms = channel.permissionsFor(role);
                var object = perms.serialize();
                var overWrites = JSON.stringify(object, null, 2);
                const embed = new Discord.RichEmbed()
                    .addField(
                        `New Permissions overwrites for ${role.name}.`,
                        `\`\`\`json\n${overWrites}\`\`\``
                    )
                    .setColor("#b3ff00");
                client.channels.get(settings.logChannels.channelUpdate).send(embed);
            });
            const embed1 = new Discord.RichEmbed()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
                .setColor("#b3ff00")
                .setTimestamp();
            client.channels.get(settings.logChannels.channelUpdate).send(embed1);
        }
    }
});
client.on("channelDelete", oldChannel => {
    if (!oldChannel.guild) return;
    var settingsExist = fs.existsSync(`./data/${oldChannel.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${oldChannel.guild.id}.json`, "utf8")
        );
        if (typeof settings.logChannels.channelDelete != "undefined") {
            const embed = new Discord.RichEmbed()
                .setTitle("Channel Deleted")
                .setAuthor(oldChannel.guild.name, oldChannel.guild.iconURL)
                .addField("Name", oldChannel.name)
                .addField("Type", oldChannel.type)
                .addField("Channel ID", oldChannel.id)
                .setColor("#ff0000")
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.channelDelete) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.channelDetete,
                    oldChannel.guild,
                    "channelDelete"
                );
            client.channels.get(settings.logChannels.channelDelete).send(embed);
        }
    }
});
client.on("guildMemberAdd", newMember => {
    var settingsExist = fs.existsSync(`./data/${newMember.guild.id}.json`);
    guildRanks.get(newMember.guild.id).set(newMember.user.id, 0);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${newMember.guild.id}.json`)
        );
        if (typeof settings.logChannels.guildMemberAdd == "undefined") return;
        const embed = new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
            .setColor("#00fff2")
            .setTitle("Member Joined")
            .setDescription(newMember + " has joined.")
            .setThumbnail(newMember.user.displayAvatarURL)
            .setFooter(client.user.tag, client.user.displayAvatarURL)
            .setTimestamp();
        if (
            typeof client.channels.get(settings.logChannels.guildMemberAdd) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.guildMemberAdd,
                newMember.guild,
                "guildMemberAdd"
            );
        client.channels.get(settings.logChannels.guildMemberAdd).send(embed);
    }
});
client.on("guildMemberRemove", newMember => {
    if (guildRanks.get(newMember.guild.id).has(newMember.user.id))
        guildRanks.get(newMember.guild.id).delete(newMember.user.id);
    var settingsExist = fs.existsSync(`./data/${newMember.guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(
            fs.readFileSync(`./data/${newMember.guild.id}.json`)
        );
        if (typeof settings.logChannels.guildMemberRemove == "undefined") return;
        const embed = new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
            .setColor("#00fff2")
            .setTitle("Member left")
            .setDescription(newMember + " has left.")
            .setThumbnail(newMember.user.displayAvatarURL)
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL);
        if (
            typeof client.channels.get(settings.logChannels.guildMemberRemove) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.guildMemberRemove,
                newMember.guild,
                "guildMemberRemove"
            );
        client.channels.get(settings.logChannels.guildMemberRemove).send(embed);
    }
});
client.on("guildBanRemove", (guild, user) => {
    var settingsExist = fs.existsSync(`./data/${guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(fs.readFileSync(`./data/${guild.id}.json`));
        if (typeof settings.logChannels.guildBanRemove == "undefined") return;
        const embed = new Discord.RichEmbed()
            .setAuthor(user.tag, user.displayAvatarURL)
            .setColor("#00fff2")
            .setTitle("User unbanned")
            .setDescription(user.tag + " has been unbanned.")
            .setThumbnail(user.displayAvatarURL)
            .setFooter(client.user.tag, client.user.displayAvatarURL)
            .setTimestamp();
        if (
            typeof client.channels.get(settings.logChannels.guildBanRemove) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.guildMemberRemove,
                guild,
                "guildBanRemove"
            );
        client.channels.get(settings.logChannels.guildBanRemove).send(embed);
    }
});
client.on("guildBanAdd", (guild, user) => {
    var settingsExist = fs.existsSync(`./data/${guild.id}.json`);
    if (settingsExist) {
        var settings = JSON.parse(fs.readFileSync(`./data/${guild.id}.json`));
        if (typeof settings.logChannels.guildBanAdd == "undefined") return;
        const embed = new Discord.RichEmbed()
            .setAuthor(user.tag, user.displayAvatarURL)
            .setColor("#00fff2")
            .setTitle("User banned")
            .setDescription(user.tag + " has been banned.")
            .setThumbnail(user.displayAvatarURL)
            .setFooter(client.user.tag, client.user.displayAvatarURL)
            .setTimestamp();
        if (
            typeof client.channels.get(settings.logChannels.guildBanAdd) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.guildBanAdd,
                newMember.guild,
                "guildBanAdd"
            );
        client.channels.get(settings.logChannels.guildBanAdd).send(embed);
    }
});
client.on("reconnect", () => {
    console.log("reconnecting...");
});
client.on("messageDelete", DeletedMessage => {
    if (!DeletedMessage.guild) return;
    var settings = JSON.parse(
        fs.readFileSync("./data/" + DeletedMessage.guild.id + ".json", "utf8")
    );
    if (typeof settings.logChannels.messageDelete != "undefined") {
        if (DeletedMessage.content) {
            const embed = new Discord.RichEmbed()
                .setTitle("Message deletion Log")
                .setAuthor(
                    DeletedMessage.author.tag,
                    DeletedMessage.author.displayAvatarURL
                )
                .setDescription(DeletedMessage.content)
                .addField("Channel", DeletedMessage.channel)
                .setColor("#ff0000")
                .setTimestamp()
                .setFooter("Nick Chan#5213", client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.messageDelete) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.messageDelete,
                    DeletedMessage.guild,
                    "messageDelete"
                );
            client.channels.get(settings.logChannels.messageDelete).send(embed);
        }
    }
});
client.on("messageDeleteBulk", deletedMessages => {
    var settings = JSON.parse(
        fs.readFileSync(
            "./data/" + deletedMessages.first().guild.id + ".json",
            "utf8"
        )
    );
    if (typeof settings.logChannels.messageDeleteBulk != "undefined") {
        const embed = new Discord.RichEmbed()
            .setTitle("Bulk message deletion Log")
            .setAuthor(
                deletedMessages.first().guild.name,
                deletedMessages.first().guild.iconURL
            )
            .setDescription(deletedMessages.size + " messages deleted")
            .addField("Channel", deletedMessages.first().channel)
            .setColor("#f705ff")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL);
        if (
            typeof client.channels.get(settings.logChannels.messageDeleteBulk) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.messageDeleteBulk,
                deletedMessages.first().guild,
                "messageDeleteBulk"
            );
        client.channels.get(settings.logChannels.messageDeleteBulk).send(embed);
    }
});
client.on("messageUpdate", (oldMessage, newMessage) => {
    if (newMessage.author == client.user) return;
    if (!newMessage.guild) return;
    if (newMessage.content == "") return;
    var settings = JSON.parse(
        fs.readFileSync("./data/" + newMessage.guild.id + ".json", "utf8")
    );
    if (oldMessage.content.length > 1000) {
        var trimmedOld = oldMessage.content.substring(0, 1000) + "...";
        var trimmedNew = newMessage.content.substring(0, 1000) + "...";
        if (newMessage.content.length < 1000) {
            trimmedNew = newMessage.content;
        }
        if (
            typeof client.channels.get(settings.logChannels.messageUpdate) ==
            "undefined"
        )
            return bot.emit(
                "missingLogChannel",
                settings.logChannels.messageUpdate,
                newMessage.guild,
                "messageUpdate"
            );
        if (typeof settings.logChannels.messageUpdate != "undefined") {
            const embed = new Discord.RichEmbed()
                .setTitle("Message Updated")
                .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL)
                .addField("Channel", newMessage.channel)
                .addField("Old message content", trimmedOld)
                .addField("New message Content", trimmedNew)
                .setColor("#cffc03")
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.messageUpdate) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.messageUpdate,
                    newMember.guild,
                    "messageUpdate"
                );
            client.channels.get(settings.logChannels.messageUpdate).send(embed);
        }
    } else {
        if (typeof settings.logChannels.messageUpdate != "undefined") {
            var trimmedOld = oldMessage.content.substring(0, 1000);
            var trimmedNew = newMessage.content.substring(0, 1000);
            if (newMessage.content.length > 1000) {
                trimmedNew = trimmedNew + "...";
            }
            const embed = new Discord.RichEmbed()
                .setTitle("Message Updated")
                .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL)
                .addField("Channel", newMessage.channel)
                .addField("Old message content", trimmedOld)
                .addField("New message Content", trimmedNew)
                .setColor("#cffc03")
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.messageUpdate) !=
                "undefined"
            ) {
                client.channels.get(settings.logChannels.messageUpdate).send(embed);
            } else {
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.messageUpdate,
                    newMessage.guild,
                    "messageUpdate"
                );
            }
        }
    }
});
client.on("emojiCreate", emoji => {
    var settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`);
    var settings = JSON.parse(
        fs.readFileSync(`./data/${emoji.guild.id}.json`, "utf8")
    );
    if (typeof settings.logChannels.emojiCreate != "undefined") {
        if (settingsExist) {
            emoji.fetchAuthor().then(user => {
                const embed = new Discord.RichEmbed()
                    .setAuthor(user.tag, user.displayAvatarURL)
                    .setColor("#00ff00")
                    .setDescription(emoji.toString())
                    .setTitle("Emoji Created")
                    .addField("Name", emoji.name)
                    .addField("Animated", emoji.animated)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL);
                if (
                    typeof client.channels.get(settings.logChannels.emojiCreate) ==
                    "undefined"
                )
                    return bot.emit(
                        "missingLogChannel",
                        settings.logChannels.emojiCreate,
                        emoji.guild,
                        "emojiCreate"
                    );
                client.channels.get(settings.logChannels.emojiCreate).send(embed);
            });
        }
    }
});
client.on("emojiDelete", emoji => {
    var settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`);
    var settings = JSON.parse(
        fs.readFileSync(`./data/${emoji.guild.id}.json`, "utf8")
    );
    if (typeof settings.logChannels.emojiDelete != "undefined") {
        if (settingsExist) {
            const embed = new Discord.RichEmbed()
                .setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor("#ff0000")
                .setDescription(emoji.toString())
                .setTitle("Emoji Deleted")
                .addField("Name", emoji.name)
                .addField("Animated", emoji.animated)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.emojiDelete) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.emojiDelete,
                    emoji.guild,
                    "emojiDelete"
                );
            client.channels.get(settings.logChannels.emojiDelete).send(embed);
        }
    }
});
client.on("emojiUpdate", (Oldemoji, emoji) => {
    var settingsExist = fs.existsSync(`./data/${emoji.guild.id}.json`);
    var settings = JSON.parse(
        fs.readFileSync(`./data/${emoji.guild.id}.json`, "utf8")
    );
    if (typeof settings.logChannels.emojiUpdate != "undefined") {
        if (settingsExist) {
            const embed = new Discord.RichEmbed()
                .setAuthor(emoji.guild.name, emoji.guild.iconURL)
                .setColor("#4287f5")
                .setDescription(emoji.toString())
                .setTitle("Emoji Updated")
                .addField("Name (before)", Oldemoji.name)
                .addField("Name (after)", emoji.name)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL);
            if (
                typeof client.channels.get(settings.logChannels.emojiUpdate) ==
                "undefined"
            )
                return bot.emit(
                    "missingLogChannel",
                    settings.logChannels.emojiUpdate,
                    emoji.guild,
                    "emojiUpdate"
                );
            client.channels.get(settings.logChannels.emojiUpdate).send(embed);
        }
    }
});
client.on("guildDelete", guild => {
    try {
        fs.unlink(`./data/${guild.id}.json`, err => {
            if (err) {
                console.error(err);
                return;
            }
        });
    } catch (error) {
        console.error(error.stack);
    }
});
client.on("guildCreate", guild => {
    client.shard
        .fetchClientValues("guilds.size")
        .then(result =>
            client.user.setActivity(
                config.prefix +
                "help | " +
                result.reduce((prev, guildCount) => prev + guildCount, 0) +
                " server(s)"
            )
        );
    var rawData = JSON.parse(
        fs.readFileSync("defaultServerSettings.json", "utf8")
    );
    var data = JSON.stringify(rawData, null, 2);
    fs.writeFile("./data/" + guild.id + ".json", data, err => {
        try {
            if (err) throw err;
            console.log("Setting created for new server.");
        } catch (error) {
            guild.systemChannel.send(
                `An Error occured.. \n\n \`${error.name}:${error.message}\``
            );
            console.error(error.stack);
        }
        if (!err) {
            const settingsExist = fs.existsSync(`./data/${guild.id}.json`);
            if (!settingsExist)
                fs.writeFileSync(
                    `./data/${guild.id}.json`,
                    fs.readFileSync("./defaultServerSettings.json"),
                    "utf8"
                );
            let { ranks } = JSON.parse(
                fs.readFileSync(`./data/${guild.id}.json`, "utf8")
            ); //Extract the ranks property
            if (typeof ranks == "undefined") {
                ranks = {};
            }
            guildRanks.set(guild.id, json2collection(ranks)); //collection in collection
            XPCooldowns.set(guild.id, new Collection());
            setInterval(function () {
                let settings = JSON.parse(
                    fs.readFileSync(`./data/${guild.id}.json`, "utf8")
                );
                ranks = collection2json(guildRanks.get(guild.id)); //collection => json
                if (
                    JSON.stringify(ranks, null, 2) ===
                    JSON.stringify(settings.ranks, null, 2)
                )
                    return; //If it is the same,don't do anything
                settings.ranks = ranks;
                fs.writeFileSync(
                    `./data/${guild.id}.json`,
                    JSON.stringify(settings, null, 2)
                ); //keep other data unchanged
            }, 30000);
        }
    });
});
client.on("roleCreate", role => {
    const settingsExist = fs.existsSync(`./data/${role.guild.id}.json`)
    if (settingsExist) {
        const settings = JSON.parse(fs.readFileSync(`./data/${role.guild.id}.json`))
        if (typeof settings.logChannels.roleCreate != "undefined") {
            const perms = "```json\n" + JSON.stringify(new Permissions(role.permissions).serialize(), null, 2) + "```"
            const embed = new RichEmbed()
                .setTitle("Role Created")
                .setColor("#00ff00")
                .setAuthor(role.guild.name, role.guild.iconURL)
                .setTimestamp(role.createdTimestamp)
                .setFooter(client.user.tag, client.user.displayAvatarURL)
                .addField("Name", role.toString())
                .addField("ID", role.id)
                .addField("Mentionable", role.mentionable)
                .addField("Hoisted", role.hoist)
                .addField("Hex Colour", role.hexColor)
                .addField("Position", role.position)
                .addField("Auto-Managed", role.managed)
                .addField("Permissions", perms)
            if (!client.channels.has(settings.logChannels.roleCreate)) return bot.emit("missingLogChannel", settings.logChannels.roleCreate, role.guild, "roleCreate")
            client.channels.get(settings.logChannels.roleCreate).send(embed)
        }
    }
})
client.on("roleUpdate", (oldRole, newRole) => {
    const settingsExist = fs.existsSync(`./data/${newRole.guild.id}.json`)
    if (settingsExist) {
        const settings = JSON.parse(fs.readFileSync(`./data/${oldRole.guild.id}.json`, "utf8"))
        if (typeof settings.logChannels.roleUpdate != "undefined") {
            const oldPerms = new Permissions(oldRole.permissions).serialize()
            const newPerms = new Permissions(newRole.permissions).serialize()
            let changes = 'None'
            let changesInPermission = new String("None")
            for (const [oldKey, oldValue] of Object.entries(oldRole)) {
                if (!['name', 'mentionable', 'hoist', 'color', 'position'].includes(oldKey)) continue
                if (oldValue === newRole[oldKey]) continue
                changes += `\n${oldKey}: ${oldValue} --> ${newRole[oldKey]}`
            }
            for (const [oldPermsName, oldPermsValue] of Object.entries(oldPerms)) {
                if (oldPermsValue === newPerms[oldPermsName]) continue
                changesInPermission += `\n${oldPermsName}: ${oldPermsValue} --> ${newPerms[oldPermsName]}`
            }
            if (!changesInPermission.endsWith("None")) changesInPermission = changesInPermission.substr(5)
            if (!changes.endsWith("None")) changes = changes.substr(5)
            const embed = new RichEmbed()
                .setTitle(`Role "${oldRole.name}" Updated`)
                .setAuthor(newRole.guild.name, newRole.guild.iconURL)
                .setDescription(`${newRole.toString()}\n**Role ID** : ${newRole.id}`)
                .addField("Changes (expect permissions)", changes)
                .addField("Chnages in permissions", changesInPermission)
                .setColor('#b7eb34')
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
            if (!client.channels.has(settings.logChannels.roleUpdate)) return bot.emit("missingLogChannel", settings.logChannels.roleUpdate, role.guild, "roleUpdate")
            client.channels.get(settings.logChannels.roleUpdate).send(embed)
        }
    }
})
client.on("roleDelete", role => {
    if (fs.existsSync(`./data/${role.guild.id}.json`)) {
        const settings = JSON.parse(fs.readFileSync(`./data/${role.guild.id}.json`, 'utf8'))
        if (typeof settings.logChannels.roleDelete !== 'undefined') {
            const embed = new RichEmbed()
                .setColor('#ff0000')
                .setAuthor(role.guild.name, role.guild.iconURL)
                .setTitle(`Role "${role.name}" deleted`)
                .addField('Role ID', role.id)
                .addField('Auto-managed', role.managed)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL)
            if (!client.channels.has(settings.logChannels.roleUpdate)) return bot.emit("missingLogChannel", settings.logChannels.roleDelete, role.guild, "roleDelete")
            client.channels.get(settings.logChannels.roleDelete).send(embed)
        }
    }
})
client.on("raw", packet => {

})
client.on("error", console.error);
client.on("ready", () => {
    console.log("Connected as " + client.user.tag);
    client.shard
        .broadcastEval("this.guilds.size")
        .then(result =>
            client.user.setActivity(
                config.prefix +
                "help | " +
                result.reduce((prev, guildCount) => prev + guildCount, 0) +
                " server(s)"
            )
        );
});
function sendError(error, receivedMessage) {
    var message = receivedMessage.channel.send(
        `An Error occured.. \n\n \`\`\`prolog\n${error.stack}\`\`\``
    );
    console.error(error.stack);
    return message;
}
function botError(message) {
    var error = new Error(message);
    error.name = "NickChanBotError";
    return error;
}
function processCommand(receivedMessage, serverSettings, processStart) {
    try {
        const fullCommand = receivedMessage.content.substr(1); // Remove the prefix
        const splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
        const primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
        const arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
        let serverQueue = null;
        if (receivedMessage.guild)
            serverQueue = queue.get(receivedMessage.guild.id); //Music queue
        console.log(`${receivedMessage.author.tag} has sent a command`);
        console.log(" Command received: " + primaryCommand);
        console.log(" Arguments: " + arguments); // There may not be any arguments

        if (primaryCommand === "help") helpCommand(arguments, receivedMessage)
        else if (primaryCommand === "multiply") multiplyCommand(arguments, receivedMessage)
        else if (primaryCommand === "spam") spamCommand(arguments, receivedMessage)
        else if (primaryCommand === "spam-ping") spamPingCommand(arguments, receivedMessage)
        else if (primaryCommand === "changelogs") ChangelogsCommand(receivedMessage)
        else if (primaryCommand === "kick") kickCommand(arguments, receivedMessage)
        else if (primaryCommand === "about") aboutCommand(receivedMessage)
        else if (primaryCommand === "ping") pingCommand(receivedMessage, processStart)
        else if (primaryCommand === "ban") banCommand(arguments, receivedMessage)
        else if (primaryCommand === "purge") purgeCommand(arguments, receivedMessage)
        else if (primaryCommand === "reconnect") reconnectCommand(receivedMessage)
        else if (primaryCommand === "8ball") eightBallCommand(arguments, receivedMessage)
        else if (primaryCommand === "dog") dogCommand(receivedMessage)
        else if (primaryCommand === "unban") unbanCommand(arguments, receivedMessage)
        else if (primaryCommand === "say") sayCommand(arguments, receivedMessage)
        else if (primaryCommand === "cat") catCommand(receivedMessage)
        else if (primaryCommand === "randomstring") randomStringCommand(arguments, receivedMessage)
        else if (primaryCommand === "randomelement") randomElementCommand(receivedMessage)
        else if (primaryCommand === "server-info") serverInfoCommand(arguments, receivedMessage)
        else if (primaryCommand === "logs") logsCommand(receivedMessage)
        else if (primaryCommand === "stats") statsCommand(receivedMessage)
        else if (primaryCommand === "googlesearch") googleSearchCommand(arguments, receivedMessage)
        else if (primaryCommand === "eval") evalCommand(arguments, receivedMessage)
        else if (primaryCommand === "config") configCommand(arguments, receivedMessage, serverSettings)
        else if (primaryCommand === "embed-spam") embedSpamCommand(arguments, receivedMessage)
        else if (primaryCommand === "user-info") userInfoCommand(arguments, receivedMessage)
        else if (primaryCommand === "nekos-life") nekosLifeCommand(arguments, receivedMessage)
        else if (primaryCommand === `play`) execute(receivedMessage, serverQueue)
        else if (primaryCommand === `skip`) skip(receivedMessage, serverQueue)
        else if (primaryCommand === `stop`) stop(receivedMessage, serverQueue)
        else if (primaryCommand === `queue`) queueCommand(receivedMessage, serverQueue, arguments)
        else if (primaryCommand === `now-playing`) nowPlaying(receivedMessage, serverQueue)
        else if (primaryCommand === "errors") errorsCommand(arguments, receivedMessage)
        else if (primaryCommand === "rank") rankCommand(arguments, receivedMessage)


    } catch (error) {
        sendError(error, receivedMessage);
    }
}
function clean(text) {
    if (typeof text === "string")
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}
async function evalCommand(arguments, receivedMessage) {
    if (receivedMessage.author.id !== config.ownerID) return;
    try {
        const code = arguments.join(" ");
        let evaled = await eval(code);

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        if (clean(evaled).length < 1980)
            receivedMessage.channel.send(clean(evaled), { code: "xl" });
        fs.writeFileSync("../tmp/result.log", clean(evaled));
        receivedMessage.channel.send(new Attachment("../tmp/result.log"));
    } catch (err) {
        receivedMessage.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}
function errorsCommand(arguments, receivedMessage) {
    receivedMessage.channel.send(new Attachment("errors.log"));
}
async function googleSearchCommand(arguments, receivedMessage) {
    receivedMessage.channel.send(
        "Searching for:`" + arguments.slice(0).join(" ") + "`"
    );
    googleIt({ query: arguments.slice(0).join(" ") })
        .then(results => {
            var orderedResult = JSON.stringify(results, null, 2);
            receivedMessage.channel
                .send(`\`\`\`json\n${orderedResult}\`\`\``)
                .then(m => {
                    receivedMessage.channel.send(
                        "Search time is:" +
                        (m.createdTimestamp - receivedMessage.createdTimestamp) +
                        "ms"
                    );
                });
        })
        .catch(error => {
            sendError(error, receivedMessage);
        });
}
function processTrigger(receivedMessage) {
    if (
        [`<@${client.user.id}>`, `<@!${client.user.id}>`].some(x => receivedMessage.content.startsWith(x))
    ) {
        introTrigger(receivedMessage);
    } else if (
        receivedMessage.content.includes("@everyone") ||
        receivedMessage.content.includes("@here")
    ) {
        mentionEveryoneTrigger(receivedMessage);
    } else {
        return;
    }
}
function mentionEveryoneTrigger(receivedMessage) {
    if (receivedMessage.guild == null) return;
    if (
        receivedMessage.channel.permissionsFor(receivedMessage.member).serialize()
            .MENTION_EVERYONE
    )
        return;
    receivedMessage.channel.send(
        `${receivedMessage.author.toString()},don't tell me that you think this would work.`
    );
    const youTried = client.emojis.get(config.youTriedEmojiID);
    receivedMessage.react(youTried);
}
function introTrigger(receivedMessage) {
    receivedMessage.channel.send(
        `Hi! my prefix is \`${config.prefix}\` \n To get started type \`/help\``
    );
}
async function reconnectCommand(receivedMessage) {
    if (receivedMessage.author.id == "570634232465063967") {
        receivedMessage.channel.send("Reconnecting...").then(() => {
            client.destroy().then(() => {
                client
                    .login(config.token)
                    .catch(error => {
                        console.error("Unable to reconnect");
                        console.error(error.stack);
                    })
                    .then(() => {
                        receivedMessage.channel.send("Successfully reconnected");
                    });
            });
        });
    } else {
        receivedMessage.channel.send("Only the bot onwer can reload the bot");
    }
}
/**
 * Provides help to the end user.
*/
function helpCommand(arguments, receivedMessage) {
    if (arguments == "multiply") {
        receivedMessage.channel.send(
            "Description : Multiply two or more numbers \n Usage:`multiply [number]  [number]  ( [number]...)`"
        );
    } else if (arguments == "help") {
        receivedMessage.channel.send(
            "Description : get help about the bot or a specific command \n Usage: `help ([String])`"
        );
    } else if (arguments == "spam") {
        receivedMessage.channel.send(
            "Description: Spams \n Usage: `spam [number]`"
        );
    } else if (arguments == "spam-ping") {
        receivedMessage.channel.send(
            "Description: Spam pinging everyone \n Usage: `spam-ping [number]`"
        );
    } else if (arguments == "changelogs") {
        receivedMessage.channel.send("Changelogs of the bot.");
    } else if (arguments == "kick") {
        receivedMessage.channel.send(
            "Description:Kicks a member \n Usage:Kick [member] ([reason])"
        );
    } else if (arguments == "About") {
        receivedMessage.channel.send(
            "Description:Send a README.md file about the bot \n Usage: `About`"
        );
    } else if (arguments == "ping") {
        receivedMessage.channel.send("Description : returns latency");
    } else if (arguments == "ban") {
        receivedMessage.channel.send(
            `Description:bans a member. Usage: \`ban [mention] ([reason])\``
        );
    } else if (arguments == "purge") {
        receivedMessage.channel.send(
            "Description: bulk delete messages \n Usage: purge [count]"
        );
    } else if (arguments == "8ball") {
        receivedMessage.channel.send(
            "Description: Ask 8ball a question \n Usage: 8ball [question]"
        );
    } else if (arguments == "dog" || arguments == "cat") {
        receivedMessage.channel.send(
            `Description:send a photo of a ${arguments[0]} \n Usage: ${arguments[0]}`
        );
    } else if (arguments == "say") {
        receivedMessage.channel.send(
            "Description:Use the bot to say something \n Usage: `say [message]`"
        );
    } else if (arguments == "randomstring") {
        receivedMessage.channel.send(
            "Description: Send an random string in chat. \n Usage: `randomstring [count]`"
        );
    } else if (arguments == "randomelement") {
        receivedMessage.channel.send(
            "Description: Returns an random element \n Usage: `randomelement`"
        );
    } else if (arguments == "server-info") {
        receivedMessage.channel.send(
            "Description:returns server info \n Usage: `server-info [detailed|json]`"
        );
    } else if (arguments == "logs") {
        receivedMessage.channel.send(
            "Description:returns bot logs \n Usage: `logs`"
        );
    } else if (arguments == "unban") {
        receivedMessage.channel.send(
            `Description:unbans a user. Usage: \`unban <User ID> [reason]\``
        );
    } else if (arguments == "") {
        //Send the attachment in the message channel
        const attachment = new Discord.Attachment("./attachments/README.md");
        /*
            MAIN HELP
                commands available to public only
            */
        receivedMessage.channel.send(
            "Prefix :`" +
            config.prefix +
            "` \n \n __**Command list**__ \n`help` `rank` `nekos-life` `errors` `randomstring` `stats` `config` `embed-spam` `user-info` `play` `skip` `stop` `now-playing` `queue` `multiply` `dog` `cat` `spam` `logs` `server-info` `say` `8ball` `unban` `spam-ping` `kick` `ban` `purge` `about` `changelogs` `Ping` `googlesearch` \n Use `/help [string]` for more infromation on a specificed command. Arguments in [] are optional \n \n __**Support Server**__ \n https://discord.gg/kPMK3K5"
        );
        receivedMessage.channel.send(attachment);
    } else if (arguments == "googsearch") {
        receivedMessage.channel.send(
            "Google something \n Usage `googlesearch <query>`"
        );
    } else if (arguments == "config") {
        receivedMessage.channel.send(
            "Description:Change server settings\n\
            Usage `config <config category> <config item> <new value>`\n\
            Use `none` as the <new value> argument to remove the config item.\
            \n\n**__Category:`log-channels`__**\n\
             Sets the log channels\
             \nIn this category `<new value>` must be a channel mention. \
             \nList of `<config item>`s\n\n\
`startTyping` Logged when someone starts typing\n\
`stopTyping` Logged when someone stops typing\n\
`message` Logged when someone sends a message\n\
`messageDelete` Logged when someone deletes a message\n\
`messageDeleteBulk` Logged when someone bulk delete messages\n\
`messageUpdate` Logged when a message is updated\n\
`channelCreate` Logged when a channel is created\n\
`channelDelete` Logged when achannel is deleted\n\
`channelUpdate` Logged when a channel is updated\n\
`guildBanAdd` Logged when someone is banned\n\
`guildBanRemove` Logged when someone is unbanned\n\
`guildMemberAdd` Logged when someone joins the server\n\
`guildMemebrRemove` Logged when someone leaves the server.\n\
`error` Logged when the bot encouters an error wjile doing something on the server.\n\
`emojiCreate` Logged when a emoji is craeted.\n`emojiDelete`Logged when an emoji is deleted\n\
`emojiUpdate`Logged when an emoji is updated.\n\
`roleCreate` Logged when a role is created\n\
`roleUpdate` Logged when a role is updated\n\
`roleDelete` Logged when a role is deleted"
        );
    } else if (arguments == "stats") {
        receivedMessage.channel.send(
            "Description:Return bot statistics\nUsage:`stats`"
        );
    } else if (arguments == "play") {
        receivedMessage.channel.send(
            "Description:plays music\nUsage:`play <youtube url>`"
        );
    } else if (arguments == "skip") {
        receivedMessage.channel.send(
            "Description:Skip the current song\nUsage:`skip`"
        );
    } else if (arguments == "stop") {
        receivedMessage.channel.send(
            "Description:Stop playing music,including those that are in the queue.\nUsage:`stop`"
        );
    } else if (arguments == "nekos-life") {
        const SFWImages = [
            "smug",
            "baka",
            "tickle",
            "slap",
            "poke",
            "pat",
            "neko",
            "nekoGif",
            "meow",
            "lizard",
            "kiss",
            "hug",
            "foxGirl",
            "feed",
            "cuddle"
        ];
        const NSFWImages = [
            "lewdkemo",
            "lewdk",
            "keta",
            "hololewd",
            "holoero",
            "hentai",
            "futanari",
            "femdom",
            "feetg",
            "erofeet",
            "feet",
            "ero",
            "erok",
            "erokemo",
            "eron",
            "eroyuri",
            "cum_jpg",
            "blowjob",
            "pussy"
        ];
        receivedMessage.channel.send(
            "Description:Fetch a image from nekos.life \nUsage:`nekos-life <argument>`\nAvailable arguments:"
        );
        receivedMessage.channel.send(
            "SFW:\n`" +
            SFWImages.join("` `") +
            "`" +
            "\nNSFW:\n`" +
            NSFWImages.join("` `") +
            "`"
        );
    } else if (arguments == "user-info") {
        receivedMessage.channel.send(
            "Description:Shows user info.\nUsage:`user-info [User ID|@mention|Tag|Username]`"
        );
    } else if (arguments == "embed-spam") {
        receivedMessage.channel.send(
            "Description:Spams embed.\nUsage:`embed-spam <count>`"
        );
    } else if (arguments == "now-playing") {
        receivedMessage.channel.send(
            "Description:Shows the song that is playing\nUsage:`now-playing`"
        );
    } else if (arguments == "queue") {
        receivedMessage.channel.send(
            "Description:Shows the server queue/song with a specified position in queue\nUsage:`queue [position]`"
        );
    } else if (arguments == "errors") {
        receivedMessage.channel.send(
            "Description: Shows bot's errors \n Usage `errors`"
        );
    } else if (arguments == "rank") {
        receivedMessage.channel.send(
            `Description:shows a member's level.\nUsage: \`rank [member]\``
        );
    } else {
        receivedMessage.channel.send(
            "Incorrect command syntax. Usage:`help [command]`"
        );
    }
}
async function configCommand(arguments, receivedMessage, settings) {
    try {
        if (receivedMessage.guild == null)
            throw botError("Using server-only commands in DM channel.");
    } catch (error) {
        sendError(error, receivedMessage);
        return;
    }
    var read = JSON.stringify(settings, null, 2).length;
    if (!receivedMessage.member.hasPermission("MANAGE_GUILD"))
        return receivedMessage.channel.send(noPermission("manage server"));
    var path = "./data/" + receivedMessage.guild.id + ".json";
    if (arguments[0] == "view") {
        receivedMessage.channel.send("Log channels:");
        receivedMessage.channel.send(
            JSON.stringify(settings.logChannels, null, 2),
            { code: "json" }
        );
        if (typeof settings.rankSettings !== "undefined") {
            receivedMessage.channel.send("rank settings:");
            receivedMessage.channel.send(
                JSON.stringify(settings.rankSettings, null, 2),
                { code: "json" }
            );
        }
        return;
    } else if (arguments[0] == "log-channels") {
        try {
            if (
                arguments[2] != receivedMessage.mentions.channels.first() &&
                arguments[2].toLowerCase() != "none"
            )
                throw botError("Invalid Command Syntax.");
            if (arguments[2] == "") throw botError("Invalid Commadn Syntax.");
            var c;
            if (arguments[2] == receivedMessage.mentions.channels.first()) {
                const cObj = await receivedMessage.mentions.channels.first();
                c = cObj.id;
            } else {
                throw botError("Invalid Commadn Syntax.");
            }
            if (arguments[2].toLowerCase() === "none") c = undefined;
            if (arguments[1] == "startTyping") {
                settings.logChannels.startTyping = c;
            } else if (arguments[1] == "stopTyping") {
                settings.logChannels.stopTyping = c;
            } else if (arguments[1] == "message") {
                settings.logChannels.message = c;
            } else if (arguments[1] == "messageDelete") {
                settings.logChannels.messageDelete = c;
            } else if (arguments[1] == "messageDeleteBulk") {
                settings.logChannels.messageDeleteBulk = c;
            } else if (arguments[1] == "guildMemberAdd") {
                settings.logChannels.guildMemberAdd = c;
            } else if (arguments[1] == "channelCreate") {
                settings.logChannels.channelCreate = c;
            } else if (arguments[1] == "channelDelete") {
                settings.logChannels.channelDelete = c;
            } else if (arguments[1] == "channelPinsUptdate") {
                settings.logChannels.channelPinsUpdate = c;
            } else if (arguments[1] == "channelUpdate") {
                settings.logChannels.channelUpdate = c;
            } else if (arguments[1] == "emojiCreate") {
                settings.logChannels.emojiCreate = c;
            } else if (arguments[1] == "emojiDelete") {
                settings.logChannels.emojiDelete = c;
            } else if (arguments[1] == "emojiUpdate") {
                settings.logChannels.emojiUpdate = c;
            } else if (arguments[1] == "guildBanAdd") {
                settings.logChannels.guildBanAdd = c;
            } else if (arguments[1] == "guildBanRemove") {
                settings.logChannels.guildBanRemove = c;
            } else if (arguments[1] == "guildIntegrationsUpdate") {
                settings.logChannels.guildIntegrationsUpdate = c;
            } else if (arguments[1] == "guildMemberRemove") {
                settings.logChannels.guildMemberRemove = c;
            } else if (arguments[1] == "guildMemberUpdate") {
                settings.logChannels.guildMemberUpdate = c;
            } else if (arguments[1] == "guildUpdate") {
                settings.logChannels.guildUpdate = c;
            } else if (arguments[1] == "messageDeleteBulk") {
                settings.logChannels.messageDeleteBulk = c;
            } else if (arguments[1] == "messageReactionAdd") {
                settings.logChannels.messageReactionAdd = c;
            } else if (arguments[1] == "messageReactionRemove") {
                settings.logChannels.messageReactionRemove = c;
            } else if (arguments[1] == "messageReactionRemoveAll") {
                settings.logChannels.messageReactionRemoveAll = c;
            } else if (arguments[1] == "messageUpdate") {
                settings.logChannels.messageUpdate = c;
            } else if (arguments[1] == "roleCreate") {
                settings.logChannels.roleCreate = c;
            } else if (arguments[1] == "roleDelete") {
                settings.logChannels.roleDelete = c;
            } else if (arguments[1] == "roleUpdate") {
                settings.logChannels.roleUpdate = c;
            } else if (arguments[1] == "webhookUpdate") {
                settings.logChannels.emojiUpdate = c;
            } else if (arguments[1] == "error") {
                settings.logChannels.error = c;
            } else {
                throw botError("Unknown settings");
            }
        } catch (error) {
            sendError(error, receivedMessage);
            return;
        }
    } else if (arguments[0] == "others") {
        if (arguments[1] == "welcomeMessage") {
            if (!arguments[2]) {
                try {
                    throw botError("Cannot be empty!");
                } catch (error) {
                    sendError(error, receivedMessage);
                    return;
                }
            } else {
                if (arguments[2].toLowerCase() === "none") arguments[2] = undefined;
                settings.others.welcomeMessage = arguments.slice(2).join(" ");
            }
        } else if (arguments[1] == "leavingMessage") {
            if (!arguments[2]) {
                try {
                    throw botError("Cannot be empty!");
                } catch (error) {
                    sendError(error, receivedMessage);
                    return;
                }
            } else {
                if (arguments[2].toLowerCase() === "none") arguments[2] = undefined;
                settings.others.leavingMessage = arguments.slice(2).join(" ");
            }
        }
    } else if (arguments[0] == "rank-settings") {/*
        if (typeof settings.rankSettings === "undefined")
            settings.rankSettings = {};
        if (arguments[1] == "blacklist-channel") {
            if (arguments[2] !== "add" || arguments[2] !== "remove")
                return receivedMessage.reply("Please specify either `add` or `remove`");
            if (typeof settings.rankSettings.blacklist === "undefined")
                settings.rankSettings.blacklist = [];
            if (arguments[2] === "add") {
                if (arguments[3] != receivedMessage.mentions.channels.first())
                    return receivedMessage.channel.send("Invalid command syntax");
                const ch = receivedMessage.mentions.channels.first();
                if (settings.rankSettings.blacklist.includes(ch.id))
                    return receivedMessage.channel.send(
                        ch.toString() + " had been added to the list before."
                    );
                settings.rankSettings.blacklist.push(ch.id);
            } else if (arguments[2] === "remove") {
                if (arguments[3] != receivedMessage.mentions.channels.first())
                    return receivedMessage.channel.send("Invalid command syntax");
                const ch = receivedMessage.mentions.channels.first();
                if (!settings.rankSettings.blacklist.includes(ch.id))
                    return receivedMessage.channel.send(
                        ch.toString() +
                        " the channel that you tried to remove is not in the list"
                    );
                settings.rankSettings.blacklist = settings.rankSettings.blacklist.filter(
                    value => value !== ch.id
                );
            }
        } else if (arguments[1] === "rewards") {
            if (arguments[2] !== "add" && arguments[2] !== "remove")
                return receivedMessage.reply("Please specify either `add` or `remove`");
            let level = parseInt(arguments[3]);
            if (isNaN(level))
                return receivedMessage.channel.send("Please input a valid number");
            if (parseFloat(arguments[3]) !== Math.round(parseFloat(arguments[3])))
                return receivedMessage.channel.send("Please input a integer");
            if (level <= 1)
                return receivedMessage.channel.send("Level must be larger than 2.");
            level = Math.round(level);
            if (typeof settings.rankSettings.rewards === "object")
                settings.rankSettings.rewards = json2map(settings.rankSettings.rewards);
            else settings.rankSettings.rewards = new Map();
            let taggedRole = arguments.slice(4).join(" ");
            let role = null;
            if (taggedRole === receivedMessage.mentions.roles.first()) {
                role = receivedMessage.mentions.roles.first();
                if (receivedMessage.member.highestRole.comparePositionTo(role) <= 0)
                    return receivedMessage.channel.send(
                        "Your role is not high enough to manage this role."
                    );
                if (receivedMessage.guild.me.highestRole.comparePositionTo(role) <= 0)
                    return receivedMessage.channel.send(
                        "The bot doesn't have enough permissions to manage this role"
                    );
            } else {
                role = receivedMessage.guild.roles.find(x =>
                    x.name.includes(taggedRole)
                );
            }
            if (role === null)
                return receivedMessage.channel.send("The role cannot be found.");
            if (receivedMessage.member.highestRole.comparePositionTo(role) <= 0)
                return receivedMessage.channel.send(
                    "Your role is not high enough to manage this role."
                );
            if (receivedMessage.guild.me.highestRole.comparePositionTo(role) <= 0)
                return receivedMessage.channel.send(
                    "The bot doesn't have enough permissions to manage this role"
                );
            if (arguments[2] === "add") {
                if (settings.rankSettings.rewards.has(role.id))
                    return receivedMessage.channel.send(
                        "The role had been added before."
                    );
                settings.rankSettings.rewards.set(level, role.id)(function () {
                    let embed = new RichEmbed()
                        .setColor("#00ff00")
                        .setDescription(
                            `The role ${role.toString} will be given to members that reach level ${level}`
                        );
                    receivedMessage.channel.send(embed);
                })();
            } else if (arguments[2] === "remove") {
                if (!settings.rankSettings.rewards.has(role.id))
                    return receivedMessage.channel.send(
                        "The role you mentioned is not a level reward."
                    )(function () {
                        let embed = new RichEmbed()
                            .setColor("#00ff00")
                            .setDescription(
                                `The role ${role.toString} will no longer be given to members that reach level ${level}`
                            );
                        receivedMessage.channel.send(embed);
                    })();
            }
            settings.rankSettings.rewards = map2json(settings.rankSettings.rewards);
            
        }
        */
    } else {
        return receivedMessage.channel.send("Unknown config");
    }
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    receivedMessage.channel.send(
        `Overwrote server settings\n**${read}** bytes read, **${
        JSON.stringify(settings, null, 2).length
        }** bytes written.`
    );
}
function multiplyCommand(arguments, receivedMessage) {
    if (arguments.length < 2) {
        receivedMessage.channel.send(
            "Not enough values to multiply. Try `/multiply 2 4 10` or `/multiply 5.2 7`"
        );
        return;
    }
    var product = 1;
    arguments.forEach(value => {
        product = product * parseFloat(value);
    });
    receivedMessage.channel.send(
        "The product of " +
        arguments +
        " multiplied together is: " +
        product.toString()
    );
}

function spamCommand(arguments, receivedMessage) {
    if (
        !receivedMessage.channel.permissionsFor(receivedMessage.member).serialize()
            .MANAGE_MESSAGES
    )
        return receivedMessage.channel.send(noPermission("manage messages"));
    var num = arguments[0];
    var num1 = parseInt(num);
    if (num1 > 50000) {
        receivedMessage.channel.send(
            "  Value too large.Must be smaller than 50000."
        );
        console.log(" Input value too large");
        return;
    }
    var i;
    var spamCount = 1;
    const collector = receivedMessage.channel.createMessageCollector(m => m.content.startsWith(config.prefix+"stop-spamming"),{time:null})
    collector.on("collect",m => {
        if (!receivedMessage.channel.permissionsFor(m.member).serialize().MANAGE_MESSAGES) return noPermission('Manage Messages')
        i = num1
        collector.stop()
        receivedMessage.channel.send("Stopped!")
    })
    for (i = 0; i < num1; i++) {
        receivedMessage.channel.send(
            "Spamming...  count:" +
            spamCount +
            "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n."
        );
        if (i >= num1) collector.stop()
        spamCount += 1;
    }
}

function spamPingCommand(arguments, receivedMessage) {
    if (receivedMessage.guild) {
        if (
            !receivedMessage.channel
                .permissionsFor(receivedMessage.member)
                .serialize().MANAGE_MESSAGES ||
            !receivedMessage.channel
                .permissionsFor(receivedMessage.member)
                .serialize().MENTION_EVERYONE
        )
            return receivedMessage.channel.send(
                noPermission("manage messages, mention everyone")
            );
    }
    var num = arguments[0];
    var num1 = parseInt(num);
    if (num1 > 50000) {
        receivedMessage.channel.send("Value too large.Must be smaller than 50000.");
        console.log("Input value too large");
        return;
    }
    var i;
    var spamCount = 1;
    const collector = receivedMessage.channel.createMessageCollector(m => m.content.startsWith(config.prefix+"stop-spamming-everyone"),{time:null})
    collector.on("collect",m => {
        if (!receivedMessage.channel.permissionsFor(m.member).serialize().MANAGE_MESSAGES) return noPermission('Manage Messages')
        i = num1
        collector.stop()
        receivedMessage.channel.send("Stopped!")
    })
    for (i = 0; i < num1; i++) {
        receivedMessage.channel
            .send("Spamming...  count:" + spamCount + "\n @everyone")
            .catch(error => {
                console.error(error.stack);
                return;
            });
            if (i >= num1) collector.stop()
        spamCount += 1;
    }
}
function ChangelogsCommand(receivedMessage) {
    receivedMessage.channel.send(
        "Nick Chan Bot Beta 1.0.0 - pre14 \n **CHANGELOGS** \n ```-Added role logs\n-Bug fixes```"
    );
}
function kickCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null)
        return receivedMessage.channel.send(
            "This command can only be used in servers"
        );
    if (!receivedMessage.member.hasPermission("KICK_MEMBERS"))
        return receivedMessage.channel.send(noPermission("kick members"));

    if (
        !receivedMessage.mentions.members.first() ||
        receivedMessage.mentions.members.first() != arguments[0]
    )
        return receivedMessage.channel.send(
            "Invalid command syntax. Usage: `kick <member> [reason]`"
        );

    const taggedUser = receivedMessage.mentions.members.first();
    if (taggedUser.id == receivedMessage.author.id)
        return receivedMessage.channel.send(
            "Why would you wanna kick yourself? I do not allow self harm."
        );
    if (
        receivedMessage.member.highestRole.comparePositionTo(
            taggedUser.highestRole
        ) <= 0 &&
        receivedMessage.member.id != receivedMessage.guild.owner.id
    )
        return receivedMessage.channel.send(
            "You cannot kick this user because they have a higher or equal role compared to you."
        );

    if (taggedUser.id == receivedMessage.guild.owner.id)
        return receivedMessage.channel.send("Cannot kick the server owner!");

    if (!taggedUser.kickable)
        return receivedMessage.channel.send(
            "The bot does not have permissions to kick this user. Check that I have permissions to kick members and my role is above the member you are trying to kick."
        );
    var reason = arguments.slice(1).join(" ");
    if (!reason) reason = "No reason specified";
    taggedUser.kick(reason).catch(error => {
        console.error(error.stack);
        return;
    });
    receivedMessage.channel.send(
        `Successfully kicked ${taggedUser.user.tag}. Reason: ${reason}`
    );
}
function banCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null)
        return receivedMessage.channel.send(
            "This command can only be used in servers"
        );
    if (!receivedMessage.member.hasPermission("BAN_MEMBERS"))
        return receivedMessage.channel.send(noPermission("ban members"));

    if (
        !receivedMessage.mentions.members.first() ||
        receivedMessage.mentions.members.first() != arguments[0]
    )
        return receivedMessage.channel.send(
            "Invalid command syntax. Usage: `ban <member> [reason]`"
        );

    const taggedUser = receivedMessage.mentions.members.first();
    if (taggedUser.id == receivedMessage.author.id)
        return receivedMessage.channel.send(
            "Why would you wanna ban yourself? I do not allow self harm."
        );

    if (
        receivedMessage.member.highestRole.comparePositionTo(
            taggedUser.highestRole
        ) <= 0 &&
        receivedMessage.member.id != receivedMessage.guild.owner.id
    )
        return receivedMessage.channel.send(
            "You cannot ban this user because they have a higher or equal role compared to you."
        );

    if (taggedUser.id == receivedMessage.guild.owner.id)
        return receivedMessage.channel.send("Cannot ban the server owner!");

    if (!taggedUser.kickable)
        return receivedMessage.channel.send(
            "The bot does not have permissions to ban this user. Check that I have permissions to ban members and my role is above the member you are trying to ban."
        );
    var reason = arguments.slice(1).join(" ");
    if (!reason) reason = "No reason specified";
    taggedUser
        .ban(reason)
        .catch(() =>
            receivedMessage.channel.send(
                "Oops, an error occured while trying to ban this person."
            )
        );
    receivedMessage.channel.send(
        `Successfully banned ${taggedUser.user.tag}. Reason: ${reason}`
    );
}

function aboutCommand(receivedMessage) {
    receivedMessage.channel.send(
        "Nick Chan Bot is a bot made by `Nick Chan#0001[570634232465063967]`.\nCredits:\n```\n-" +
        fs.readFileSync("./config/bruh.txt", "utf8") +
        "Developement)\n-RandomPerson0244#0244[549471563616092171] (Developement)```"
    );
}
function pingCommand(receivedMessage, processStart) {
    var time = Math.floor(Math.round((performance.now() - processStart) * 1000));
    if (receivedMessage.channel.type === "dm")
        receivedMessage.channel.send(
            "Please note that DM's are always on shard 0 so the fact that I am responding isn't proof that ypur shard works."
        );
    receivedMessage.channel.send(`Pinging...`).then(m => {
        m.edit(
            `
            ========PONG! (Shard ID:${client.shard.id})=========
• Message edit time                         :: ${m.createdTimestamp -
            receivedMessage.createdTimestamp} ms 
• Discord API heartbeat                     :: ${Math.round(client.ping)} ms 
• Command process time                      :: ${time} μs 
• -(performance.now() - performance.now())  :: ${Math.round(
                -(performance.now() - performance.now()) * 1000000
            )} ns`,
            { code: "asciidoc" }
        );
    });
}
async function purgeCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null)
        return receivedMessage.channel.send(
            "This command can only be used in servers."
        );
    if (
        !receivedMessage.channel.permissionsFor(receivedMessage.member).serialize()
            .MANAGE_MESSAGES
    ) {
        receivedMessage.channel.send(noPermission("manage messages"));
        return;
    }
    if (
        !receivedMessage.channel
            .permissionsFor(receivedMessage.guild.me)
            .serialize().MANAGE_MESSAGES
    )
        return receivedMessage.channel.send(
            "The bot doesn't have the permissions to purge messages."
        );
    if (arguments[0] == null) return receivedMessage.delete();
    if (arguments[0] > 10000)
        return receivedMessage.channel.send(
            "Please use a value that is smaller than 10000."
        );
    let count = parseInt(arguments[0]);
    while (count > 100) {
        try {
            const fetched = await receivedMessage.channel.fetchMessages({
                limit: 100,
                before: receivedMessage.id
            });
            const notPinned = fetched.filter(
                fetchedMsg => !fetchedMsg.pinned && fetchedMsg.id !== receivedMessage.id
            );
            msgSize += await receivedMessage.channel.bulkDelete(notPinned, true).size;
        } catch (err) {
            console.error(err.stack);
        }
        count = count - 100;
    }
    try {
        const fetched = await receivedMessage.channel.fetchMessages({
            limit: count,
            before: receivedMessage.id
        });
        const notPinned = fetched.filter(fetchedMsg => !fetchedMsg.pinned);
        msgSize += await receivedMessage.channel.bulkDelete(notPinned, true).size;
    } catch (err) {
        console.error(err);
    }
    count = 0;
}
function eightBallCommand(arguments, receivedMessage) {
    if (arguments == "") {
        receivedMessage.channel.send("Please enter something for 8ball to answer.");
        return;
    }
    var answer = eightballRandCommand();
    receivedMessage.channel.send("8ball answered with:" + answer);
}
function eightballRandCommand() {
    var answers = [
        "Yes",
        "No",
        "Maybe",
        "You may rely on it",
        "Probably not",
        "It is decidely so.",
        "never"
    ];
    return answers[Math.floor(Math.random() * answers.length)];
}
function dogCommand(receivedMessage) {
    var dogs = fs.readdirSync("./attachments/cats");
    var dog = dogs[Math.floor(Math.random() * dogs.length)];
    const attachment = new Discord.Attachment("./attachments/dogs/" + dog);
    receivedMessage.channel.send(attachment);
}
function catCommand(receivedMessage) {
    var cats = fs.readdirSync("./attachments/cats");
    var cat = cats[Math.floor(Math.random() * cats.length)];
    const attachment = new Discord.Attachment("./attachments/cats/" + cat);
    receivedMessage.channel.send(attachment);
}
async function rankCommand(arguments, receivedMessage) {
    let member = undefined;
    if (arguments[0]) {
        try {
            member = await client.fetchUser(arguments[0]);
            member = await receivedMessage.guild.fetchMember(member);
        } catch (error) {
            if (receivedMessage.mentions.members.first()) {
                if (member == null || typeof member == "undefined")
                    member = receivedMessage.mentions.members.first().user;
            }
            if (member == null || typeof member == "undefined")
                member = receivedMessage.guild.members.find(
                    x => x.user.tag == arguments.slice(0).join(" ")
                );
            if (member == null || typeof member == "undefined")
                member = receivedMessage.guild.members.find(
                    x => x.user.username == arguments.slice(0).join(" ")
                );
            if (member == null || typeof member == "undefined")
                member = receivedMessage.guild.members.find(
                    x => x.user.discriminator == arguments.slice(0).join(" ")
                );
        }
    } else {
        member = receivedMessage.member;
    }
    if (member == null || typeof member == "undefined")
        return receivedMessage.channel.send("Unknown user.");
    if (!guildRanks.get(receivedMessage.guild.id).has(member.user.id))
        return receivedMessage.channel.send(
            `**${member.user.tag}** is not ranked yet.`
        );
    const rank = new Rank(
        receivedMessage.guild.id,
        member.user.id,
        guildRanks.get(receivedMessage.guild.id).get(member.user.id)
    );
    const level = rank.getLevel();
    const xp = rank.xp;
    const xpLevelUp = rank.getLevelXP();
    receivedMessage.channel.send(`
    **__RANK of ${member.user.tag} __**
    Total XP:${xp}
    Level:${level}
    XP (This level) : ${xpLevelUp}
    `);
}
async function unbanCommand(arguments, receivedMessage) {
    if (receivedMessage.guild == null)
        return receivedMessage.channel.send(
            "This command can only be used in servers"
        );
    if (
        !receivedMessage.member.hasPermission("BAN_MEMBERS") &&
        !receivedMessage.member.hasPermission("ADMINISTRATOR")
    )
        return receivedMessage.channel.send("You cannot unban users.");
    if (!receivedMessage.guild.me.hasPermission("BAN_MEMBERS"))
        return receivedMessage.channel.send(
            "Please check if the bot has the permissions to unban members."
        );
    try {
        var bannedUser = await client.fetchUser(arguments[0]);
        var reason = arguments.slice(1).join(" ");
        if (!reason) reason = "No reason specified";
        await receivedMessage.guild.unban(bannedUser, reason).catch(error => {
            throw error;
        });
        receivedMessage.channel.send(`Successfully unbanned ${bannedUser}.`);
    } catch (error) {
        sendError(error, receivedMessage);
    }
}
function sayCommand(arguments, receivedMessage) {
    if (!arguments.slice(0)) return receivedMessage.channel.send("Please enter something for the bot to say.");
    receivedMessage.channel.send(arguments.slice(0).join(" "), { disableEveryone: true });
}
function randomStringCommand(arguments, receivedMessage) {
    if (arguments[0] <= 1048576) {
        var str = randomString(arguments[0]);
        if (arguments[0] <= 2000 && arguments[0] > 0) {
            receivedMessage.channel.send(str);
        }
        fs.writeFileSync("./temp/str.txt", str);
        receivedMessage.channel.send(new Discord.Attachment("./temp/str.txt"));
    } else {
        receivedMessage.channel.send(
            "Value out of range. Must between 1 and 1048576"
        );
    }
}
function randomString(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function randomElementCommand(receivedMessage) {
    var elements = [
        "Hydrogen",
        "Helium ",
        "Lithium",
        "Beryllium",
        "Boron",
        "Carbon",
        "Nitrogen",
        "Oxygen",
        "Fluorine",
        "Neon",
        "Sodium",
        "Magnesium",
        "Aluminum",
        "Silicon",
        "Phosphrous",
        "Sulphur",
        "Chlorine",
        "Argon",
        "Potassium",
        "Calcium",
        "Scandium",
        "Titanium",
        "Vanadium",
        "Chromium",
        "Manganese",
        "Iron",
        "Cobalt",
        "Nickel",
        "Copper",
        "Zinc",
        "Gallium",
        "Germanium",
        "Arsenic",
        "Selenium",
        "Bromine",
        "Krypton",
        "Rubidium",
        "Stronium",
        "Yttrium",
        "Zironium",
        "Niobium",
        "Molybdenum",
        "Technetium",
        "Ruthenium",
        "Rhodium",
        "Palladium",
        "Silver",
        "Candmium",
        "Indium",
        "Tin",
        "Antimony",
        "Tellurium",
        "Iodine",
        "Xenon",
        "Caesium",
        "Barium",
        "Lanthanum",
        "Cerium",
        "Praseodymium",
        "Neodymium",
        "Promethium",
        "Samarium",
        "Europium",
        "Gadolinium",
        "Terbium",
        "Dysprosium",
        "Holonium",
        "Erbium",
        "Thulium",
        "Ytterium",
        "Lutetium",
        "Hafnium",
        "Tantalum",
        "Tungsten",
        "Rhenium",
        "Osmium",
        "Iridium",
        "Platnium",
        "Gold",
        "Mercury",
        "Thallium",
        "Lead",
        "Bismuth",
        "Polonium",
        "Astatine",
        "Radon",
        "Francium",
        "Radium",
        "Actnium",
        "Thorium",
        "Protactium",
        "Uranium",
        "Neptunium",
        "Plutonium",
        "Americium",
        "Curium",
        "Berklium",
        "Californiium",
        "Eistenium",
        "Fermium",
        "Mendelevium",
        "Nobelium",
        "Lawrencium",
        "Rutherfordium",
        "Dubnium",
        "Seaborgium",
        "Bohrium",
        "Hassium",
        "Meitnerium",
        "Darmstadtium",
        "Roentgenium",
        "Copernicium",
        "Nihonium",
        "Flevorium",
        "Moscovium",
        "Livermorium",
        "Tennessine",
        "Oganesson"
    ];
    var result = elements[Math.floor(Math.random() * elements.length)];
    receivedMessage.channel.send(result);
}
async function serverInfoCommand(arguments, receivedMessage) {
    const g = receivedMessage.guild;
    const e = "\n";
    if (arguments[0] == "detailed") {
        var info =
            "AFK Channel:" +
            g.afkChannel +
            e +
            "AFK Channel ID:" +
            g.afkChannelID +
            e +
            "Application ID:" +
            g.applicationID +
            e +
            "Availbility:" +
            g.available +
            e +
            "Created at:" +
            g.createdAt +
            e +
            "Created Timestamp:" +
            g.createdTimestamp +
            e +
            "default Message Notifications:" +
            g.defaultMessageNotifications +
            e +
            "`@everyone` role:" +
            "`" +
            g.defaultRole +
            "`" +
            e +
            "Deleted:" +
            g.deleted +
            e +
            "explicit Content Filter:" +
            g.explicitContentFilter +
            e +
            "Server icon hash:" +
            g.icon +
            e +
            "Server ID: " +
            g.id +
            e +
            "Server icon URL:" +
            g.iconURL +
            e +
            `Large?: ${g.large} \n Member count: ${g.memberCount} \n MFA Level: ${g.mfaLevel} \n Server name: ${g.name} \n Server name acronym: ${g.nameAcronym} \n Server owner: ${g.owner.user.tag} \n Server owner ID: ${g.ownerID} \n Server region: ${g.region} \n Sever splsah screen hash: ${g.splash} \n Server splash screen URL: ${g.splashURL} \n System Channel: <#${g.systemChannelID}> \n System Channel ID: ${g.systemChannelID} \n Verification Level : ${g.verificationLevel} \n Verified?: ${g.verified}`;
        await receivedMessage.channel.send(`**Server Info** \n \n` + info);
    } else if (arguments[0] == "json") {
        receivedMessage.channel.send(
            "```js\n" + JSON.stringify(g, null, 2) + "```"
        );
    } else {
        var info =
            "AFK Channel:" +
            g.afkChannel +
            "Created at:" +
            g.createdAt +
            e +
            "Server ID: " +
            g.id +
            e +
            "Server icon URL:" +
            g.iconURL +
            e +
            `Large?: ${g.large} \n Member count: ${g.memberCount} \n MFA Level: ${g.mfaLevel} \n Server name: ${g.name} \n Server name acronym: ${g.nameAcronym} \n Server owner: ${g.owner.user.tag} \n Server region: ${g.region}\n Server splash screen URL: ${g.splashURL} \n System Channel: <#${g.systemChannelID}> \n System Channel ID: ${g.systemChannelID} \n Verification Level : ${g.verificationLevel} \n Verified?: ${g.verified}`;
        await receivedMessage.channel.send(`**Server Info** \n \n` + info);
    }
}
async function statsCommand(receivedMessage) {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    const servers = await client.shard.broadcastEval('this.guilds.size')
    const users = await client.shard.broadcastEval('this.users.size')
    const channels = await client.shard.broadcastEval('this.channels.size')
    const rssUsage = await client.shard.broadcastEval('process.memoryUsage().rss/1024/1024')
    const heapUsage = await client.shard.broadcastEval('process.memoryUsage().heapUsed/1024/1024')
    const nodeCPUUsage = await client.shard.broadcastEval('process.cpuUsage().user')
    const sysCPUUsage = await client.shard.broadcastEval('process.cpuUsage().system')
    const statsEmbed = new RichEmbed()
        .setColor('#363A3F')
        .setAuthor('Statistics', 'https://i.imgur.com/7hCWXZk.png')
        .setTitle(`${client.user.username}'s stats`)
        .setDescription('Contains essential information regarding our service and bot information.')
        .setThumbnail(client.user.displayAvatarURL)
        .addField('Uptime', `${duration}`, true)
        .addField('Shards', `${client.shard.count}`, true)
        .addField('Servers', `${servers.reduce((previous, count) => previous + count, 0)}`, true)
        .addField('Channels', `${channels.reduce((previous, count) => previous + count, 0)}`, true)
        .addField('Users', `${users.reduce((previous, count) => previous + count, 0)}`, true)
        .addField('Discord.js Version', `${version}`, true)
        .addField('NodeJS Version', `${process.version}`, true)
        .addField('Websocket Ping', `${Math.round(client.ping)}ms`, true)
        .addField('Memory Usage', `${rssUsage.reduce((previous, count) => previous + count, 0).toFixed(2)} MB RSS\n${heapUsage.reduce((previous, count) => previous + count, 0).toFixed(2)} MB Heap`, true)
        .addField('CPU Usage', `Node: ${(nodeCPUUsage.reduce((previous, count) => previous + count, 0) / 1048576).toFixed(2)}%\nSystem: ${(sysCPUUsage.reduce((previous, count) => previous + count, 0) / 1048576).toFixed(2)}%`, true)
        .setFooter(client.user.tag, client.user.displayAvatarURL);
    receivedMessage.channel.send(statsEmbed)
}

function embedSpamCommand(arguments, receivedMessage) {
    if (receivedMessage.guild) {
        if (
            !receivedMessage.channel.permissionsFor(receivedMessage.member).serialize
                .MANAGE_MESSAGES
        )
            return receivedMessage.channel.send(noPermission("manage messages"));
    }
    var num = arguments[0];
    var num1 = parseInt(num);
    if (num1 > 300) {
        receivedMessage.channel.send("  Value too large.Must be smaller than 300.");
        console.log(" Input value too large");
        return;
    }
    var i;
    var embed = new Discord.RichEmbed()
        .setAuthor(
            receivedMessage.author.tag,
            receivedMessage.author.displayAvatarURL
        )
        .setImage(receivedMessage.author.displayAvatarURL)
        .setThumbnail(receivedMessage.author.displayAvatarURL)
        .setTimestamp()
        .addField(
            "x.",
            "2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt"
        )
        .addField(
            ".x",
            "2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt"
        )
        .addField(
            ".x",
            "2.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.ytjjt"
        )
        .setURL(receivedMessage.author.displayAvatarURL)
        .setColor("#000000")
        .setFooter(client.user.tag, client.user.displayAvatarURL)
        .setDescription(
            ".\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n."
        );
    for (i = 0; i < num1; i++) {
        receivedMessage.channel.send(embed);
    }
}
function logsCommand(receivedMessage) {
    var logs = new Discord.Attachment("logs.log");
    receivedMessage.channel.send(logs);
}
async function userInfoCommand(arguments, receivedMessage) {
    var user = undefined;
    if (arguments[0]) {
        try {
            user = await client.fetchUser(arguments[0]);
        } catch (error) {
            if (receivedMessage.mentions.members.first()) {
                if (user == null || typeof user == "undefined")
                    user = receivedMessage.mentions.members.first().user;
            }
            if (user == null || typeof user == "undefined")
                user = client.users.find(x => x.tag == arguments.slice(0).join(" "));
            if (user == null || typeof user == "undefined")
                user = client.users.find(
                    x => x.username == arguments.slice(0).join(" ")
                );
            if (user == null || typeof user == "undefined")
                user = client.users.find(
                    x => x.discriminator == arguments.slice(0).join(" ")
                );
        }
    } else {
        user = receivedMessage.author;
    }
    if (user == null || typeof user == "undefined")
        return receivedMessage.channel.send("Unknown user.");
    var embed = new Discord.RichEmbed()
        .setAuthor(
            receivedMessage.author.tag,
            receivedMessage.author.displayAvatarURL
        )
        .setTitle("User Info")
        .setDescription(
            "Note:Some information cannot be displayed if the user is offline/Not playing a game/Not streaming/Not a human\nThe only reliable way of using this command is using the user ID as argument"
        )
        .addField("Tag", user.tag)
        .addField("Is Bot", user.bot)
        .addField("Joined Discord", user.createdAt)
        .addField("User ID", user.id)
        .addField("Avatar URL", user.displayAvatarURL)
        .setThumbnail(user.displayAvatarURL)
        .setColor("#00aaff")
        .setTimestamp()
        .setFooter(client.user.tag, client.user.displayAvatarURL);
    try {
        embed.addField("Status", user.presence.status);
        if (user.presence.game) {
            embed
                .addField("Playing", user.presence.game.name)
                .addField("Is streaming", user.presence.game.streaming)
                .addField("Stream URL", user.presence.game.url);
        }
    } catch (error) { }
    if (user.bot == false) {
        if (user.presence.status != "offline") {
            if (user.presence.status == user.presence.clientStatus.desktop)
                embed.addField("Using Discord On", "Desktop");
            if (user.presence.status == user.presence.clientStatus.web)
                embed.addField("Using Discord On", "Web");
            if (user.presence.status == user.presence.clientStatus.mobile)
                embed.addField("Using Discord On", "Mobile");
        }
    }
    receivedMessage.channel.send(embed);
}
async function nekosLifeCommand(arguments, receivedMessage) {
    receivedMessage.channel.startTyping();
    const api = "https://nekos.life/api/v2/img/";
    const SFWImages = [
        "smug",
        "baka",
        "tickle",
        "slap",
        "poke",
        "pat",
        "neko",
        "nekoGif",
        "meow",
        "lizard",
        "kiss",
        "hug",
        "foxGirl",
        "feed",
        "cuddle"
    ];
    const NSFWImages = [
        "lewdkemo",
        "lewdk",
        "keta",
        "hololewd",
        "holoero",
        "hentai",
        "futanari",
        "femdom",
        "feetg",
        "erofeet",
        "feet",
        "ero",
        "erok",
        "erokemo",
        "eron",
        "eroyuri",
        "cum_jpg",
        "blowjob",
        "pussy"
    ];
    if (SFWImages.includes(arguments[0])) return receivedMessage.channel.send(new Attachment((await fetch(api + arguments[0]).then(response => response.json())).url)).then(() => receivedMessage.channel.stopTyping())
    else if (NSFWImages.includes(arguments[0])) {
        if (receivedMessage.channel.nsfw) return receivedMessage.channel.send(new Attachment((await fetch(api + arguments[0]).then(response => response.json())).url)).then(() => receivedMessage.channel.stopTyping())
        else receivedMessage.reply("NSFW arguments can only be used in NSFW channels.").then(() => receivedMessage.channel.stopTyping())
    } else return receivedMessage.reply("Invalid arguments,available arguments:\nSFW:\n`" + SFWImages.join("` `")
        + "`\n\nNSFW:\n`" + NSFWImages.join("` `") + "`").then(() => receivedMessage.channel.stopTyping())
}
function nowPlaying(receivedMessage, serverQueue) {
    if (typeof serverQueue != "undefined") {
        if (typeof serverQueue.songs != "undefined") {
            receivedMessage.channel.send(
                `\`\`\`json\n${JSON.stringify(serverQueue.songs[0], null, 2)}\`\`\``
            );
        }
    } else {
        receivedMessage.channel.send("There is nothing playing");
    }
}
function queueCommand(receivedMessage, serverQueue, arguments) {
    if (!arguments[0]) {
        if (typeof serverQueue != "undefined") {
            if (typeof serverQueue.songs != "undefined") {
                receivedMessage.channel.send(
                    `${JSON.stringify(serverQueue.songs, null, 2)}`, { code: "json", split: true }
                );
            }
        } else {
            receivedMessage.channel.send("There is nothing in the queue");
        }
    } else {
        if (typeof serverQueue != "undefined") {
            if (typeof serverQueue.songs != "undefined") {
                if (!Number(arguments[0]) == NaN)
                    return receivedMessage.channel.send("Argument is not a number.");
                if (Math.round(arguments[0]) != arguments[0])
                    return receivedMessage.channel.send("Arguments is not a integer.");
                var i = arguments[0] - 1;
                if (i > serverQueue.songs.length || i < 0)
                    return receivedMessage.channel.send("Out of range.");
                receivedMessage.channel.send(
                    `\`\`\`json\n${JSON.stringify(serverQueue.songs[i], null, 2)}\`\`\``
                );
            }
        } else {
            receivedMessage.channel.send("There is nothing in the queue");
        }
    }
}
async function execute(receivedMessage, serverQueue) {
    const voiceChannel = receivedMessage.member.voiceChannel;
    if (!voiceChannel)
        return receivedMessage.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(receivedMessage.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return receivedMessage.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }
    var result = await sercher
        .search(
            receivedMessage.content.substr(Math.floor(config.prefix.length + 5)),
            { type: "video" }
        )
        .catch(error => {
            sendError(error, receivedMessage);
            return;
        });
    if (result.first == null)
        return receivedMessage.channel.send(
            "No results,please try another keyword."
        );
    const song = {
        title: result.first.title,
        url: result.first.url
    };
    if (!serverQueue) {
        const queueContruct = {
            textChannel: receivedMessage.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(receivedMessage.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(receivedMessage.guild, queueContruct.songs[0], receivedMessage);
            receivedMessage.channel.send("Playing " + song.title);
        } catch (err) {
            console.log(err);
            queue.delete(receivedMessage.guild.id);
            return receivedMessage.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return receivedMessage.channel.send(
            `${song.title} has been added to the queue!`
        );
    }
}
function skip(message, serverQueue) {
    if (!message.member.voiceChannel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send("Music Ended.");
}

function play(guild, song, receivedMessage) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .playStream(ytdl(song.url))
        .on("end", () => {
            console.log("Music ended!");
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => {
            sendError(error, receivedMessage);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}
function sleep(delay) {
    var time = performance.now() + delay;
    while (performance.now() - time > 0) { }
    return delay;
}
client.login(config.token);