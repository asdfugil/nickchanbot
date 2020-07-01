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
    is_dm:{ type:BOOLEAN }
},{ tableName:'snipe messages'})
const language = sequelize.define('guild_languages',{
  id:{ type:STRING,primaryKey:true },
  lauguage:{ type:STRING }
})
sequelize.sync({force:false})
module.exports = { snipe,language }