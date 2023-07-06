
const {winstonLogger} = require('../../middleware/logger.cjs');
const UserManagerDb = require ('../../dao/mongo/user-manager-db.cjs');
const { info } = require('winston');
const userManagerDb = new UserManagerDb();
const passport = require('passport');
const { ensureAuthenticated } = require('../../middleware/autenticacion.cjs')


async function getUserController (req, res) { 
    res.render('login');    
}

async function getRegisterUser (req, res) {
    res.render('register');
}

async function getGenerateResetLink (req, res) {
    res.render('generateResetLink');
}

async function getResetToken (req, res) {
    const token = req.params.token;
    res.render('resetUserPassword', { token });
}

async function postPremiumUser(req, res) {
    const email = req.body.email; 
    console.log(email);
    res.render('vistaUpdateUserPremium', { email });
}


async function postRegisterUser (req, res) {
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
}

async function postLoginUser (req, res, next)  {
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
}

async function postLogout (req, res) {
    (req, res) 
        if (req.session.email === 'admin@example.com') {
            req.session.destroy();
        } else {
            req.session.email = null;
        }
        res.redirect('/login');
    };


async function postResetPassword (req, res) {
    (req, res)  
        const { email } = req.body;
        await userManagerDb.actualizarContraseña(email);
        res.send(`Se ha enviado un email a ${email} para resetear la contraseña`);
    };


async function postResetToken (req, res) {
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
};

    
async function updateUserFile(req, res) {
    const email = req.session.email;
    const files = {
        dni: req.files.dni,
        comprobanteDomicilio: req.files.comprobanteDomicilio,
        comprobanteCuenta: req.files.comprobanteCuenta
    };
    try {
        await userManagerDb.setPremiunRole(email);
        const fileUrls = {
            dni: files.dni[0].path.replace(/\\/g, "/"),
            comprobanteDomicilio: files.comprobanteDomicilio[0].path.replace(/\\/g, "/"),
            comprobanteCuenta: files.comprobanteCuenta[0].path.replace(/\\/g, "/")
        };
        await userManagerDb.updateUserFiles(email, fileUrls);
        res.send('Archivos subidos correctamente');
    } catch (error) {
        console.error(error);
    }
};


module.exports = {
    getUserController,
    getRegisterUser,
    postRegisterUser,
    postLoginUser,
    postLogout,
    getGenerateResetLink,
    getResetToken,
    postResetPassword,
    postResetToken,
    updateUserFile,
    postPremiumUser
};

