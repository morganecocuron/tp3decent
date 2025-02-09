const mongoose = require('mongoose');

// Création du schéma pour le panier
const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    }
});

// Création du modèle basé sur le schéma
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;