const mongoose = require('mongoose');

// Création du schéma pour le produit
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    inStock: {
        type: Number,
        required: true
    }
});

// Création du modèle basé sur le schéma
const Product = mongoose.model('Product', productSchema);

module.exports = Product;