global.SOCKET_CLIENTS = {};
global.CLIENT_DATA = {};
var Client = function() {
	return {
		add: function(socket) {
	    global.SOCKET_CLIENTS[socket.id] = socket;
	    global.CLIENT_DATA[socket.id] = {};
		},
		remove: function(socketId) {
	    delete global.SOCKET_CLIENTS[socketId];
	    delete global.CLIENT_DATA[socketId];
		},
		count: function() {
	    return Object.keys(global.SOCKET_CLIENTS).length;
		},
    all: function() {
      return Object.keys(global.SOCKET_CLIENTS);
    },
    allData: function() {
      return global.CLIENT_DATA;
    },
		get: function(id) {
	    if (!global.SOCKET_CLIENTS[id]) return null;
	    return {
        data: function() {
          return global.CLIENT_DATA[id];
        },
        emit: function(eventName, data) {
          if (global.SOCKET_CLIENTS[id]) {
            global.SOCKET_CLIENTS[id].send(Buffer.from(JSON.stringify({ event: eventName, message: data })));
          }
				},
				broadcast: function(eventName, data) {
					Object.keys(global.SOCKET_CLIENTS).map(function(cid) {
						if (cid != id) {
							global.SOCKET_CLIENTS[cid].send(Buffer.from(JSON.stringify({ event: eventName, message: data })));
						}
					});
				}
	    }
		}
	}
}

module.exports = Client;
