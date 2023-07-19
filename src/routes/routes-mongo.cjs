const { postAddCards, postCardbyEmail } = require ('../Controllers/mongo/cars.controlers.cjs');
const { putPoducsDB, deleteProduct, postProduc } = require ('../Controllers/mongo/products.controlers.cjs');
const {deleteUser} = require('../Controllers/mongo/user.controlers.cjs')

const express = require('express');
const mongoRoutes = express.Router();
const { route } = require('./routes.cjs');
const { postSetAdminRole,postSetRoleByEmail } = require('../Controllers/mongo/user.controlers.cjs');
const { de } = require('@faker-js/faker');

// Ruta para actualizar un producto existente

mongoRoutes.put('/mongo/products/:id', putPoducsDB);

// Ruta para eliminar un producto existente

mongoRoutes.delete('/mongo/products/:id', deleteProduct)

// // ruta para agregar un nuevo carrito 

mongoRoutes.post ('/mongo/carts', postAddCards)

mongoRoutes.post ('/mongo/carts/:email', postCardbyEmail)

// Ruta para agregar un nuevo producto

mongoRoutes.post('/mongo/products/addproduts', postProduc)

// Ruta para setear el rol de admin

mongoRoutes.post('/mongo/products/setAdmin', postSetAdminRole)

// agrego ruta para eliminar un usaurio por email desde administrador

mongoRoutes.post('/delet/users/:email', deleteUser )

//agrego ruta para setear el rol de admin/premium/user

mongoRoutes.post('/mongo/setRoleByEmail/:email', postSetRoleByEmail)


module.exports = mongoRoutes;