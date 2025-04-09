require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// 1. Configuration MongoDB
const mongoUri = "mongodb+srv://SalomonANAGOVO:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";
// OU essayez avec l'encodage :
// const mongoUri = "mongodb+srv://Salomon%20ANAGOVO:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});

// 2. Configuration des vues
const viewsPath = path.join(__dirname, 'views');
console.log('Chemin des vues:', viewsPath);

// Debug: lister les fichiers
try {
  console.log('Fichiers dans views:', fs.readdirSync(viewsPath));
} catch (err) {
  console.error('Erreur lecture dossier views:', err);
}

app.set('view engine', 'ejs');
app.set('views', viewsPath);

// 3. Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Accueil' });
});

// 4. Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Erreur serveur' });
});

// 5. Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});