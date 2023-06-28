
const express = require('express');
const router = express.Router();
const { route } = require('./routes.cjs');
const ProductManagerDb = require('../dao/mongo/product-manager-db.cjs');
const CartsManagerDb = require('../dao/mongo/carts-manager.db.cjs');

const productManagerDb = new ProductManagerDb();
const cartsManagerDb = new CartsManagerDb();
const { mensajes, errores } = require('../errores/errores.cjs');
const { winstonLogger } = require('../middleware/logger.cjs');


// Ruta para agregar un nuevo producto

router.post('/mongo/products/addproduts', async (req, res) => {
    try {
        const { id,title, description, price, thumbnail, code, stock } = req.body;
        const result = await productManagerDb.createProduct(id,title, description, price, thumbnail, code, stock);
        res.status(200).json(result);
    } catch (error) {
        // res.status(500).send(mensajes.ERROR_NEW_PRODUCTO);
        winstonLogger.info('Error al agregar el producto');
    }
});


router.get('/mongo/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5; // Si no se especifica limit, se establece en 10
        const page = parseInt(req.query.page) || 1; // Si no se especifica page, se establece en 1
        const sort = req.query.sort; // El parámetro sort es opcional
        const query = req.query.query; // El parámetro query es opcional

        const products = await productManagerDb.getProducts(limit, page, sort, query);
        const totalProducts = await productManagerDb.getTotalProducts(query);
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
        // res.status(500).send(mensajes.ERROR_PRODUCTO);
        winstonLogger.info('El producto no existe');
    }
});



// Ruta para actualizar un producto existente
router.put('/mongo/products/:id', async (req, res) => {
    try {
        const id = parseInt (req.params.id);
        const { title, price } = req.body;
        const result = await productManagerDb.updateProduct(id, title, price);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(mensajes.ERROR_ACTUALIZAR_PRODUCTO);
        winstonLogger.info('Error al actualizar el producto');
    }
});

// Ruta para eliminar un producto existente
router.delete('/mongo/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const numericId = parseInt(id);
        const result = await productManagerDb.deleteProduct(numericId);
        res.status(200).json(result);
    } catch (error) {
        // res.status(500).send(mensajes.ERROR_ELIMINAR_PRODUCTO);
        winstonLogger.info('Error al eliminar el producto');
    }
});

// ruta para agregar un nuevo carrito 

router.post('/mongo/carts', async (req, res) => {
    cartsManagerDb.addCart();
    res.send({ message: 'Carrito agregado' });
});


// ruta para obtener un carrito por id y actualizo el email del usuario
router.post('/mongo/carts/:email', async (req, res) => {
    await cartsManagerDb.addProductToCart(req.params.email, req.body);
    await cartsManagerDb.updateCartIdUser(req.params.email);
    res.send({ message: 'Producto agregado al carrito' });
    winstonLogger.debug('Producto agregado al carrito');
});


module.exports = router;


