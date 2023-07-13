const { getProducsFile, getProducsFileID, getAllProducsFile, postNewProductFile, updateProducsFile, deletProductsFile, getAllProducsFakerFile } = require ('../Controllers/file/products.controlers.cjs');
const express = require('express');
const router = express.Router();
const { ProductManager } = require("../dao/file/product-manager.cjs");
const { deleteUserInactivo } = require("../Controllers/mongo/user.controlers.cjs");
const { Carts } = require("../dao/file/carts.cjs");
const { mensajes, errores } = require('../errores/errores.cjs');
const { getCarsIdFile, postAddCarsfile, postAddProductsCarFile } = require('../Controllers/file/cars.controlets.cjs');
const productManager = new ProductManager();
productManager.loadProductsFromFile();


const carts = new Carts();
router.use(express.json());

// agrego ruta para ver producto persitencia file

router.get('/produc', getProducsFile);

// agrego ruta para ver producto por id

router.get('/products/:pid', getProducsFileID);

//creo ruta para obtener todos los productos

router.get('/products', getAllProducsFile );

// creo ruta para agregar producto

router.post('/products/new',postNewProductFile);

// creo ruta para actualizar producto

router.put('/products/update/:pid', updateProducsFile);

// creo ruta para borrar producto

router.delete('/products/delete/:pid', deletProductsFile);

// creo ruta para obtener todos los productos de faker

router.get('/mockingproducts', getAllProducsFakerFile);

//creo ruta para agregar carrito

router.post('/',postAddCarsfile);

//creo ruta para agregar producto al carrito

router.post('/carts/:cid/products/:pid',postAddProductsCarFile)

// agrego ruta para recuperar carito por id

router.get('/carts/:cid',getCarsIdFile);

// agrego ruta para eliminar usuarios unactivos por 2 dias

router.delete('/delete', deleteUserInactivo);


module.exports = router;
