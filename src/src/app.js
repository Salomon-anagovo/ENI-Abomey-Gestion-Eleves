require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// 1. Configuration MongoDB (version modernisée)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI manquant dans .env');
  process.exit(1);
}

// Connexion à MongoDB (sans options dépréciées)
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Configuration des vues (avec vérification)
const viewsPath = path.join(__dirname, 'views'); // Modifié de '..' à '.'
console.log('Chemin des vues:', viewsPath); // Pour débogage

app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, 'public'))); // Modifié de '..' à '.'

// 4. Sessions (configuration améliorée)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-dev',
  store: MongoStore.create({
    mongoUrl: mongoUri,
    ttl: 14 * 24 * 60 * 60 // 14 jours expiration
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 jour
  }
}));

// 5. Routes (avec gestion d'erreur intégrée)
app.get('/', (req, res, next) => {
  try {
    res.render('index', { title: 'Accueil' });
  } catch (err) {
    next(err);
  }
});

// 6. Gestion des erreurs (avec vérification des vues)
app.use((req, res, next) => {
  try {
    res.status(404).render('404', { title: 'Page non trouvée' });
  } catch (err) {
    console.error('Vue 404 manquante:', err);
    res.status(404).send('Page non trouvée');
  }
});

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  try {
    res.status(500).render('500', { title: 'Erreur serveur' });
  } catch (renderErr) {
    res.status(500).send('Erreur serveur');
  }
});

// 7. Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Chemin des vues: ${viewsPath}`);
  console.log('Configuration MongoDB:', mongoUri); // Pour vérification
});