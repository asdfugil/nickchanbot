#!/usr/bin/env node
const oldDBPath = process.argv[2]
const newDBPath = process.argv[3]
const { execSync } = require('child_process')
if (!oldDBPath || !newDBPath) {
  console.log(`Usage: convert.js <old database> <new database>`)
  process.exit(1)
}
const { DataTypes } = require('sequelize')
const { Sequelize } = require('sequelize')
const { TEXT, BOOLEAN, DATE, JSON, STRING } = DataTypes
const oldDB = new Sequelize(`sqlite://${oldDBPath}`)
const newDB = new Sequelize(`sqlite://${newDBPath}`)
oldDB.authenticate()
newDB.authenticate()
const snipe = newDB.define('snipe_message', {
  content: { type: TEXT },
  created_at: { type: DATE },
  author_tag: { type: TEXT },
  author_avatar_url: { type: TEXT },
  channel_id: { type: TEXT, primaryKey: true },
  is_dm: { type: BOOLEAN },
  attachments: { type: STRING }
}, { tableName: 'snipe messages' })
const language = newDB.define('guild_languages', {
  id: { type: STRING, primaryKey: true },
  lauguage: { type: STRING }
})
const guild_rank = newDB.define('guild_rank', {
  guild_id: { type: STRING, primaryKey: true },
  ranks: { type: JSON }
})
const tags = newDB.define('tags', {
  guild_id: { type: STRING, primaryKey: true },
  tags: { type: JSON }
})
const mute_info = newDB.define('mute_info', {
  guild_id: { type: STRING, primaryKey: true },
  muted_role: { type: STRING },
  mutes: { type: JSON }
})
const loggers = newDB.define('logger',{
  guild_id: { type:STRING },
  type: { type:STRING },
  webhook_id:{ type:STRING,primaryKey:true },
  webhook_token: { type:STRING }
})
const keyv = oldDB.define('keyv',{
  key:{ type:STRING,primaryKey:true },
  value:{ type:STRING }
},{ tableName:'keyv',timestamps:false })
const rank_background = newDB.define('rank_background',{ 
  user_id:{ type: STRING,primaryKey:true },
  url:{ type:STRING }
})
const prefixes = newDB.define('prefix',{
  guild_id:{ type:STRING },
  prefix:{ type:STRING }
})
newDB.sync({ force: true })
oldDB.sync({})
const all = keyv.findAll()
const newRank = all.filter(m => m?.dataValues?.key?.startsWith?.('rank:')).map(x => {
  const value = {}
  value.guild_id = x.dataValues.key.replace('rank:','')
  value.ranks = x.dataValues.value
  return value
})
for (const rank of newRank) {
  guild_rank.upsert(rank)
}
console.log(oldDB)