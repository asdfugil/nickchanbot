const math = require("mathjs");
const { Message } = require("discord.js");
const { Tag } = require("./ncbutil.js");
/**
 * Parse tag content.
 * @param { Message } message - The message that triggered the tag.
 * @param { Tag } tag - The tag that is invoked
 * @param { Array<string> } args - The arguments
 * @param { boolean } [isRes]
 * @returns { string } - The parsed tag.
 */
module.exports = (message, tag, args, isRes) => {
  //in regex ,$ and . arr a special characters
  //so do \$, \.
  let parsed = core(message, tag, args, false)
  //Math
  if (isRes) return
  if (!isRes) {
    parsed = parsed.replace(/\${math\((.*)\)}/gi, (match, expression) => {
       math.evaluate(
        core(
          message,
          {
            name: tag.name,
            content: expression,
            nsfw: tag.nsfw
          },
          args, true
        )
      )
    })
  }
  console.log(parsed)
  return parsed
};
function core(message, tag, args, isRes) {
  const { member, author, channel, guild } = message
  console.log("Started parsing " + tag.name)
  //in regex ,$ and . arr a special characters
  //so do \$, \.
  return tag.content
    //tag.*
    .replace(/\${tag\.name}/gi, tag.name)
    .replace(/\${tag\.nsfw}/gi, tag.nsfw)
    .replace(/\${tag\.content}/gi, tag.content)
    .replace(/\${tag\.description}/gi, tag.description)
    .replace(/\${tag\.count}/gi, tag.count)
    //arguments
    .replace(/\${(\d)}/gi, (match, num) => args[parseInt(num) - 1])
    .replace(/\${&}/gi, args.join(" "))
    //author.*
    .replace(/\${author\.tag}/gi, author.tag)
    .replace(/\${author\.id}/ig,author.id)
    .replace(/\${author\.username}/gi, author.username)
    .replace(/\${author\.discriminator}/gi, author.discriminator)
    .replace(/\${author\.displayAvatarURL}/gi, author.displayAvatarURL)
    .replace(/\${author\.createdAt}/gi, author.createdAt)
    .replace(/\${author\.bot}/gi, author.bot)
    .replace(/\${author\.presence\.game\.name}/gi, () => {
      if (!author.game) return "N/A";
      else return author.presence.game.name;
    })
    //member.*
    .replace(/\${member\.mention}/gi, member.toString())
    .replace(/\${member\.id}/gi, member.id)
    .replace(/\${member\.highestRole\.name}/gi, member.highestRole.name)
    .replace(/\${member\.highestRole\.mention}/gi, member.highestRole)
    .replace(
      /\${member\.highestRole\.hexColor}/gi,
      member.highestRole.hexColor
    )
    .replace(/\${member\.hoistRole\.name}/gi, () => {
      if (member.hoistRole) return member.hoistRole.name;
      else return "N/A";
    })
    .replace(/\${member\.hoistRole\.mention}/gi, () => {
      if (member.hoistRole) return member.hoistRole.toString();
      else return "N/A";
    })
    .replace(/\${member\.hoistRole\.hexColor}/gi, () => {
      if (member.hoistRole) return member.hoistRole.hexColor;
      else return "N/A";
    })
    .replace(/\${member\.joinedAt}/gi, member.joinedAt)
    .replace(/\${member\.voiceChannel.name}/gi, () => {
      if (member.voiceChannel) return member.voiceChannel.name;
      else return "N/A";
    })
    .replace(/\${member.voiceChannel.id}/gi, () => {
      if (member.voiceChannel) return member.voiceChannel.id;
      else return "N/A";
    })
    //channel.*
    .replace(/\${channel\.name}/gi, message.channel.name)
    .replace(/\${channel\.mention}/gi, message.channel)
    .replace(/\${channel\.slowModeTime}/gi, channel.rateLimitPerUser)
    .replace(/\${channel\.nsfw}/gi, channel.nsfw)
    .replace(/\${channel\.topic}/gi, channel.topic || "")
    .replace(/\${channel\.type}/ig,channel.type)
    //guild.*
    .replace(/\${guild\.name}/gi, guild.name)
    .replace(/\${guild\.memberCount}/, guild.memberCount)
    .replace(/\${guild\.channelCount}/gi, guild.channels.size)
    .replace(/\${guild\.roleCount}/gi, guild.roles.size)
    //guild.owner.*
    .replace(/\${guild\.owner\.mention}/gi, guild.owner.toString())
    .replace(/\${guild\.owner\.id}/gi, guild.owner.id)
    .replace(
      /\${guild\.owner\.highestRole\.name}/gi,
      guild.owner.highestRole.name
    )
    .replace(
      /\${guild\.owner\.highestRole\.mention}/gi,
      guild.owner.highestRole
    )
    .replace(
      /\${guild\.owner\.highestRole\.hexColor}/gi,
      guild.owner.highestRole.hexColor
    )
    .replace(/\${guild\.owner\.hoistRole\.name}/gi, () => {
      if (guild.owner.hoistRole) return guild.owner.hoistRole.name;
      else return "N/A";
    })
    .replace(/\${guild\.owner\.hoistRole\.mention}/gi, () => {
      if (guild.owner.hoistRole) return guild.owner.hoistRole.toString();
      else return "N/A";
    })
    .replace(/\${guild\.owner\.hoistRole\.hexColor}/gi, () => {
      if (guild.owner.hoistRole) return guild.owner.hoistRole.hexColor;
      else return "N/A";
    })
    .replace(/\${guild\.owner\.joinedAt}/gi, guild.owner.joinedAt)
    .replace(/\${guild\.owner\.voiceChannel.name}/gi, () => {
      if (guild.owner.voiceChannel) return guild.owner.voiceChannel.name;
      else return "N/A";
    })
    .replace(/\${member.voiceChannel.id}/gi, () => {
      if (guild.owner.voiceChannel) return guild.owner.voiceChannel.id;
      else return "N/A";
    })
    //guild.owner.user.*
    .replace(/\${guild\.owner\.user\.tag}/gi, guild.owner.user.tag)
    .replace(/\${guild\.owner\.user\.username}/gi, guild.owner.user.username)
    .replace(
      /\${guild\.owner\.user\.discriminator}/gi,
      guild.owner.discriminator
    )
    .replace(
      /\${guild\.owner\.user\.displayAvatarURL}/gi,
      guild.owner.user.displayAvatarURL
    )
    .replace(
      /\${guild\.owner\.user\.createdAt}/gi,
      guild.owner.user.createdAt
    )
    .replace(/\${guild\.owner\.user\.id}/ig,guild.owner.user.id)
    .replace(/\${guild\.owner\.user\.bot}/gi, guild.owner.user.bot)
    .replace(/\${guild\.owner\.user\.presence\.game\.name}/gi, () => {
      if (!guild.owner.user.presence.game) return "N/A";
      else return guild.owner.user.presence.game;
    })
    .replace(/\${RANDOM_NUMBER}/ig,Math.random())
}
