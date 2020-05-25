#!/usr/bin/env node
const ytdl = require('ytdl')
const stream = null
const exit_handler = () => {
    if (stream) {
    stream.unpipe(process.stdout)
    stream.destroy()
    }
    process.exit()
}
process.on('SIGTERM',exit_handler)
process.on('SIGINT',exit_handler)
process.on('message',message => {
    const msg = JSON.parse(message)
    switch (msg.type) {
        case 'play' :{
            stream = ytdl(msg.payload.url,{ options:['lowestvideo','highestaudio'] })
            stream.pipe(stream)
        }
        case 'end': {
            stream.unpipe(process.stdout)
            stream.destroy()
        } 
    }
})