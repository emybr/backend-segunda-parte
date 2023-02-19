const express = require('express');
const fs = require('fs');
const { json } = require('stream/consumers');
const { ProductManager } = require("./entrega3.cjs");




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


// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.send(productManager.getProducts());
});


// creo ruta para buscar producto por id

// cambiar parseInt por Number

app.get('/productos/:id', (req, res) => {
    const product = productManager.getProductById(Number(req.params.id));
    console.log(req.params.id);
    if (!product) {
        res.status(404).send({ message: 'Producto no encontrado' });
    } else {
        res.send(product);
    }
});


//creo ruta para agregar producto

app.post('/productos/new', (req, res) => {
    const product = req.body;
    productManager.addProduct(product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
}
);

//creo ruta para actualizar producto

app.put('/productos/update/:id', (req, res) => {
    const product = req.body;
    productManager.updateProduc(Number(req.params.id), product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
}

);

//creo ruta para borrar producto

app.delete('/productos/delete/:id', (req, res) => {
    productManager.deleteProduct(Number(req.params.id));
    productManager.saveProducts();
    res.send({ message: 'Producto eliminado' });
}
);


















