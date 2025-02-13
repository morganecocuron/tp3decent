const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Ajouter un produit au panier
router.post("/:userId", async (req, res) => {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
        cart = new Cart({ userId: req.params.userId, products: [] });
    }

    cart.products.push({ productId, quantity });
    await cart.save();
    res.json(cart);
});

// Récupérer le panier d'un utilisateur
router.get("/:userId", async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, products: [] });
});

// Supprimer un produit du panier
router.delete("/:userId/item/:productId", async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (cart) {
        cart.products = cart.products.filter(p => p.productId !== req.params.productId);
        await cart.save();
    }

    res.json(cart);
});

module.exports = router;
