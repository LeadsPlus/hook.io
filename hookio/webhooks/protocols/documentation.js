
/*
 * hookio/protocols/documentation
 * Implements a documentation protocol for generating various documentation for hook.io
 */

var hookIO = require('../../hookio').hookIO,
fs = require('fs');

exports.start = function() {
  //parseGitModules();
  parseMarkDownDocs();
  //parseTOC();
};

var parseMarkDownDocs = exports.parseMarkDownDocs = function(){

  var markdownBook = '';
  var htmlBook = '';
  var results = [];
  
  fs.readdir(hookIO.config.PATH + '/docs', function(err,files) {
    
    files = files.filter(function(x){
      return ('.md' === x.slice(-3));
    });
    
    readAllFiles(hookIO.config.PATH + '/docs/', files, 0, results, function(results){

      results.forEach(function(r){
        //markdownBook = markdownBook + r;
        htmlBook = htmlBook + r + '\n' + '\n' + '***' + '\n' + '\n'; // add line break and <hr>          
        markdownBook = markdownBook + r + '\n' + '\n' + '\n' + '\n'; // add line break and <hr>  
      });

      fs.writeFile('README.md', markdownBook , function (err) {
        if (err) throw err;
        hookIO.debug('the webhook book has been rendered for github : ' + 'README.md');
      });

      htmlBook = hookIO.protocol.markdown.parse(htmlBook);
      fs.writeFile(hookIO.config.PATH + '/docs/html/' + 'webhookBook' + '.html' , htmlBook , function (err) {
        if (err) throw err;
        hookIO.debug('the webhook book has been created and saved as html to : ' + hookIO.config.PATH + '/docs/html/' + 'webhookBook' + '.html');
      });
      
      
    });
  });
};

var parseTOC = exports.parseTOC = function(){
   fs.readFile('README.md', 'binary', function(err, data) {
     hookIO.debug(hookIO.protocol.markdown.parse(data));
   });
};

function readAllFiles(dir, files, index, results, complete) {
  if(index >= files.length) {
    complete(results);
    return;
  }
  //sys.puts('reading file: ' + hookIO.config.PATH + '/docs/' + files[index]);
  fs.readFile(dir + files[index], 'binary', function(err, data) {
    //if ('.md' == files[index].slice(-3)) {
    //  results[index] = data;  
    //}
    results[index] = data;
    index++;
    readAllFiles(dir, files, index, results, complete);
    
  });
}

// parse the .gitmodules file
var parseGitModules = exports.parseGitSubmodules = function(){
  fs.readFile('.gitmodules', 'binary', function(err, data) {
    // move this require somewhere else
    var results = require('ini').parse(data);
    sys.puts(JSON.stringify(results));
  });
};