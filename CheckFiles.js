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

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function crawlBooks(path){
  var ls = child_process.spawn('find',[path,'-name','*','-regex','.*\\.pdf'])
  ls.stdout.on('data',function(data){
    var fpaths  = data.toString().split('\n')
    var fcount  = fpaths.length
    var files   = []
    dc('Files Found By Crawler',fpaths)
    for(i=0;i<fcount;i++){
      if(!fpaths[i]) continue
      var md5 = child_process.spawn('md5sum',[fpaths[i]])
      md5.stdout.on('data',function(data){
        data = data.toString()
        md5  = data.substring(0,32)
        path = data.substring(35,data.length-1)
        book = { 'p':path, 'm':md5, 't':'', i:false }
        dc('Checking Book:',book)
        checkIfModified(book)
      })
    }
  })
}

function checkIfModified(book){
  dc('Checking If Book is Modified',book.p)
  Book.findOne(
    { 'p':book.p },
    function(err,res){
      if(!res)
        checkIfMoved(book)
      else {
        dc('A book is already available at path')
        if(res.m!=book.m){
          dc('Book is Modified')
          res.i = false
          res.save(function(err){
            if(err)
              dc('Save Error',err)
            else
              dc('Book status updated to non-indexed')
          })
        }
        else {
          dc('Nothing to update')
        }
      }
    }
  )
}

function checkIfMoved(book){
  dc('Checking If Book is Moved',book.p)
  Book.findOne(
    { 'm':book.m },
    function(err,res){
      if(!res)
        addBook(book)
      else {
        dc('This book is already available')
        if(res.p!=book.p){
          dc('Book is Moved')
          res.p = book.p
          res.save(function(err){
            if(err)
              dc('Save Error',err)
            else
              dc('Book path changed')
          })
        }
      }
    }
  )
}

function addBook(book){
  dc('Adding New Book')
  var book = new Book(book)
  book.save(function(err){
    if(err)
      dc('Save Error',err)
    else
      dc('New book added')
  })
}

db.on('open',function(){
  crawlBooks('./books')
})