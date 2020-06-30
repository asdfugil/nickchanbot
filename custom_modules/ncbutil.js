const { Collection, MessageEmbed,TextBasedChannel,Message,GuildMember,WebhookClient,Guild } = require("discord.js");
const Keyv = require('keyv')
const globalLogHooks = new Keyv("sqlite://.data/database.sqlite", {
  namespace: "log-hooks"
});
module.exports = {
  /**
   * @param { Guild | null } guild
   * @param { string } logType - The type of log
   * @typedef { Promise<void | 'BREAK'> | void | 'BREAK' } idk
   * @param { (embed:MessageEmbed) => idk } callback
   */
  postLog:async function(logType,guild,callback) {
    if (!guild) return
    const data = await globalLogHooks.get(guild.id)
    if (!data) return
    const hookData = data[logType]
    if (!hookData) return
    const hook = new WebhookClient(hookData.id,hookData.token)
    const embed = new MessageEmbed()
    const term = await callback(embed)
    if (term === 'BREAK') return
    hook.send(embed)
    .catch(error => {
      if (error.code === 10015) {
        delete data[logType]
        globalLogHooks.set(channel.guild.id, data);
      } else throw error;
    })
  },
  /**
   * 
   * @param { GuildMember } member1 
   * @param { GuildMember } member2 
   * @returns { boolean } whether member1 is higher than or equal to member 2
   */
  role_check(member1,member2) {
    if (member1.id === member1.guild.owner.id) return true
    if (member2.id === member2.guild.owner.id) return false
    return member1.roles.highest.postiton > member2.roles.highest.position
  },
   /**
   * @param { Message } message
   * @returns { Promise<GuildMember> }
   */
  findMember: async (message, string) => {
    if (message.mentions.members.first())
      return message.mentions.members.first();
    else if (message.guild.members.cache.find(x => x.user.tag.includes(string)))
      return message.guild.members.cache.find(x => x.user.tag.includes(string));
    else if (message.guild.members.cache.find(x => x.displayName.includes(string)))
      return message.guild.members.cache.find(x => x.displayName.includes(string));
    else if (message.guild.members.resolve(string))
      return message.guild.members.resolve(string);
  },
  /**
   * @param { Message } message
   * @param { string } string 
   * @returns { Promise<GuildMember> }
   */
  
  findRole: (message,string) => {
    const { guild } = message
    let role = message.mentions.roles.first()
    if (role) return role
    else role = guild.roles.find(x => x.name.toLownerCase().includes(string.toLowerCase()))
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
   * @param { string } perms
   * @param { TextBasedChannel } c
   * @returns { Promise<Message> }
   */
  noPermission: async (perms, c) => {
    const noPermission = new MessageEmbed()
      .setColor("#ffff00")
      .setFooter(c.client.user.tag, c.client.user.displayAvatarURL)
      .setTimestamp()
      .setDescription(
        `You don't have the permissions to use this command.\nOnly members with **${perms}** permission(s) can use this command`
      );
    return c.send(noPermission)
  },
  Tag:class {
    /**
     * Construct a tag
     * @param { string } name - The name of the tag
     * @param { string } content - The content of the tag
     * @param { boolean? } nsfw - Whether this tag is nsfw
     * @param { string? } description - The description of the tag
     * @param { number? } count - How many times this tag has been triggered
     * @returns The tag
     */
    constructor(name,content,nsfw,description,count) {
      this.name = name
      this.content = content
      this.nsfw = nsfw
      this.description = description
      this.count = count
      if (typeof this.count === "undefined") this.count = 0
      return this
    }
  },
  /**
   * @param { string } perms
   * @param { TextBasedChannel } c
   * @returns { Promise<Message> }
   */
  noBotPermission: async (perms, c) => {
    const noPermission = new MessageEmbed()
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
