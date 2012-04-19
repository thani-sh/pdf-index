var db    = require('./Storage.js')
var spawn = require('child_process').spawn
var debug = true

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function crawlBooks(location){
  ls = spawn('find',[location,'-name','*','-regex','.*\\.pdf'])
  ls.stdout.on('data',function(data){
    flocations  = data.toString().split('\n')
    flocations.pop() // Remove Last Empty String
    fcount  = flocations.length
    dc('Files Found By Crawler',flocations)
    for(i=0;i<fcount;i++){
      checkNextBook(flocations[i])
    }
  })
}

function checkNextBook(location){
  var title = /\/([^\/]*)\.pdf/g.exec(location)[1]
  info = spawn('pdfinfo',[location])
  info.stdout.on('data',function(data){
    dc('Book Info',data.toString())
    var pn  = /Pages:\s+(\d+)/g.exec(data.toString())[1]
    md5 = spawn('md5sum',[location])
    md5.stdout.on('data',function(data){
      data = data.toString()
      md5  = data.substring(0,32)
      book = { 'l':location, 'm':md5, 't':title, 'p':pn, i:false }
      dc('Checking Book:',book)
      checkIfModified(book)
    })
  })
}

function checkIfModified(book){
  dc('Checking If Book is Modified',book.l)
  db.Book.findOne(
    { 'l':book.l },
    function(err,res){
      if(!res)
        checkIfMoved(book)
      else {
        dc('A book is already available at path')
        dc('Compare MD5',[res.m,book.m])
        if(res.m!=book.m){
          dc('Book is Modified')
          res.i = false
          res.save(function(err){
            if(err)
              dc('Save Error',err)
            else
              dc('Book status updated to non-indexed',book)
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
  dc('Checking If Book is Moved',book.l)
  db.Book.findOne(
    { 'm':book.m },
    function(err,res){
      if(!res)
        addBook(book)
      else {
        dc('This book is already available')
        if(res.l!=book.l){
          dc('Book is Moved')
          res.l = book.l
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
  book = new db.Book(book)
  book.save(function(err){
    if(err)
      dc('Save Error',err)
    else
      dc('New book added')
  })
}

db.link.on('open',function(){
  crawlBooks('./books')
})