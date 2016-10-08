function Game () { 
  var self = this;
  self.players = {};
  addEventListener('keydown', self.handleKeyboard.bind(self));
};

Game.prototype.initPlayer = function() {
  return {
    x: 10,
    y: 50,
    direction: 1
  }
}

Game.prototype.handleKeyboard = function(event) {
  var self = this;
  console.log('gotcha');
  if ((event.keyCode || event.which) == 16) { 
    if (self.players[clientId]) {
      self.players[clientId].direction *= -1;
      emit('playerDirection', {
        clientId: clientId,
        direction: self.players[clientId].direction
      });
    }
  }
}

Game.prototype.updatePlayerList = function(playersData) {
  var self = this;
  var players = Object.keys(playersData);
  for (var i = 0; i < players.length; i++) {
    var pid = players[i];
    self.players[pid] = playersData[pid].player;
  }
}

Game.prototype.handleNetwork = function(socket) {
  var self = this;
  //Network callback

  socket.on('open', function() {
    socket.on('message', function(data) {
      var msg = JSON.parse(BufferUtil().toString(data));
      if (msg.event == 'welcome') {
        clientId = msg.message.id;
        self.updatePlayerList(msg.message.players); 
        console.log('All players', self.players);
      }
      if (msg.event == 'playerJoin') {
        self.updatePlayerList(msg.message.players); 
        console.log('New player joined', self.players);
      }
      if (msg.event == 'updatePlayerDirection') {
        self.players[msg.message.player] = {
          x: msg.message.x,
          y: msg.message.y,
          direction: msg.message.direction
        }
      }
      if (msg.event == 'playerDisconnect') {
        delete self.players[msg.message.player];
      }
    });
    socket.on('close', function(){});
  });
}

Game.prototype.updatePlayer = function(delta, player) {
  player.x += player.direction * 30 * delta;  
  if (player.direction > 0 && player.x > 300) {
    player.x = 0;
  }
  if (player.direction < 0 && player.x < 0) {
    player.x = 300;
  }
}

Game.prototype.handleLogic = function(delta) {
  var self = this;
  //Update loop
  for (var i = 0; i < Object.keys(self.players).length; i++) {
    var pid = Object.keys(self.players)[i];
    self.updatePlayer(delta, self.players[pid]);
  }
}

Game.prototype.handleGraphics = function(graphics) {
  //Draw loop
  var self = this;

  graphics.fillStyle = '#333333';
  graphics.fillRect(0, 0, screenWidth, screenHeight);

  graphics.fillStyle = '#222';
  graphics.fillRect(0, 40, 300, 20);

  for (var i = 0; i < Object.keys(self.players).length; i++) {
    graphics.beginPath();
    var pid = Object.keys(self.players)[i];
    console.log('Drawing ', pid);
    if (pid == clientId) {
      graphics.fillStyle = '#fff';
    } else {
      graphics.fillStyle = '#f00';
    }
    graphics.arc(parseInt(self.players[pid].x), parseInt(self.players[pid].y), 3, 0, Math.PI * 2, true);
    graphics.fill();
  }
  
  graphics.fillStyle = '#FFF';
  graphics.font = '12px Tahoma';
  var playerCount = Object.keys(self.players).length;
  graphics.fillText('Total players: ' + playerCount, 10, 10);
}
