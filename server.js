const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.json());

const users = {}; // Simpel penyimpanan user login (username: password)

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username dan password dibutuhkan' });

  if (!users[username]) {
    // Register user baru
    users[username] = password;
    return res.json({ success: true, message: 'Registrasi berhasil' });
  } else if (users[username] === password) {
    return res.json({ success: true, message: 'Login berhasil' });
  } else {
    return res.status(401).json({ error: 'Password salah' });
  }
});

io.on('connection', (socket) => {
  console.log('User  connected:', socket.id);

  socket.on('joinGame', (data) => {
    console.log('User  join game:', data);
    // Broadcast ke player lain
    socket.broadcast.emit('playerJoined', data);
  });

  socket.on('playerMove', (data) => {
    // Broadcast posisi player ke semua client
    socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log('User  disconnected:', socket.id);
    io.emit('playerLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
