const express = require('express');
const { ProductManager } = require('./entrega3.cjs');
const Database = require('./mongo.cjs');

const productManager = new ProductManager();
const database = new Database();

const webRouter = express.Router();

productManager.loadProductsFromFile();

webRouter.get('/products', (req, res) => {
    const products = productManager.getProducts();
    res.render('products', { products: products });
    console.log(products);
});

// agrego chat 

webRouter.get('/chat', async (req, res) => {
    res.render('chat');
});


webRouter.get('/chat', async (req, res) => {
    res.render('chat');
});



module.exports = { webRouter };
