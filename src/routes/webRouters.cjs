const { getChat } = require ('../Controllers/mongo/chat.controlers.cjs');
const express = require('express');
const webRouter = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/autenticacion.cjs');
const { getUserController, getRegisterUser, postRegisterUser, postLoginUser, postLogout, getGenerateResetLink, getResetToken, postResetPassword, postResetToken, updateUserFile, postPremiumUser, } = require('../Controllers/mongo/user.controlers.cjs');
const {getCartsByEmail} = require('../Controllers/mongo/cars.controlers.cjs')
const { getProducDB} = require('../Controllers/mongo/products.controlers.cjs');
const { postTiketDB } = require('../Controllers/mongo/tickets.controlers.cjs');
const { upload } = require('../middleware/multer.cjs');

// agrego ruta para login

webRouter.get('/login', getUserController);

webRouter.post('/login', postLoginUser)

// agrego ruta para registro de usuario

webRouter.get('/register', getRegisterUser);

webRouter.post('/register', postRegisterUser);


// agrego ruta para github

webRouter.get('/login/github', passport.authenticate('github'));

webRouter.get('/login/github/callback',
    passport.authenticate('github'),
    function (req, res) {
        res.redirect('/products/db');
    }
);

// agrego ruta para logout que si es admin destruye la sesion y si no es admin solo setea el email en null

webRouter.get('/generate-reset-link', getGenerateResetLink);

webRouter.post('/logout', postLogout);


webRouter.get('/reset/:token', getResetToken);

webRouter.post('/reset/token', postResetToken);

webRouter.post(`/reset-password`, postResetPassword);

//agrego ruta para subir archivo y cambiar rol a premium

 webRouter.post('/upload', upload.fields([
    { name: 'dni', maxCount: 1 },
    { name: 'comprobanteDomicilio', maxCount: 1 },
    { name: 'comprobanteCuenta', maxCount: 1 }
  ]), updateUserFile);

 //agrego ruta para renderizar la vista user premium

webRouter.post('/premium', postPremiumUser);


// agrego ruta para chat

webRouter.get('/chat', getChat);

// agrego ruta para ver  productos de mongo

webRouter.get('/products/db', getProducDB);

// agrego ruta para ver carrito  carrito de mongo

webRouter.get('/carts/:email', ensureAuthenticated, getCartsByEmail);

// agrego ruta para generar ticket de mongo

webRouter.post('/mongo/tickets', postTiketDB);


module.exports = { webRouter };

