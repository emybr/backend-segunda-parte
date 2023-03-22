
const express = require('express');
const router = express.Router();
const Database = require('./mongo.cjs');
const { route } = require('./routes.cjs');

// Crear una instancia de la clase Database
const database = new Database();



// Ruta para obtener todos los productos
router.get('/mongo/products', async (req, res) => {
    try {
        const products = await database.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para agregar un nuevo producto
router.post('/mongo/products', async (req, res) => {
    try {
        const { name, price } = req.body;
        const result = await database.createProduct(name, price);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para actualizar un producto existente
router.put('/mongo/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        const result = await database.updateProduct(id, name, price);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para eliminar un producto existente
router.delete('/mongo/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database.deleteProduct(id);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;


