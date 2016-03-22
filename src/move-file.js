(function(){
  'use strict';
  var fs = require('fs');

  module.exports = function(src, dest, fn) {
    fs.rename(src, dest, function(err){
      if(err){
        if(err.code === 'EXDEV') {
          copy();
        } else {
          fn(err);
        }
        return;
      }
      fn();
    });

    function copy(){
      var rs = fs.createReadStream(src);
      var ws = fs.createWriteStream(dest);
      rs.on('error', fn);
      ws.on('error', fn);
      rs.on('close', function(){
        fs.unlink(src, fn);
      });
      rs.pipe(ws);
    }
  };
})();
