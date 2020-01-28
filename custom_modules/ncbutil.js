const { Collection, RichEmbed } = require("discord.js");
module.exports = {
  sendError: function(info) {
    info.client.channels
      .get(info.channelID)
      .send(info.error.stack, { code: "prolog" });
    console.log(info.error);
  },
  botError: function(message) {
    var error = new Error(message);
    error.name = "NickChanBotError";
    return error;
  },
  findMember: async (message, string) => {
    if (message.mentions.members.first()) return message.mentions.members.first()
    else if (message.guild.members.find(x => x.user.tag.includes(string))) return message.guild.members.find(x => x.user.tag.includes(string))
    else if (message.guild.members.find(x => x.displayName.includes(string))) return message.guild.members.find(x => x.displayName.includes(string))
    else if (await message.guild.fetchMember(string)) return await message.guild.fetchMember(string)
  },
  findUser: async (message,string) => {
    if (message.mentions.members.first()) return message.mentions.members.first().user
    else if (message.guild.members.find(x => x.user.tag.includes(string))) return message.guild.members.find(x => x.user.tag.includes(string)).user
    else if (message.guild.members.find(x => x.displayName.includes(string))) return message.guild.members.find(x => x.displayName.includes(string)).user
    else if (await message.client.fetchUser(string)) return await message.client.fetchUser(string)
  },
  findRole: (message,string) => {
    const { guild } = message
    let role = message.mentions.roles.first()
    if (role) return role
    else role = guild.roles.find(x => x.name.includes(string))
    if (role) return role
    else role = guild.roles.find(x => x.hexColor === string)
    if (role) return role
    else return guild.roles.get(string)
  },
  findBannedUser:async (message,string) => {
    const bans = await message.guild.fetchBans()
    let user = bans.find(x => x.tag.includes(string))
    if (user) return user
    user = bans.find(x => string.includes(x.id)) //@memntions and ids
    return user
  },
  deserialize: str => eval(`(${str})`),
  /**
   * Converts Collection into JSON.
   * @param collection A Collection in which all keys are strings
   */
  collection2json: function(collection) {
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
      let error = new Error(
        "Expected class Collection, received class " +
          collection.constructor.name
      );
      throw error;
    }
    return obj;
  },
  /**
   * Converts JSON into Collection
   * @param obj Any javascript object
   */
  json2colllction: obj => {
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
  arrayContainsArray: (superset, subset) => {
    if (0 === subset.length || superset.length < subset.length) {
      return false;
    }
    for (let i = 0; i < subset.length; i++) {
      if (superset.indexOf(subset[i]) === -1) return false;
    }
    return true;
  },
  noPermission: async (perms, c) => {
    const noPermission = new RichEmbed()
      .setColor("#ffff00")
      .setFooter(c.client.user.tag, c.client.user.displayAvatarURL)
      .setTimestamp()
      .setDescription(
        `You don't have the permissions to use this command.\nOnly members with **${perms}** permission(s) can use this command`
      );
    return c.send(noPermission)
  },
  noBotPermission: async (perms, c) => {
    const noPermission = new RichEmbed()
      .setColor("#ffff00")
      .setFooter(c.client.user.tag, c.client.user.displayAvatarURL)
      .setTimestamp()
      .setDescription(
        `The Bot does not have enough permissions
            Permissions required:\`${perms}\``
      );
    return c.send(noPermission)
  },
  /**
   * @constructor Provides functionality needed a Discord Leveling System.
   */
  Rank: class {
    constructor(xp) {
      "use strict";
      if (xp) {
        this.xp = xp;
      } else {
        this.xp = 0;
      }
      this.getLevel = function() {
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
      this.getLevelXP = function() {
        let xpRequiredToLevelUp = 0;
        let xpo = this.xp;
        for (let i = 0; xpo > 0; i++) {
          xpo = xpo - xpRequiredToLevelUp;
          if (xpo > 0) {
            xpRequiredToLevelUp += 100;
          }
          i += 1;
        }
        return (
          Math.floor(xpRequiredToLevelUp + xpo) + "/" + xpRequiredToLevelUp
        );
      };
      this.toString = function() {
        return this.xp.toString();
      };
    }
  }
};
