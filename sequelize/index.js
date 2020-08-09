const { Sequelize,DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize('sqlite://.data/database.sqlite')
const { TEXT,BOOLEAN,DATE,JSON } = DataTypes
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
// { member_id:timestamp,member2_id:timestamp2 }
const mute_info = sequelize.define('mute_info',{ 
  guild_id:{ type:STRING,primaryKey:true },
  muted_role:{ type:STRING },
  mutes:{ type:JSON }
})
sequelize.sync({force:false})
module.exports = { snipe,language,guild_rank,tags,mute_info }
