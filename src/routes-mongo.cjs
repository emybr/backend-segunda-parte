
const express = require('express');
const router = express.Router();
const Database = require('./mongo.cjs');
const { route } = require('./routes.cjs');

// Crear una instancia de la clase Database
const database = new Database();


// Ruta para agregar un nuevo producto

router.post('/mongo/products/addproduts', async (req, res) => {
    try {
        const { id,title, description, price, thumbnail, code, stock } = req.body;
        const result = await database.createProduct(id,title, description, price, thumbnail, code, stock);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para obtener todos los productos

router.get('/mongo/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5; // Si no se especifica limit, se establece en 10
        const page = parseInt(req.query.page) || 1; // Si no se especifica page, se establece en 1
        const sort = req.query.sort; // El parámetro sort es opcional
        const query = req.query.query; // El parámetro query es opcional

        const products = await database.getProducts(limit, page, sort, query);
        const totalProducts = await database.getTotalProducts(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? page - 1 : null;
        const nextPage = hasNextPage ? page + 1 : null;
        const prevLink = hasPrevPage ? `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?limit=${limit}&page=${prevPage}` : null;
        const nextLink = hasNextPage ? `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?limit=${limit}&page=${nextPage}` : null;

        res.json({
            status: 'success',
            payload: products,
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

// ruta para agregar un nuevo carrito 

router.post('/mongo/carts', async (req, res) => {
    database.addCart();
    res.send({ message: 'Carrito agregado' });
});

// ruta para agregar un producto al carrito por id

// router.post('/mongo/carts/:id', async (req, res) => {
//     database.addProductToCart(req.params.id, req.body);
//     res.send({ message: 'Producto agregado al carrito' });
// });

// ruta para obtener un carrito por id y actualizo el cartId del usuario
router.post('/mongo/carts/:email', async (req, res) => {
    await database.addProductToCart(req.params.email, req.body);
    await database.updateCartIdUser(req.params.email);
    res.send({ message: 'Producto agregado al carrito' });
  });
  

module.exports = router;


