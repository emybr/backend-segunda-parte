const express = require('express');
const router = express.Router();
const { ProductManager } = require("./entrega3.cjs");
const { Carts } = require("./carts/carts.cjs");

const productManager = new ProductManager();
productManager.loadProductsFromFile();

const carts = new Carts();

router.get('/products/:pid', (req, res) => {
    const product = productManager.getProductById(Number(req.params.pid));
    if (product) {
        res.send(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

//creo ruta para obtener todos los productos

router.get('/products', (req, res) => {
    res.send(productManager.getProducts());
});

// creo ruta para agregar producto

router.post('/products/new', (req, res) => {
    const product = req.body;
    productManager.addProduct(product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
});

// creo ruta para actualizar producto

router.put('/products/update/:pid', (req, res) => {
    const product = req.body;
    productManager.updateProduc(Number(req.params.pid), product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
});

// creo ruta para borrar producto

router.delete('/products/delete/:pid', (req, res) => {
    productManager.deleteProduct(Number(req.params.pid));
    productManager.saveProducts();
    res.send({ message: 'Producto eliminado' });
});

// -------------------------------------------------------------------

//creo ruta para agregar carrito

router.post('/', (req, res) => {
    carts.addCart();
    carts.saveCarts();
    res.send({ message: 'Carrito agregado' });
});

//creo ruta para agregar producto al carrito

router.post('/carts/:cid/products/:pid', (req, res) => {
    carts.addProductToCart(Number(req.params.cid), { id: Number(req.params.pid) });
    carts.saveCarts();
    res.send({ message: 'Producto agregado al carrito' });
});

router.get('/carts/:cid', (req, res) => {
    const cart = carts.getCartById(Number(req.params.cid));
    if (cart) {
        res.send(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

module.exports = router;
