const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Créer une commande
router.post("/", async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json(newOrder);
});

// Récupérer les commandes d'un utilisateur
router.get("/:userId", async (req, res) => {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
});

module.exports = router;
