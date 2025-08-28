const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Servește fișierele statice din directorul `public`
app.use(express.static(path.join(__dirname, 'public')));

// Aici ai ruta pentru API
app.get('/api', (req, res) => {
    try {
        console.log("Cererea a fost primită pe ruta API.");
        
        res.status(200).json({
            success: true,
            message: 'API-ul tău funcționează perfect!',
            version: '1.0.0'
        });
    } catch (error) {
        console.error("Eroare:", error);
        res.status(500).json({
            success: false,
            message: "A apărut o eroare internă.",
            error: error.message
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