require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { setTimeout } = require('timers/promises');

// Configuration de l'application Express
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des vues
const viewsPath = path.join(__dirname, 'views');
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, 'public')));

// Configuration MongoDB
const mongoConfig = {
  uris: [
    // URI SRV (format recommandé par Atlas)
    process.env.MONGODB_URI || "mongodb+srv://SalomonANAGOVO:Barack122021@cluster0.gbiilyl.mongodb.net/EleveInstituteur?retryWrites=true&w=majority",
    
    // URI Standard (fallback)
    "mongodb://SalomonANAGOVO:Barack122021@cluster0-shard-00-00.gbiilyl.mongodb.net:27017,cluster0-shard-00-01.gbiilyl.mongodb.net:27017,cluster0-shard-00-02.gbiilyl.mongodb.net:27017/EleveInstituteur?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority"
  ],
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority'
  }
};

// Fonction de connexion avec réessai
async function connectWithRetry(uri, options, retries = 3, delay = 1000) {
  try {
    await mongoose.connect(uri, options);
    console.log('✅ Connecté à MongoDB avec succès');
    return true;
  } catch (err) {
    console.error(`❌ Échec de connexion (${retries} tentatives restantes):`, err.message);
    if (retries > 0) {
      await setTimeout(delay);
      return connectWithRetry(uri, options, retries - 1, delay * 2);
    }
    return false;
  }
}

// Initialisation de la base de données
async function initializeDatabase() {
  for (const uri of mongoConfig.uris) {
    console.log(`Tentative de connexion avec URI: ${uri.substring(0, 30)}...`);
    if (await connectWithRetry(uri, mongoConfig.options)) {
      return;
    }
  }
  throw new Error('Impossible de se connecter à MongoDB après plusieurs tentatives');
}

// Routes
app.get('/', async (req, res) => {
  try {
    const filiere = req.query.filiere || null;
    const Eleve = mongoose.model('Eleve');
    const eleves = await Eleve.find(filiere ? { filiere } : {}).sort({ nom: 1 });
    
    res.render('index', {
      title: 'Liste des Élèves-Instituteurs',
      filiere,
      eleves
    });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).render('500', { title: 'Erreur serveur' });
  }
});

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).render('500', { title: 'Erreur serveur' });
});

// Démarrage de l'application
async function startServer() {
  try {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📁 Chemin des vues: ${viewsPath}`);
    });
  } catch (err) {
    console.error('❌ Échec critique:', err);
    process.exit(1);
  }
}

startServer();