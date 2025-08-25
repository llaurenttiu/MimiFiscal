// Importăm pachetele necesare
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Importăm bcrypt pentru a cripta parolele
const app = express();

// Șirul de conectare la baza de date
const MONGODB_URI = "mongodb+srv://Mimi:BvygDTr0lUnJCBtJ@cluster0.03xkswe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
app.get('/', (req, res) => {
  res.send('Serverul funcționează!');
});

// Rota pentru înregistrarea unui nou utilizator (cu criptarea parolei)
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Criptăm parola înainte de a o salva
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'Utilizator înregistrat cu succes!' });
  } catch (error) {
    // Codul de eroare 11000 înseamnă că email-ul există deja
    if (error.code === 11000) {
      return res.status(400).send({ message: 'Acest email este deja înregistrat.' });
    }
    res.status(400).send({ message: 'Eroare la înregistrare.', error });
  }
});

// Rota pentru autentificare (login)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Email sau parolă incorectă.' });
    }
    // Comparăm parola trimisă cu parola criptată din baza de date
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Email sau parolă incorectă.' });
    }
    res.send({ message: 'Autentificare reușită!' });
  } catch (error) {
    res.status(500).send({ message: 'Eroare de server.', error });
  }
});

// Exportăm aplicația Express pentru a fi folosită ca funcție serverless de Vercel
module.exports = app;