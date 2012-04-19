var mongoose = require('mongoose')
    mongoose.connect('mongodb://admin:password@ds031867.mongolab.com:31867/booksearch')

var Schema   = mongoose.Schema
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

exports.link = mongoose.connection
exports.Book = mongoose.model('Book',BookSchema)
exports.Word = mongoose.model('Word',WordSchema)
