var spawn = require('child_process').spawn
var debug = true

var isChecking = false
var isIndexing = false

function dc(title,variable){
  if(!debug) return
  console.log('\n#DEBUG:'+title)
  if(variable) console.log(variable)
}

function checkForNewBooks(){
  if(isChecking)
    return
  dc('Checking For New Books')
  isChecking = true
  check = spawn('node',['CheckFiles.js'])
  check.on('exit',function(code){
    indexNewBooks()
  })
}

function indexNewBooks(){
  dc('Indexing Books (if any)')
  index = spawn('node',['IndexFiles.js'])
  index.on('exit',function(code){
    isChecking = false
  })
}

setInterval(
  function(){
    checkForNewBooks()
  }
  , 5 * 1000
)