const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

// Ruta pentru a genera PDF-ul
app.post('/api/generare-pdf-dubla-impozitare', (req, res) => {
    try {
        const { nume, adresa, salariu } = req.body;

        // Adaugă o opțiune de font pentru a evita erorile pe Vercel
        const doc = new PDFDocument({ font: 'Helvetica' });
        const pdfPath = path.join(__dirname, 'temp', 'dubla-impozitare.pdf');

        // Asigură-te că directorul `temp` există
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        // Pipe the document to a file
        doc.pipe(fs.createWriteStream(pdfPath));

        // Adaugă conținut în PDF
        doc.fontSize(16).text('Certificat de Evitare a Dubei Impozitări', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Nume: ${nume}`);
        doc.text(`Adresă: ${adresa}`);
        doc.text(`Salariu anual: ${salariu} €`);
        doc.moveDown();
        doc.text('Acest document certifică faptul că persoana menționată mai sus a plătit impozite în Germania și, prin urmare, este scutită de dubla impozitare în România, conform convenției fiscale.', { align: 'justify' });

        doc.end();

        // Așteaptă ca PDF-ul să fie generat și trimite-l
        doc.on('end', () => {
            res.download(pdfPath, 'certificat-dubla-impozitare.pdf', (err) => {
                if (err) {
                    console.error("Eroare la trimiterea PDF-ului:", err);
                    res.status(500).json({
                        success: false,
                        message: "A apărut o eroare la generarea fișierului."
                    });
                }
            });
        });

    } catch (error) {
        console.error("Eroare la generarea PDF-ului:", error);
        res.status(500).json({
            success: false,
            message: "A apărut o eroare la generarea PDF-ului."
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
