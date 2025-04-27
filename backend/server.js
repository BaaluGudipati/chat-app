const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let users = [];
let chatHistory = [];

const avatars = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
];

const MAX_HISTORY = 50;

function getAvatarForUsername(username) {
  const hash = crypto.createHash('md5').update(username).digest('hex');
  const index = parseInt(hash.substring(0, 8), 16) % avatars.length;
  return avatars[index];
}

app.use(cors());

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('chatHistory', chatHistory);

  // Handle user login
  socket.on('login', (username) => {
    const existingUserIndex = users.findIndex((user) => user.username === username);
    const avatar = getAvatarForUsername(username);
    
    if (existingUserIndex !== -1) {
      // User exists, update their ID and avatar
      users[existingUserIndex].id = socket.id;
      users[existingUserIndex].avatar = avatar;
    } else {
      // New user, add to the users list
      users.push({ id: socket.id, username, avatar });
    }

    socket.username = username;
    socket.avatar = avatar;

    socket.emit('userAvatar', avatar);
    io.emit('userList', users);
    
    // Only show this once when a user logs in
    const joinMessage = {
      user: 'System',
      message: `${username} has joined the chat`,
      avatar: 'https://i.pravatar.cc/150?img=1',
      timestamp: new Date().toISOString(),
      system: true
    };
    
    chatHistory.push(joinMessage);
    if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
    io.emit('receiveMessage', joinMessage);
  });

  // Handle user sending a message
  socket.on('sendMessage', (messageData) => {
    const user = users.find((u) => u.id === socket.id);
    
    if (user) {
      const fullMessage = { 
        user: user.username,
        message: messageData.message,
        avatar: user.avatar,
        timestamp: new Date().toISOString() 
      };
      
      chatHistory.push(fullMessage);
      if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
      
      io.emit('receiveMessage', fullMessage);
    }
  });

  // Handle user typing
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const disconnectedUser = users.find(user => user.id === socket.id);
    if (disconnectedUser) {
      const username = disconnectedUser.username;
      users = users.filter((user) => user.id !== socket.id);
      
      io.emit('userList', users);
      
      // Only show this once when a user disconnects
      const leaveMessage = {
        user: 'System',
        message: `${username} has left the chat`,
        avatar: 'https://i.pravatar.cc/150?img=1',
        timestamp: new Date().toISOString(),
        system: true
      };
      
      chatHistory.push(leaveMessage);
      if (chatHistory.length > MAX_HISTORY) chatHistory.shift();
      io.emit('receiveMessage', leaveMessage);
    }
  });
});

// app.use(express.static(path.join(__dirname, '../frontend/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
