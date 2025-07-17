require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);

// --- THE CRITICAL FIX ---
// We are making the Socket.IO CORS settings as permissive as possible for this test.
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('socketio', io);

// Standard Express CORS for the REST API
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

io.on('connection', (socket) => {
  console.log(`DIAGNOSTIC: Socket connection established successfully. ID: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`DIAGNOSTIC: Socket disconnected. ID: ${socket.id}`);
  });
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/tasks', require('./routes/tasks.js'));
app.use('/api/logs', require('./routes/logs.js'));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});