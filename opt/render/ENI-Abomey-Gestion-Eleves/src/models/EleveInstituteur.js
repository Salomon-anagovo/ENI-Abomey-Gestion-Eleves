const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  etablissement: String,
  periode_debut: Date,
  periode_fin: Date,
  tuteur: String
});

const evaluationsSchema = new mongoose.Schema({
  controle_continu: Number,
  examen: Number,
  stage: Number
});

const eleveInstituteurSchema = new mongoose.Schema({
  matricule_eni: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^ENI-\d{4}-\d{4}$/.test(v);
      },
      message: props => `${props.value} n'est pas un matricule ENI valide!`
    }
  },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: Date,
  lieu_naissance: String,
  adresse: String,
  contact_parent_tuteur: String,
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  telephone: String,
  niveau_etude: {
    type: String,
    enum: ['Première année', 'Deuxième année', 'Troisième année'],
    required: true
  },
  filiere: {
    type: String,
    enum: ['Primaire', 'Préscolaire'],
    required: true
  },
  stages: [stageSchema],
  evaluations: evaluationsSchema,
  date_creation: { type: Date, default: Date.now },
  date_modification: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EleveInstituteur', eleveInstituteurSchema);