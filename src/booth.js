(function(){
  'use strict';

  const EventEmitter = require('events').EventEmitter;
  const express = require('express');
  const socketIO = require('socket.io');
  const http = require('http');
  const fs = require('fs');
  const mdns = require('mdns');
  const Camera = require('./camera.js');
  const Renderer = require('./renderer.js');

  module.exports = Booth;

  function Booth(config) {
    if(!(this instanceof Booth)) return new Booth();
    EventEmitter.call(this);

    var app = expres();
    var web = http.createServer(exp);
    var io = socketIO(web);

    var camera = new Camera(config);
    var renderer = new Renderer(config);

    var ad = mdns.createAdvertisement(mdns.tcp('xbooth','api-v1'), config.port);

    app.use(epxress.static(__dirname + "/../app"));

    app.use('dcim', express.static(config['dcim-path']));
    app.use('render', express.static(config['render-path']));

    io.on('connection', function(socket){
      socket.on('start', function(fn){
        if(camera.capturing || renderer.rendering) {
          return fn('Booth already started!');
        }

        camera.emit('start-capture');
      });

      socket.on('stop', function(fn){
        if(camera.capturing) {
          return camera.emit('stop-capture');
        }

        if(renderer.rendering) {
          return renderer.emit('stop-rendering');
        }

        fn('booth is already stopped');
      });

      socket.emit('connected', config);
    });

    camera.on('capture-started', function(ctx) {
      renderer.start(ctx);
      io.emit('capture-started', ctx);
    });

    camera.on('capture-aborted', function(ctx){
      io.emit('capture-aborted', ctx);
    });

    camera.on('capture-stopped', function(ctx){
      io.emit('capture-stopped', ctx);
    });

    camera.on('capture-countdown', function(ctx){
      io.emit('capture-countdown', ctx);
    });

    camera.on('capture-snapped', function(ctx) {
      io.emit('capture-snapped', ctx);
      renderer.render(ctx)
    });

    camera.on('capture-complete', function(ctx) {
      io.emit('capture-complete', ctx);
      renderer.finalize(ctx);
    });

    camera.on('error', function(e){
      this.emit('error', e);
      io.emit('error', e);
    });

    renderer.on('render-complete', function(ctx){
      io.emit('render-complete', ctx);
    });

    this.start = function() {
      web.listen(config.port, function(){
        console.log('Photobooth listening on port %s', config.port);
      });
      ad.start();
    };

  }

  Booth.prototype = Object.create(EventEmitter.prototype);

})();
