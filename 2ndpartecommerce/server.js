const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const router = express.Router();

// Initialisation de l'application Express
const app = express();
app.use(bodyParser.json()); // Permet d'analyser les données JSON

// Connexion à MongoDB
mongoose.connect('mongodb://localhost/ecommerce')
    .then(() => {
        console.log("MongoDB connecté !");
    })
    .catch((err) => {
        console.log("Erreur de connexion MongoDB :", err);
    });

// Routes Products

// GET /products - Récupérer tous les produits
app.get('/products', async (req, res) => {
    try {
        const { category, inStock } = req.query; // Récupération des paramètres de requête
        let filter = {};

        if (category) filter.category = category;
        if (inStock) filter.inStock = { $gt: 0 }; // Les produits en stock

        const products = await Product.find(filter); // Récupération des produits avec le filtre
        res.json(products); // Réponse avec les produits
    } catch (error) {
        res.status(500).json({ error: 'Erreur du serveur' });
    }
});

// GET /products/:id - Récupérer un produit spécifique par ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Recherche par ID
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json(product); // Retourner le produit
    } catch (error) {
        res.status(500).json({ error: 'Erreur du serveur' });
    }
});

// POST /products - Ajouter un produit
app.post('/products', [
    // Validation des champs
    body('name').notEmpty().withMessage('Le nom du produit est requis'),
    body('price').isNumeric().withMessage('Le prix doit être un nombre'),
    body('inStock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
], async (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, price, category, inStock } = req.body;
        const product = new Product({ name, description, price, category, inStock });
        await product.save();
        res.status(201).json(product); // Retourner le produit créé
    } catch (error) {
        res.status(500).json({ error: 'Erreur du serveur' });
    }
});

// PUT /products/:id - Modifier un produit
app.put('/products/:id', [
    body('price').optional().isNumeric().withMessage('Le prix doit être un nombre'),
    body('inStock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json(product); // Retourner le produit modifié
    } catch (error) {
        res.status(500).json({ error: 'Erreur du serveur' });
    }
});

// DELETE /products/:id - Supprimer un produit
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur du serveur' });
    }
});



// Routes Cart
// POST /cart/:userId - Ajouter un produit au panier
router.post('/:userId', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Vérifie si le produit existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Trouve ou crée un panier pour cet utilisateur
        let cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            cart = new Cart({ userId: req.params.userId, products: [] });
        }

        // Vérifie si le produit est déjà dans le panier
        const existingProduct = cart.products.find(item => item.productId.toString() === productId);
        if (existingProduct) {
            existingProduct.quantity += quantity; // Ajoute à la quantité existante
        } else {
            cart.products.push({ productId, quantity });
        }

        // Met à jour le prix total
        cart.totalPrice = cart.products.reduce((total, item) => {
            const p = item.productId;
            return total + (p.price * item.quantity);
        }, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /cart/:userId - Récupérer l'état actuel du panier
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Panier vide ou non trouvé' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /cart/:userId/item/:productId - Supprimer un produit du panier
router.delete('/:userId/item/:productId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            return res.status(404).json({ error: 'Panier non trouvé' });
        }

        // Retirer le produit du panier
        cart.products = cart.products.filter(item => item.productId.toString() !== req.params.productId);

        // Mettre à jour le prix total
        cart.totalPrice = cart.products.reduce((total, item) => {
            const p = item.productId;
            return total + (p.price * item.quantity);
        }, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes Orders

// POST /orders - Créer une nouvelle commande
app.post('/orders', [
    body('userId').isMongoId().withMessage('L\'ID utilisateur est invalide')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;


    try {
        // Récupérer le panier de l'utilisateur
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId');
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: 'Panier vide' });
        }

        // Créer la commande
        const order = new Order({
            userId: userId,
            products: cart.products.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            })),
            totalPrice: cart.totalPrice,
        });

        await order.save();

        // Vide le panier après la commande
        cart.products = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /orders/:userId - Récupérer toutes les commandes d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('products.productId');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Aucune commande trouvée' });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


app.use(router);

// Lancer le serveur
const port = 3000;
app.listen(port, () => {
    console.log(`Serveur écoutant sur le port ${port}`);
});




