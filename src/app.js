require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// 1. Configuration de la base de données
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ Erreur : MONGODB_URI manquant dans .env');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Configuration des sessions (Production-ready)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_temporaire_dev',
  store: MongoStore.create({
    mongoUrl: mongoUri,
    ttl: 14 * 24 * 60 * 60 // 14 jours
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24h
  }
}));

// 4. Configuration des vues (Chemin corrigé pour Render)
const viewsPath = path.join(__dirname, 'views');
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// 5. Routes de base
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'ENI Abomey - Tableau de bord',
    currentYear: new Date().getFullYear()
  });
});

// 6. Gestion des erreurs
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Erreur serveur' });
});

// 7. Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Chemin des vues : ${viewsPath}`);
});