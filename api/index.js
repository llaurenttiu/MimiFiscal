const express = require('express');

const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  try {
    console.log("Cererea a fost primită pe ruta API.");
    
    res.status(200).json({
      success: true,
      message: 'Noul API funcționează perfect!',
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

module.exports = app;