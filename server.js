const express = require('express');
const path = require('path');
const chatApi = require('./api/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurația pentru a servi fișierele statice din folderul "public"
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Utilizează noul endpoint pentru chat
app.post('/api/chat', chatApi);

// Redirecționează toate cererile nespecificate către index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pornirea serverului
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
