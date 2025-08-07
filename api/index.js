// Importăm pachetul Express.js pentru a crea serverul
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Importăm pachetul mongoose pentru a ne conecta la MongoDB
const mongoose = require('mongoose');

// Schimbă acest șir cu șirul tău de conectare de la MongoDB Atlas
const MONGODB_URI = "mongodb+srv://Mimi:Mvers320699@cluster0.03xkswe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Conectarea la baza de date
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectat la MongoDB'))
  .catch(err => console.error('Eroare la conectare:', err));

// Definim un model pentru utilizatori
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Middleware pentru a parsa corpul cererilor HTTP
app.use(express.json());

// Rota de test
app.get('/api', (req, res) => {
  res.send('Serverul funcționează!');
});

// Rota pentru înregistrarea unui nou utilizator
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).send({ message: 'Utilizator înregistrat cu succes!' });
  } catch (error) {
    res.status(400).send({ message: 'Eroare la înregistrare.', error });
  }
});

// Rota pentru autentificare (login)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).send({ message: 'Email sau parolă incorectă.' });
    }
    res.send({ message: 'Autentificare reușită!', user });
  } catch (error) {
    res.status(500).send({ message: 'Eroare de server.', error });
  }
});

// Pornim serverul
app.listen(port, () => {
  console.log(`Serverul rulează pe http://localhost:${port}`);
});
