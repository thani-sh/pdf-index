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
    dc('Word is in Index',res)
  })
}

db.link.on('open',function(){
  lookup('vehicle')
})