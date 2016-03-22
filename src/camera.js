(function(){
  'use strict';

  var EventEmitter = require('events').EventEmitter;

  var spawn = require('child_process').spawn;

  module.exports = Camera;

  function Camera(config) {
    if(!(this instanceof Camera)) return new Camera();
    EventEmitter.call(this);

    var args = [
      '--capture-image-and-download',
      '--force-overwrite'
    ];

    var context;

    this.on('capture-start', function(){
      context={};
    });

  }

  Camera.prototype = Object.create(EventEmitter.prototype);

})();
