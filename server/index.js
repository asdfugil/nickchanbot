#!/usr/bin/env node
require('dotenv').config()
const express = require('express');
const app = express();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPES, SESSION_SECRET } = process.env
const DiscordOAuth2 = require('discord-oauth2')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const https = require('https')
const fs = require('fs');
app.use(session({
  cookie: { secure: true, maxAge: 604800000 }, // valid for 14 days
  secret: SESSION_SECRET,
  store: new MemoryStore({
    checkPeriod: 900000 // prune expired entries every 24h
  })
}))
const oauth2 = new DiscordOAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
})
app.use(express.static('server/public', { extensions: ['html', 'htm', 'php', 'css', 'js', 'md', 'txt'] }));
app.listen(process.env.WEBSITE_PORT, function () {
  console.log('Example app listening on port' + process.env.PORT + "!");
});
app.use('/api', express.json())
app.use('/api/v1',(req,res,next) => {
  res.set('Content-Type','application/json')
  next()
})
app
  .get('/api/v1/login', (req, res) => {
    res.location(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=code`)
    res.status(308).end()
  })
  .get('/api/v1/callback', async (req, res) => {
    const { code } = req.query
    if (!code) return res.status(400).send('"No code providied"')
    const tokenInfo = await oauth2.tokenRequest({ code, grantType: 'authorization_code', scope: SCOPES })
    .catch(error => {
      console.error(error)
      return
    })
     if (!tokenInfo) return res.send('"Invalid code"')
    const [ user,guilds ] = await Promise.all([
      oauth2.getUser(tokenInfo.access_token),
      oauth2.getUserGuilds(tokenInfo.access_token)
    ])
    req.session.user = user
    req.session.guilds = guilds 
    req.session.tokenInfo = tokenInfo
    res.location('/').status(308).end()
  })
  .get('/api/v1/session',(req,res) => {
    if (req.session) {
      res.send(JSON.stringify({
        user:req.session.user,
        guilds:req.session.guilds
      }))
    } else res.status(401).send('"No such session"')
  })
  .post('/api/v1/logout',(req,res) => {
    req.session.destroy()
    res.send('"OK"')
  })
  .use('/api/v1/*',(req,res) => {
    res.send('"Not Found"')
  })
https.createServer({
  key:fs.readFileSync('./server/ssl/private.pem','utf8'),
  cert:fs.readFileSync('./server/ssl/certificate.crt','utf8')
},app).listen(process.env.PORT || 4000)