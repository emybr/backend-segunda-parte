const { postAddCards, postCardbyEmail } = require ('../Controllers/mongo/cars.controlers.cjs');
const { putPoducsDB, deleteProduct, postProduc } = require ('../Controllers/mongo/products.controlers.cjs');

const express = require('express');
const mongoRoutes = express.Router();
const { route } = require('./routes.cjs');

// Ruta para actualizar un producto existente

mongoRoutes.put('/mongo/products/:id', putPoducsDB);

// Ruta para eliminar un producto existente

mongoRoutes.delete('/mongo/products/:id', deleteProduct)

// // ruta para agregar un nuevo carrito 

mongoRoutes.post ('/mongo/carts', postAddCards)

mongoRoutes.post ('/mongo/carts/:email', postCardbyEmail)

// Ruta para agregar un nuevo producto

mongoRoutes.post('/mongo/products/addproduts', postProduc)

module.exports = mongoRoutes;



// //ver para que se usa ?

// router.get('/mongo/products', async (req, res) => {
//     try {
//         const limit = parseInt(req.query.limit) || 5; // Si no se especifica limit, se establece en 10
//         const page = parseInt(req.query.page) || 1; // Si no se especifica page, se establece en 1
//         const sort = req.query.sort; // El parámetro sort es opcional
//         const query = req.query.query; // El parámetro query es opcional

//         const products = await productManagerDb.getProducts(limit, page, sort, query);
//         const totalProducts = await productManagerDb.getTotalProducts(query);
//         const totalPages = Math.ceil(totalProducts / limit);
//         const hasPrevPage = page > 1;
//         const hasNextPage = page < totalPages;
//         const prevPage = hasPrevPage ? page - 1 : null;
//         const nextPage = hasNextPage ? page + 1 : null;
//         const prevLink = hasPrevPage ? `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?limit=${limit}&page=${prevPage}` : null;
//         const nextLink = hasNextPage ? `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?limit=${limit}&page=${nextPage}` : null;

//         res.json({
//             status: 'success',
//             payload: products,
//             totalPages,
//             prevPage,
//             nextPage,
//             page,
//             hasPrevPage,
//             hasNextPage,
//             prevLink,
//             nextLink,
//         });
//     } catch (error) {
//         // res.status(500).send(mensajes.ERROR_PRODUCTO);
//         winstonLogger.info('El producto no existe');
//     }
// });
