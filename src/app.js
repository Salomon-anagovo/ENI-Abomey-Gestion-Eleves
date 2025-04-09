// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const EleveInstituteur = require('./models/EleveInstituteur');

const app = express();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eni_abomey', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration d'Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware pour les messages flash (simplifié)
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Routes
app.get('/', async (req, res) => {
  try {
    const filiere = req.query.filiere;
    const query = filiere ? { filiere } : {};
    const eleves = await EleveInstituteur.find(query).sort({ nom: 1 });
    res.render('index', { eleves, filiere });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/eleves/ajouter', (req, res) => {
  res.render('ajouter');
});

app.post('/eleves/ajouter', async (req, res) => {
  try {
    const nouvelEleve = new EleveInstituteur(req.body);
    await nouvelEleve.save();
    req.session.message = 'Élève-instituteur ajouté avec succès';
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('ajouter', { 
      erreur: err.message,
      eleve: req.body // Pour pré-remplir le formulaire en cas d'erreur
    });
  }
});

app.get('/eleves/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findById(req.params.id);
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    res.render('details', { eleve });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/eleves/modifier/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findById(req.params.id);
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    res.render('modifier', { eleve });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/eleves/modifier/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    req.session.message = 'Élève-instituteur modifié avec succès';
    res.redirect(`/eleves/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.render('modifier', { 
      erreur: err.message,
      eleve: req.body
    });
  }
});

app.post('/eleves/supprimer/:id', async (req, res) => {
  try {
    await EleveInstituteur.findByIdAndDelete(req.params.id);
    req.session.message = 'Élève-instituteur supprimé avec succès';
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/stages/ajouter/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findById(req.params.id);
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    res.render('ajouterStage', { eleve });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/stages/ajouter/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findById(req.params.id);
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    
    eleve.stages.push(req.body);
    await eleve.save();
    
    req.session.message = 'Stage ajouté avec succès';
    res.redirect(`/eleves/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/evaluations/modifier/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findById(req.params.id);
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    res.render('modifierEvaluations', { eleve });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/evaluations/modifier/:id', async (req, res) => {
  try {
    const eleve = await EleveInstituteur.findByIdAndUpdate(
      req.params.id, 
      { evaluations: req.body },
      { new: true }
    );
    
    if (!eleve) {
      return res.status(404).send('Élève-instituteur non trouvé');
    }
    
    req.session.message = 'Évaluations mises à jour avec succès';
    res.redirect(`/eleves/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné!');
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});