const { Message } = require('discord.js')
module.exports = {
  name: 'purge',
  args: 1,
  guildOnly: true,
  usage: { en: '<count>' },
  clientPermissions: ['MANAGE_MESSAGES'],
  userPermissions: ['MANAGE_MESSAGES'],
  /**
   * Purge command
   * @param { Message } message 
   * @param { string[] } args 
   */
  async execute(message, args) {
    const targetCount = parseInt(args[0])
    if (isNaN(targetCount)) return message.reply('Invalid number')
    if (targetCount < 2 || targetCount > 1000) return message.reply('<count> must be between 2 and 1000 (Including 2 and 1000)')
    const notifyMsg = await message.channel.send('Searching messages...')
    const deathRow = []
    while ((targetCount - deathRow.length) > 0) {
      const fetchedMsgs = await message.channel.messages.fetch({
        limit: (targetCount - deathRow.length) > 100 ? 100 : targetCount - deathRow.length,
        before: deathRow[deathRow.length - 1]?.id || message.id
      })
      if (fetchedMsgs.size === 0) break
      deathRow.push(...fetchedMsgs.array())
    }
    const finalDeathRow = deathRow.filter(x => !x.pinned && x.createdTimestamp > (Date.now() - 1209600000))
    if (finalDeathRow.size === 0) return message.reply('No messages are found to delete.\nNote: Messages older than 14 days cannot be purged and pinned messages are not deleted.')
    let executeGroups = []
    for (let i = 0;i < finalDeathRow.length - 1; i += 100) {
      executeGroups.push(finalDeathRow.slice(i,i+100))
    }
    notifyMsg.edit('Deleting messages...')
    for (const group of executeGroups) {
      await message.channel.bulkDelete(group)
    }
    notifyMsg.edit(`Deleted ${finalDeathRow.length} messages.`)
  }
}