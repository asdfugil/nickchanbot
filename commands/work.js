const Keyv = require("keyv")
const gEconcomy = new Keyv("sqlite://.data/database.sqlite",{ namespace:"economy" })
module.exports = {
  name:'work',
  hidden:true,
  description:'works and earn money'
}