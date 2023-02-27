const express = require('express');
const { ProductManager } = require('./entrega3.cjs');


const productManager = new ProductManager();

// const webRouter = Router();
const webRouter = express.Router();

productManager.loadProductsFromFile();




webRouter.get('/products', (req, res) => {
    const products = productManager.getProducts();
    res.render('products', { products: products });
    console.log(products);
});



module.exports = { webRouter };
