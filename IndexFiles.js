var mongoose      = require('mongoose');
    mongoose.connect('mongodb://user:pass@ds031867.mongolab.com:31867/booksearch');
var db            = mongoose.connection;
var Schema        = mongoose.Schema;
var child_process = require('child_process')
var debug         = true

var BookSchema = new Schema({
  p : { type:String, trim:true },
  m : { type:String, trim:true },
  t : { type:String, trim:true },
  i : { type:Boolean }
})

var Book = mongoose.model('Book',BookSchema)

function isResultEmpty(obj) {
  if(obj===undefined) return true
  if(obj.constructor == Array)
    if(obj.length == 0) return true
  return false
}

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function indexAllBooks(books){
  if(isResultEmpty(books))
    return dc('Nothing to Index')
  dc('Indexing New/Modified Books',books)
  bcount = books.length
  for(i=0;i<bcount;i++){
    indexBook(books[i])
  }
}

function indexBook(book){
  dc('Indexing Book',[book,['.'+book.p,'text'+book.p.replace(/\//g,'-')+'.txt']])
  var p2t = child_process.spawn('pdftotext',['.'+book.p,'text'+book.p.replace(/\//g,'-')+'.txt'])
  p2t.on('data',function(data){
    dc('Converting PDf to TXT',data)
  })
  book.i = true
  book.save(function(err){
    if(err)
      dc('Save Error',err)
    else
      dc('Index Status Updated')
  })
}

db.on('open',function(){
  Book.find( null ,function(err,res){
  // Book.find( { i:false } ,function(err,res){
    if(err)
      return dc('Cannot Find New Book')
    if(!res)
      return dc('No New books')
    indexAllBooks(res)
  })
})