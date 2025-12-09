require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket: User connected:', socket.id);

  // Allow user to join a "room" with their own User ID
  socket.on('join_chat', (userId) => {
    socket.join(userId);
    console.log(`Socket: User ${userId} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    // console.log('Socket: User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));