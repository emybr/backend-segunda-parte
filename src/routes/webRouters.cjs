const express = require('express');
const { ProductManager } = require('../dao/file/product-manager.cjs');
const bcrypt = require('bcrypt');
const ProductManagerDb = require('../dao/mongo/product-manager-db.cjs');
const UserManagerDb = require('../dao/mongo/user-manager-db.cjs');
const CartsManagerDb = require('../dao/mongo/carts-manager.db.cjs');
const TicketManagerDb = require('../dao/mongo/ticket-manager.db.cjs');
const supertest = require('supertest');


const productManager = new ProductManager();
const webRouter = express.Router();
productManager.loadProductsFromFile();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/autenticacion.cjs');
// const { default: Ticket } = require('../dao/mongo/Models/TicketManagerDb.cjs');
const productManagerDb = new ProductManagerDb();
const userManagerDb = new UserManagerDb();
const cartsManagerDb = new CartsManagerDb();
const ticketManagerDb = new TicketManagerDb();
const { mensajes, errores } = require('../errores/errores.cjs');
const { winstonLogger } = require('../middleware/logger.cjs');


webRouter.get('/products', (req, res) => {
    const products = productManager.getProducts();
    res.render('products', { products: products });
    console.log(products);
});


// agrego ruta para login

webRouter.get('/login', async (req, res) => {
    res.render('login');
});

webRouter.get('/register', async (req, res) => {
    res.render('register');
});

//agrego ruta de registro con usuario admin y contraseña admin (12345)
webRouter.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, edad, email, password, cartId } = req.body;
        await userManagerDb.createUser(nombre, apellido, edad, email, password, cartId);
        if (email === 'admin@example.com') {
            await userManagerDb.setAdminRole(email);
        }
        res.redirect('/login');
    } catch (error) {
        // res.status(500).send(errores.ERROR_ADMIN);
        winstonLogger.http('El usuario no es administrador');
    }
});


webRouter.post('/login', async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send(info.message);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.email = user.email;
            if (user.role === 'admin') {
                req.session.isAdmin = true;
            }
            const welcomeMessage = `Bienvenido, ${user.email} 😃`;
            req.session.message = welcomeMessage;
            return res.redirect('/products/db');
        });
    })(req, res, next);
});

// agrego ruta para github

webRouter.get('/login/github', passport.authenticate('github'));

webRouter.get('/login/github/callback',
    passport.authenticate('github'),
    function (req, res) {
        res.redirect('/products/db');
    }
);

// agrego ruta para logout que si es admin destruye la sesion y si no es admin solo setea el email en null

webRouter.post('/logout', async (req, res) => {
    if (req.session.email === 'admin@example.com') {
        req.session.destroy();
    } else {
        req.session.email = null;
    }
    res.redirect('/login');
});

webRouter.get('/generate-reset-link', async (req, res) => {
    res.render('generateResetLink');
});


webRouter.get('/reset/:token', async (req, res) => {
    const token = req.params.token;
    res.render('resetUserPassword', { token });
});



// agrego ruta para resetear contraseña

webRouter.post(`/reset-password`, async (req, res) => {
    const { email } = req.body;
    await userManagerDb.actualizarContraseña(email);
    res.send(`Se ha enviado un email a ${email} para resetear la contraseña`);
});



webRouter.post('/reset/token', async (req, res) => {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    try {
        // Buscar el documento correspondiente al token en la colección "passwordResetTokens"
        const passwordResetToken = await userManagerDb.getPasswordResetToken(token);
        if (!passwordResetToken) {
            res.redirect('/generate-reset-link');
        } else {
            if (newPassword === passwordResetToken.password) {
                res.send('La contraseña no puede ser igual a la anterior');
            } else {
                await userManagerDb.updatePassword(passwordResetToken.email, newPassword);
                res.send('Contraseña actualizada correctamente');
            }
        }
    } catch (error) {
        console.error(error);
    }
});

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

        const products = await productManagerDb.getProducts(limit, page, sort, query)

        const totalProducts = await productManagerDb.getTotalProducts({
            $text: { $search: query },
        });
        const email = req.session.email;
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
            message: req.session.message,
            email,
        });
    } catch (error) {
        // res.status(500).send(mensajes.ERROR_PRODUCTO);
        winstonLogger.http('El producto no existe');
    }
});

// agrego ruta para ver carrito  carrito de mongo

webRouter.get('/carts/:email', ensureAuthenticated, async (req, res) => {
    try {
        const { email } = req.params;
        const carts = await cartsManagerDb.getCartsByEmail(email);
        const total = carts.products.reduce((acc, curr) => acc + parseInt(curr.price), 0);
        res.render('vistaCarrito', { carts, email, total });
        console.log(carts);
    } catch (error) {
        // res.status(500).send(mensajes.ERROR_CARRITO);
        winstonLogger.http('Carrito no encontrado');
    }
});

// agrego ruta para generar ticket de mongo

webRouter.post('/mongo/tickets', async (req, res) => {
    const { amount, purchaser, email } = req.body;
    const carts = await cartsManagerDb.getCartsByEmail(email);
    console.log(carts);
    const productIds = carts.products.map(product => product.id);
    let flag = true;
    try {
        for (var i = 0; i < productIds.length; i++) {
            const product = await productManagerDb.getProductById(parseInt(productIds[i]));
            console.log(product);
            const quantity = carts.products[i].quantity; // Obtener la cantidad de productos en el carrito
            if (product.stock < quantity) {
                flag = false;
                throw new Error(mensajes.ERROR_CARRITO_STOCK);
            }
        }

        if (flag === true) {
            // Si todos los productos tienen suficiente stock, restar el stock y generar el ticket
            await Promise.all(productIds.map((productId, i) => productManagerDb.updateProductStock(parseInt(productId), carts.products[i].quantity)));
            const result = await ticketManagerDb.createTicket(amount, purchaser, email);
            // Eliminar los productos comprados del carrito
            for (var i = 0; i < productIds.length; i++) {
                await cartsManagerDb.removeCartItem(email, productIds[i]);
            }
            res.send({ message: 'Ticket creado exitosamente', data: result });
        } else {
            // Si hay productos sin stock suficiente, devolver los IDs de los productos no procesados
            res.send({
                message: mensajes.ERROR_PRODUCTO_STOCK,
                data: { unprocessedProductIds: productIds },
            });
        }
    } catch (e) {
        console.error(e);
        // res.status(500).send({ message:mensajes.ERROR_CARRITO_STOCK });
        winstonLogger.http('No hay stock suficiente');
    }
});


module.exports = { webRouter };

