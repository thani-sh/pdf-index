var mongoose = require('mongoose')
    mongoose.connect('mongodb://admin:password@host:port/database')
var Schema   = mongoose.Schema
var debug    = false

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

var BookSchema = new Schema({
  l : /* Location     */ { type:String, trim:true },
  m : /* MD5 Hash     */ { type:String, trim:true },
  t : /* Book Title   */ { type:String, trim:true },
  p : /* No. of Pages */ { type:Number, min:1 },
  i : /* Index Status */ { type:Boolean }
})
var WordSchema = new Schema({
  w : /* The KeyWord  */ { type:String, trim:true, lowercase:true, index:true },
  b : /* Book ID      */ Schema.ObjectId,
  p : /* Page Number  */ { type:Number, min:1 },
})

exports.mngs = mongoose
exports.link = mongoose.connection
exports.Book = mongoose.model('Book',BookSchema)
exports.Word = mongoose.model('Word',WordSchema)
exports.iLft = 0

exports.processAndExit = function(){
  setInterval(
    function(){
      if(exports.iLft==0){
        mongoose.connection.close()
        mongoose.disconnect()
        dc('Bye Bye')
        process.exit(0)
      }
    },
    1000
  )
}
