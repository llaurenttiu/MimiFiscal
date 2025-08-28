// ... (codul existent, inclusiv linia `app.use(express.json());`)

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

// ... (restul codului, inclusiv ruta '/')