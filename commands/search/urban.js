const ud = require("urban-dictionary");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
module.exports = {
  name: "urban",
  description: {en:"Look up a word on urban dictionary."},
  aliases: ["ud"],
  nsfw:true,
  supressNSFWwarning:true,
  async execute(message, args) {
    ud.term(args.join(" ") || "")
      .then(results => {
        const list = results.entries
          .map((entry, index) => (index + 1).toString() + "." + entry.word)
          .join("\n");
        message.channel.send(
          `Type the number to see the details. (10 seconds)\n${list}`,
          { code: true }
        );
        message.channel
          .createMessageCollector(
            x =>
              x.author.id === message.author.id &&
              parseInt(x.content) &&
              parseInt(x.content) < results.entries.length + 1,
            {
              maxMatches: 1,
              time: 10000
            }
          )
          .on("collect", async msg => {
            const entry = results.entries[parseInt(msg.content) - 1];
            const {
              definition,
              word,
              example,
              thumbs_up,
              thumbs_down,
              permalink,
              sound_urls,
              author,
              defid
            } = entry;
            const embed = new MessageEmbed()
              .setTitle(word)
              .setURL(permalink)
              .setDescription(definition)
              .addField("Example", example)
              .addField("Author", author)
              .addField("Definition ID", defid)
              .setFooter(`👍 ${thumbs_up} | 👎 ${thumbs_down}`)
              .setColor("RANDOM")
            const m = await message.channel.send({ embeds: [embed] });
            const target = sound_urls.find(x => x.startsWith("http://wav.urbandictionary.com/"))
            if (message.guild && !message.client.queue.get(message.guild.id) && target) {
              m.react("🔊");
              m.createReactionCollector(
                (x, user) =>
                  x.emoji.name === "🔊" && user.id === message.author.id,
                { time: 60000 }
              ).on("collect", async (reaction, user) => {
                await reaction.remove(user)
                if (!message.member.voice.channel)
                  return message.reply(
                    "You must be in a voice channel to listen to the pronunciation!."
                  );
                const sound = (await fetch(target)).body
                  message.member.voice.channel.join().then(connection => {
                    connection
                      .play(sound, { volume: 2, passes: 3 })
                      .on("speaking", speaking => {
                        if (speaking) return
                        connection.channel.leave()
                      });
                  });
              });
            }
          });
      })
  }
};
