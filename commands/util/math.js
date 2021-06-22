require('dotenv').config()
const math = require('mathjs')
const prefix = process.env.PREFIX
module.exports = {
  name:'math',
  args:true,
  description:{ en: 'a calculator' },
  cooldown:1.5,
  aliases:['calc','calculator'],
  usage:{ en: ' <expression>' },
  info:{ en:`How to write expressions: https://mathjs.org/docs/expressions/syntax.html
evalulate : a simple calculator
simplify : simplify algebraic expressions
` },
  execute:async (message,args) => { 
    try {
    const result = math.evaluate(args.join(" "))
       message.channel.send(result?.toString() || 'undefined',{code:'xl'})
    } catch (error) {
    message.channel.send(`${error.name}:${error.message}`,{code:'xl'})
  }
 }
}
