const express = require('express');
const mongoose = require('mongoose');
const app = express();

const dbName = 'm1p13mean';

mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`)
    .then(() => console.log("✅ Connexion à MongoDB réussie !"))
    .catch(err => console.error("❌ Erreur de connexion :", err));

app.get('/api/test', (req, res) => {
    res.json({ message: "Le serveur Express répond bien !" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
