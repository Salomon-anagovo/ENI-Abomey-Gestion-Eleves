require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Eleve = require('./models/eleve'); // Assure-toi du bon chemin
const app = express();

// Configuration MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb+srv://eni_user:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority";

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Pour CSS et autres fichiers statiques

// Configuration des vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route principale : Liste des élèves
app.get('/', async (req, res) => {
  try {
    const filiere = req.query.filiere || null;
    const query = filiere ? { filiere } : {};
    const eleves = await Eleve.find(query).sort({ nom: 1 });

    res.render('index', {
      title: 'Accueil',
      filiere,
      eleves
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des élèves :', error);
    res.status(500).render('500', { title: 'Erreur serveur' });
  }
});

// Routes élèves (à développer dans /routes/eleves.js ou ici directement)
const elevesRoutes = require('./routes/eleves');
app.use('/eleves', elevesRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

// Erreur serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Erreur serveur' });
});

// Démarrage
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
