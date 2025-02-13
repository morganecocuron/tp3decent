// Importer le module express
const express = require('express');
const app = express();

// Route GET /getServer
app.get('/getServer', (req, res) => {
    const response = {
        code: 200,
        server: 'localhost:3000'
    };
    res.json(response);
});

// Démarrer le serveur sur le port 3001
app.listen(3000, () => {
    console.log('DNS Registry is running on http://localhost:3000');
});