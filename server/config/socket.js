const { Server } = require('socket.io');

let ioInstance = null;

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    // Join room for a specific show
    socket.on('join_show_room', (showId) => {
      if (showId) {
        socket.join(`show_${showId}`);
      }
    });

    // Leave room for a specific show
    socket.on('leave_show_room', (showId) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

module.exports = { initSocket, getIO };
