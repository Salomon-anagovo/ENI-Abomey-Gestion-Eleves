require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Initialisation de l'application
const app = express();

// Configuration de la base de données MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ Erreur : MONGODB_URI non défini dans .env');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des sessions (production-ready)
app.use(session({
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
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

// Configuration des vues EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les messages flash
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Routes de base
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'ENI Abomey - Gestion des élèves',
    currentYear: new Date().getFullYear()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page non trouvée',
    currentYear: new Date().getFullYear()
  });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Erreur serveur',
    currentYear: new Date().getFullYear()
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});