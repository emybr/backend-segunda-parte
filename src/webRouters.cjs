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

// agrego ruta chat 

webRouter.get('/chat', async (req, res) => {
    res.render('chat');
});

// agrego ruta para ver  productos de mongo

webRouter.get('/products/db', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;

        const products = await database.getProducts(limit, page, sort, query)
            
        const totalProducts = await database.getTotalProducts({
                $text: { $search: query },
        });

        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? page - 1 : null;
        const nextPage = hasNextPage ? page + 1 : null;
        const prevLink = hasPrevPage
            ? `${req.protocol}://${req.get('host')}${req.path}?limit=${limit}&page=${prevPage}`
            : null;
        const nextLink = hasNextPage
            ? `${req.protocol}://${req.get('host')}${req.path}?limit=${limit}&page=${nextPage}`
            : null;

        res.render('vistaProductos', {
            products,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// agrego ruta para ver carrito  carrito de mongo

webRouter.get('/carts/db/:cartId', async (req, res) => {
    try {
        const cart = await database.getCartsById(req.params.cartId);

        res.render('vistaCarrito', {
            cart
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = { webRouter };
