const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Récupérer tous les produits
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Récupérer un produit par ID
router.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
});

// Ajouter un produit
router.post("/", async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// Modifier un produit
router.put("/:id", async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});

// Supprimer un produit
router.delete("/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produit supprimé" });
});

module.exports = router;
