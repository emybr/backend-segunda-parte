const express = require('express');
const fs = require('fs');
const { json } = require('stream/consumers');
const { ProductManager } = require ("./entrega3.cjs");




const app = express();
const port = 8080;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});


const productManager = new ProductManager();
productManager.loadProductsFromFile();

// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.send(productManager.getProducts());
});


// creo ruta para buscar producto por id
 

app.get('/productos/:id', (req, res) => {
    const product = productManager.getProductById(parseInt( req.params.id));
    console.log(req.params.id);
    if (!product) {
        res.status(404).send({ message: 'Producto no encontrado' });
    } else {
        res.send(product);
    }
   
});








// // Obtener producto por ID
// app.get('/productos/:id', (req, res) => {
//     const product = productManager.getProductById(req.params.id);
//     if (!product) {
//         res.status(404).send({ message: 'Producto no encontrado' });
//     } else {
//         res.send(product);
//     }
    
// });







    

