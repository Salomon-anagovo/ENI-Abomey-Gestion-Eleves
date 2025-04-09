const mongoose = require('mongoose');

const eleveSchema = new mongoose.Schema({
  matricule_eni: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  niveau_etude: { type: String, required: true },
  filiere: { type: String, required: true, enum: ['Primaire', 'Préscolaire'] },
  // Ajoutez d'autres champs selon vos besoins
});

module.exports = mongoose.model('Eleve', eleveSchema);