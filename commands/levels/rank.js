const { guild_rank } = require('../../sequelize')
const {
  Rank,
  findMember,
} = require("../../custom_modules/ncbutil.js");
const fetch = require("node-fetch");
require("dotenv").config();
const { MessageAttachment } = require("discord.js");
const fs = require("fs");
const Canvas = require("canvas");
module.exports = {
  name: "rank",
  aliases: ["levels"],
  guildOnly: true,
  description: { en: "shows you or a member's level" },
  execute: async (message, args) => {
    let member
    if (args[0]) member = await findMember(message, args.join(" ")).catch(error => { message.reply("That's not a valid member!") })
    else member = message.member
    if (!member) return
    let guildRanks =
      (await guild_rank.findOne({ where: { guild_id: message.guild.id } })) || Object.create(null)
      guildRanks = guildRanks.dataValues.ranks || {}
    if (await guildRanks[member.id]) {
      message.channel.startTyping();
      const canvas = Canvas.createCanvas(1400, 250);
      const ctx = canvas.getContext("2d");
      const background = await Canvas.loadImage(process.env.RANK_COMMAND_BACKGROUND_IMAGE)
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      const rank = new Rank(guildRanks[member.id]);
      ctx.strokeStyle = "#74037b";
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.font = module.exports.applyText(canvas, member.displayName);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(member.displayName, canvas.width / 4.9, canvas.height / 3);
      ctx.fillStyle = "white";
      ctx.fillRect(280, 100, 1080, 40);
      ctx.fillStyle = "#03f0fc";
      ctx.fillRect(
        280,
        100,
        (parseInt(rank.getLevelXP()) /
          parseInt(rank.getLevelTotalXP())) *
        1080,
        40
      );
      ctx.font = "30px sans-serif";
      ctx.fillStyle = "white";
      ctx.fillText(rank.getLevelXP() + " XP", 1100, 170);
      ctx.fillText("Total XP: " + Math.round(rank.xp), 280, 230)
      ctx.fillText("Level " + rank.getLevel(), 280, 170);
      ctx.beginPath();
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      const response = await fetch(member.user.displayAvatarURL({ size:512,dynamic:false,format:'png' }));
      const buff_array = []
      response.body.on('data',chunk => buff_array.push(chunk))
      response.body.once("close", async () => {
        const avatar = await Canvas.loadImage(Buffer.concat(buff_array));
        ctx.drawImage(avatar, 25, 25, 200, 200);
        const card = canvas.toBuffer()
        await message.channel.send(new MessageAttachment(card,"rank.png"));
        message.channel.stopTyping();
      });
    } else {
      message.reply(member.user.tag + " is not ranked yet.");
    }
  },
  applyText: (canvas, text) => {
    const ctx = canvas.getContext("2d");
    // Declare a base size of the font
    let fontSize = 70;

    do {
      // Assign the font to the context and decrement it so it can be measured again
      ctx.font = `${(fontSize -= 30)}px sans-serif`;
      // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
  }
};
