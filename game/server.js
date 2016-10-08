var Client = require('../clients');

/*
   Main server logic - handle everything game-related here
   */

var GameLoop = function(fn, frameRate) {
  /**
    Length of a tick in milliseconds. The denominator is your desired framerate.
    e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
    */
  var tickLengthMs = 1000 / frameRate;

  /* gameLoop related variables */
  // timestamp of each loop
  var previousTick = Date.now();
  // number of times gameLoop gets called
  var actualTicks = 0;

  var gameLoop = function () {
    var now = Date.now();

    actualTicks++;
    if (previousTick + tickLengthMs <= now) {
      var delta = (now - previousTick) / 1000;
      previousTick = now;

      update(delta);

      actualTicks = 0;
    }

    if (Date.now() - previousTick < tickLengthMs - 16) {
      setTimeout(gameLoop);
    } else {
      setImmediate(gameLoop);
    }
  }


  /**
    Update is normally where all of the logic would go. In this case we simply call
    a function that takes 10 milliseconds to complete thus simulating that our game
    had a very busy time.
    */
  var update = function(delta) {
    fn(delta);
  }

  return {
    start: function() {
      // begin the loop !
      gameLoop();
    }
  }
}

var Server = function() {

  var mainLoop = function(delta) {
    var ids = Client().all();
    for (var i = 0; i < Client().count(); i++) {
      var client = Client().get(ids[i]);
      if (client) {
        var data = Client().get(ids[i]).data();
        data.player.x += data.player.direction * 30 * delta;
        if (data.player.direction > 0 && data.player.x > 300) {
          data.player.x = 0;
        }
        if (data.player.direction < 0 && data.player.x < 0) {
          data.player.x = 300;
        }
      }
    }
  }

  GameLoop(mainLoop, 60).start();

  return {

    connection: function(id) {
      console.log('Client', id, 'connected!');
      console.log('Total:', Client().count());

      // Send welcome message
      var client = Client().get(id);
      if (client) {
        client.data().player = {
          x: 10,
          y: 50,
          direction: 1
        };
        client.emit('welcome', {
          id: id,
          players: Client().allData()
        });
        client.broadcast('playerJoin', {
          players: Client().allData()
        });
      }
    },
    on: function(event, msg) {
      console.log('Server received');
      console.log('Event:', event, 'Message:', msg);
      switch (event) {
        case 'playerDirection': 
          var client = Client().get(msg.clientId);
          if (client) {
            client.data().player.direction = msg.direction;
            client.broadcast('updatePlayerDirection', { 
              player: msg.clientId, 
              x: client.data().player.x,
              y: client.data().player.y,
              direction: client.data().player.direction
            });
          }
          break;  
      }
    },
    disconnect: function(id) {
      var client = Client().get(id);
      if (client) {
        client.broadcast('playerDisconnect', {
          player: id
        });
        console.log('Client', id, 'disconnected!');
        console.log('Total:', Client().count());
      }
    }

  }

}

module.exports = Server;
