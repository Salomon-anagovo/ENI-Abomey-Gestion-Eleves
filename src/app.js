require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// 1. Configuration MongoDB (avec gestion SSL)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI manquant dans .env');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  ssl: true,
  sslValidate: true,
  tlsAllowInvalidCertificates: false
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Configuration des vues (chemin absolu)
const viewsPath = path.join(__dirname, '..', 'views');
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, '..', 'public')));

// 4. Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-dev',
  store: MongoStore.create({ mongoUrl: mongoUri }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// 5. Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Accueil' });
});

// 6. Gestion des erreurs
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Erreur serveur' });
});

// 7. Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Chemin des vues: ${viewsPath}`);
});