const mongoose = require('mongoose');

// Création du schéma pour la commande
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [{
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
    },
    status: {
        type: String,
        enum: ['En attente', 'Expédiée', 'Livrée'],
        default: 'En attente'
    }
});

// Création du modèle basé sur le schéma
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;