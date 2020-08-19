const { Sequelize,DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite://.data/database.sqlite',{ logging:false })
const { TEXT,BOOLEAN,DATE,JSON,STRING } = DataTypes
sequelize.authenticate();
const snipe = sequelize.define('snipe_message',{
    content:{ type:TEXT },
    created_at:{ type:DATE },
    author_tag:{ type:TEXT },
    author_avatar_url:{ type:TEXT },
    channel_id:{ type:TEXT,primaryKey:true },
    is_dm:{ type:BOOLEAN },
    attachments:{ type:STRING }
},{ tableName:'snipe messages'})
const language = sequelize.define('guild_languages',{
  id:{ type:STRING,primaryKey:true },
  lauguage:{ type:STRING }
})
const guild_rank = sequelize.define('guild_rank',{
  guild_id:{ type:STRING,primaryKey:true },
  ranks:{ type:JSON }
})
const tags = sequelize.define('tags',{ 
  guild_id:{ type:STRING,primaryKey:true },
  tags:{ type:JSON }
})
const mute_info = sequelize.define('mute_info',{ 
  guild_id:{ type:STRING,primaryKey:true },
  muted_role:{ type:STRING },
  mutes:{ type:JSON }
})
const rank_background = sequelize.define('rank_background',{ 
  user_id:{ type: STRING,primaryKey:true },
  url:{ type:STRING }
})
const prefixes = sequelize.define('prefix',{
  guild_id:{ type:STRING },
  prefix:{ type:STRING }
})
sequelize.sync({force:false})
module.exports = { snipe,language,guild_rank,tags,mute_info }
