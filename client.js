var db    = require('./Storage.js')
var debug = true

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function lookup(word){
  db.Word.find( { w : word.toLowerCase() }, function(err,res){
    if(err)
      return dc('Lookup error')
    if(!res)
      return dc('Word not in index')
    displayAllResults(word,res)
  })
}

function displayResult(res){
  db.Book.findOne(
    { '_id' : res.b }
    ,function(err,book){
      if(err)
        return dc('Lookup error')
      if(!book)
        return dc('Book not in index',r.b)
      console.log('\n\t * Page '+res.p+' of Book: '+book.t+' ('+book.l+')')
      db.iLft--
    }
  )

}

function displayAllResults(word,data){
  // dc('Results for '+word,data)
  dcount  = data.length
  db.iLft = dcount
  db.processAndExit()
  for(i=0;i<dcount;i++){
    r = data.pop()
    displayResult(r)
  }
}

db.link.on('open',function(){
  lookup('vehicle')
})