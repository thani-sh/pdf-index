var db    = require('./Storage.js')
var spawn = require('child_process').spawn
var debug = true

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function isResultEmpty(obj) {
  if(obj===undefined || obj===null) return true
  if(obj.constructor == Array)
    if(obj.length == 0) return true
  return false
}

function indexAllBooks(books){
  if(isResultEmpty(books)){
    dc('Nothing to Index')
  } else {
    bcount = books.length
    dc('Found '+bcount+' Books to index',books)
    for(i=0;i<bcount;i++){
      db.iLft+=books[i].p
      indexBook(books[i])
    }
  }
  db.processAndExit()
}

function indexBook(book){
  for(p=1;p<=book.p;p++){
    indexPage(book,p)
  }
  book.i = true
  book.save(function(err){
    if(err)
      return dc('Error changing book index status',[err,book])
    else
      return dc('Index Status Updated')
  })

}

function indexPage(book,pageNo){
  p2t = spawn('pdftotext',['-f',pageNo,'-l',pageNo,book.l,'-'])
  p2t.stdout.on('data',function(data){
    words    = data.toString().match(/[^.,:;\/'"“\\”?!\-—\n\f\t ]{2,}/g)
    wcount   = words.length
    db.iLft += wcount - 1
    dc('Text File Contents',wcount+' words on page '+pageNo)
    for(i=0;i<wcount;i++){
      addToIndex(book,pageNo,words[i])
    }
  })
}

function addToIndex(book,pageNo,word){
  db.Word.findOne(
    { 'w':word, 'b':book._id, 'p':pageNo },
    function (err,res){
      if(isResultEmpty(res)){
        var mWord = new db.Word( { 'w':word, 'b':book._id, 'p':pageNo } )
        mWord.save(function(err){
          if(err)
            return dc('Save Error',err)
          dc('Added to index',mWord)
          db.iLft--
        })
      } else {
        dc('Already Indexed')
        db.iLft--
      }
    }
  )
}

db.link.on('open',function(){
  db.Book.find( { i:false } ,function(err,res){
    if(err)
      return dc('Cannot Find New Book')
    if(isResultEmpty(res)){
      dc('No New books')
    }
    indexAllBooks(res)
  })
})