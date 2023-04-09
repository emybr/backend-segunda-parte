const express = require('express');
const { ProductManager } = require('./entrega3.cjs');
const Database = require('./mongo.cjs');
const bcrypt = require('bcrypt');

const productManager = new ProductManager();
const database = new Database();
const webRouter = express.Router();
productManager.loadProductsFromFile();
const passport = require('passport');


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
        const  { nombre, apellido, edad, email, password } = req.body;
        await database.createUser(nombre, apellido, edad, email, password);
        if (email === 'admin@example.com') {
            await database.setAdminRole(email);
        }
        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
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



// agrego ruta para logout que si es admin destruye la sesion y si no es admin solo setea el email en null

webRouter.post('/logout', async (req, res) => {
    if (req.session.email === 'admin@example.com') {
        req.session.destroy();
    } else {
        req.session.email = null;
    }
    res.redirect('/login');
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

        const products = await database.getProducts(limit, page, sort, query)

        const totalProducts = await database.getTotalProducts({
            $text: { $search: query },
        });

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
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// agrego ruta para ver carrito  carrito de mongo

webRouter.get('/carts/db/:cartId', async (req, res) => {
    try {
        const cart = await database.getCartsById(req.params.cartId);

        res.render('vistaCarrito', {
            cart
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = { webRouter };

