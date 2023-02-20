const express = require('express');
const fs = require('fs');
const { ProductManager } = require("./entrega3.cjs");
const { Carts } = require("./carts/carts.cjs");




const app = express();
const port = 8080;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

//agrego para que pueda recibir json lunes 13/03 ver esto
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const productManager = new ProductManager();
productManager.loadProductsFromFile();

// creo ruta para obtener producto por id

app.get('/api/products/:pid', (req, res) => {
    const product = productManager.getProductById(Number(req.params.pid));
    if (product) {
        res.send(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});


// Obtener todos los productos
app.get('/api/products', (req, res) => {
    res.send(productManager.getProducts());
});


//creo ruta para agregar producto

app.post('/api/products/new', (req, res) => {
    const product = req.body;
    productManager.addProduct(product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
}
);

//creo ruta para actualizar producto

app.put('/api/products/update/:pid', (req, res) => {
    const product = req.body;
    productManager.updateProduc(Number(req.params.pid), product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
}

);

//creo ruta para borrar producto

app.delete('/api/products/delete/:pid', (req, res) => {
    productManager.deleteProduct(Number(req.params.pid));
    productManager.saveProducts();
    res.send({ message: 'Producto eliminado' });
}
);
// -------------------------------------------------------------------

const carts = new Carts();

//creo ruta para agregar carrito

app.post('/', (req, res) => {
    carts.addCart();
    carts.saveCarts();
    res.send({ message: 'Carrito agregado' });
}
);

//creo ruta para agregar producto al carrito

app.post('/api/carts/:cid/product/:pid', (req, res) => {
    carts.addProductToCart(Number(req.params.cid), { id: Number(req.params.pid) });
    carts.saveCarts();
    console.log(req.params.cid);
    res.send({ message: 'Producto agregado al carrito' });
});

// creo ruta los productos del carrito por id

app.get('/api/carts/:cid', (req, res) => {
    const cart = carts.getCartById(Number(req.params.cid));
    console.log(req.params.cid);
    if (cart) {
        res.send(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});





















