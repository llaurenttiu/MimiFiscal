const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();

const MONGODB_URI = "mongodb+srv://Mimi:BvygDTr0lUnJCBtJ@cluster0.03xkswe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectat la MongoDB'))
  .catch(err => console.error('Eroare la conectare:', err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Serverul funcționează!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'Utilizator înregistrat cu succes!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ message: 'Acest email este deja înregistrat.' });
    }
    res.status(400).send({ message: 'Eroare la înregistrare.', error });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Email sau parolă incorectă.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Email sau parolă incorectă.' });
    }
    res.send({ message: 'Autentificare reușită!' });
  } catch (error) {
    res.status(500).send({ message: 'Eroare de server.', error });
  }
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serverul rulează pe portul ${PORT}`));