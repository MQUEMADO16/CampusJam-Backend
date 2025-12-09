require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app'); // Ensure this path matches your folder structure

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL || "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {

  socket.on('join_chat', (userId) => {
    const roomName = String(userId); 
    
    socket.join(roomName);
    console.log(`Socket: User with Socket ID ${socket.id} joined room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    // console.log('Socket: User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));