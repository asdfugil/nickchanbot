require('dotenv').config()
const express = require('express')
const app = express()
const Keyv = require('keyv')
const db = 'sqlite://' + __dirname + '/.data/database.sqlite'
const ranks = new Keyv(db,{ namespace:'ranks' })
const languages = new Keyv(db,{ namespace:'languages' })
app.use(express.json())
app.use('/',(req,res,next) => {
    if (req.headers.authorization !== process.env.API_KEY) {
        res.set('www-authenticate',`Bearer realm="Access to bot's database and functions"`)
        return res.status(401).send('401')
    }
    else next()
})
app.get('/guilds/:guild_id/ranks',async (req,res) => {
    const result = await ranks.get(req.params.guild_id)
    if (!result) res.status(404).send('"Invalid guild id provided"')
    else res.send(result)
})
app.get('/guilds/:guild_id/language',async (req,res) => {
    const id = req.params.guild_id
    const result = await languages.get(id)
    if (!result) res.status(404).send('"Not Found"')
    else res.send(`"${result}"`)
})
app.put('/guilds/:guild_id/language',async (req,res) => {
    const lang = req.body.lang
    await languages.set(req.params.guild_id,lang)
    res.send(`true`)
})
app.get('/guilds/:guild_id/logs/:type',async (req,res) => {
    
})
app.post('/guilds/:guild_id/logs/:type',async (req,res) => {
    
})
app.delete('/guilds/:guild_id/logs/:type',async (req,res) => {
    
})
app.get('/guilds/:guild_id/muted/role',async (req,res) => {
    
})
app.post('/guilds/:guild_id/muted/role',async (req,res) => {
    
})
app.delete('/guilds/:guild_id/muted/role',async (req,res) => {
    
})
app.get('/guilds/:guild_id/muted/members',async (req,res) => {
    
})
app.put('/guilds/:guild_id/muted/members',async (req,res) => {
    
})
app.delete('/guilds/:guild_id/muted/members',async (req,res) => {
    
})
app.listen(process.env.API_SERVER_PORT)
