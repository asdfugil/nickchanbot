const { Guild, Client } = require('discord.js')
const Opencc = require('opencc')
const t2s = new Opencc('t2s.json')
const s2t = new Opencc('s2t.json')
function returns(result, language) {
  if (!language.startsWith('zh_')) {
    return result[language] || result.en
  } else {
    if (language === 'zh_Hant') {
      if (result.zh) return s2t.convertSync(result.zh)
      else return result.en
    } else if (language === 'zh_CN') {
      if (result.zh) return t2s.convertSync(result.zh)
      else return result.en
    }
  }
}
/**
 * @param { string } phrase_id
 * @param { Guild | undefined } guild
 * @param { Client } client
 * @returns { string }
 */
module.exports = function t(phrase_id, client, guild) {
  if (!guild) guild = Object.create(null)
  const language = guild.language || 'en'
  const array = phrase_id.split(".")
  switch (array[0]) {
    case "commands": {
      const source = client.commands.get(array[1]).translations
      array.splice(0, 2)
      let result = source;
      for (const value of array) {
        result = result[value]
      }
      return returns(result, language)
    }
    case "modules": {
      const source = client.modules.get(array[1])
      array.splice(0, 2)
      let result = source;
      for (const value of array) {
        result = result[value]
      }
      return returns(result, language)
    }
    case "util": {
      const translations = require("../util_translations.json")
      array.shift()
      let result = translations
      for (const value of array) {
        result = result[value]
      }
      return returns(result, language)
    }
    case "help": {
      const source = client.commands.get(array[1])
      array.splice(0, 2)
      let result = source;
      for (const value of array) {
        result = result[value]
      }
      return returns(result, language)
    }
    case 'permissions': {
      const permissions = require('../documents/permissions.json')
      if (!permissions[phrase_id.split('.')[1]]) return 'undefined'
      return returns(permissions[phrase_id.split('.')[1]], language)
    }
    default: {
      return 'undefined'
    }
  }
}