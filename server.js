const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Servește fișierele statice din directorul `public`
app.use(express.static(path.join(__dirname, 'public')));

// Ruta pentru API-ul de înregistrare
app.post('/api/register', (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Cerere de înregistrare primită pentru: ${email}`);

        // Aici vei adăuga codul pentru a salva utilizatorul în baza de date
        // De exemplu, cu Mongoose:
        // const newUser = new User({ email, password });
        // await newUser.save();

        res.status(200).json({
            success: true,
            message: 'Înregistrare reușită! Puteți acum să vă autentificați.'
        });
    } catch (error) {
        console.error("Eroare la înregistrare:", error);
        res.status(500).json({
            success: false,
            message: "A apărut o eroare la înregistrare."
        });
    }
});

// Ruta pentru API-ul de autentificare
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Cerere de autentificare primită pentru: ${email}`);

        // Aici vei adăuga codul pentru a verifica utilizatorul în baza de date
        // const user = await User.findOne({ email });
        // if (!user || user.password !== password) {
        //     return res.status(401).json({ success: false, message: 'Date de autentificare incorecte.' });
        // }

        res.status(200).json({
            success: true,
            message: 'Autentificare reușită!'
        });
    } catch (error) {
        console.error("Eroare la autentificare:", error);
        res.status(500).json({
            success: false,
            message: "A apărut o eroare la autentificare."
        });
    }
});

// Aici ai ruta principală care servește fișierul `index.html`
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read index.html:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send(data);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
