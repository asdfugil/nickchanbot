@echo off
echo STARTING THE BOT...
:START
node --max_old_space_size=8000 bot.js > logs.txt
goto START
