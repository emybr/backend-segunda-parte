
const { winstonLogger } = require('../../middleware/logger.cjs');
const UserManagerDb = require('../../dao/mongo/user-manager-db.cjs');
const { info } = require('winston');
const userManagerDb = new UserManagerDb();
const passport = require('passport');
const { ensureAuthenticated } = require('../../middleware/autenticacion.cjs')
const UserModels = require('../../dao/mongo/models/user.models.cjs');
const User = new UserModels();



async function getUserController(req, res) {
    res.render('login');
}

async function getRegisterUser(req, res) {
    res.render('register');
}

async function getGenerateResetLink(req, res) {
    res.render('generateResetLink');
}

async function getResetToken(req, res) {
    const token = req.params.token;
    res.render('resetUserPassword', { token });
}

async function postPremiumUser(req, res) {
    const email = req.body.email;
    console.log(email);
    res.render('vistaUpdateUserPremium', { email });
}



async function postRegisterUser(req, res) {
    try {
        const { nombre, apellido, edad, email, password, cartId } = req.body;
        await userManagerDb.createUser(nombre, apellido, edad, email, password, cartId);
        res.redirect('/login');
    } catch (error) {
        winstonLogger.http('Error al crear el usuario');
    }
}

async function postSetAdminRole(req, res) {
    try {
        const { email } = req.body;
        console.log(email);
        await userManagerDb.setAdminRole(email);
        res.redirect('/login');
    } catch (error) {
        winstonLogger.http('El usuario no es administrador');
    }
}


async function postLoginUser(req, res, next) {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send(info.message);
        }
        try {
            const foundUser = await userManagerDb.getUserByField('email', user.email);
            if (!foundUser) {
                return res.status(401).send('Usuario no encontrado');
            }
            await userManagerDb.setLastConnection(user.email);
            req.session.email = user.email;
            req.session.role = foundUser.role;
            console.log(req.session.role);
            const welcomeMessage = `Bienvenido, ${user.email} 😃`;
            req.session.message = welcomeMessage;

            // Redireccionar según el rol del usuario
            if (req.session.role === 'admin') {
                return res.redirect('/admin'); // Redirige a la vista para el administrador
            } else {
                return res.redirect('/products/db'); // Redirige a la vista para usuarios normales (user, premium)
            }

        } catch (error) {
            console.error('Error al actualizar lastConnection:', error);
        }
    })(req, res, next);
}


async function postLogout(req, res) {
    (req, res)
    if (req.session.email === 'admin@example.com') {
        req.session.destroy();
    } else {
        req.session.email = null;
    }
    res.redirect('/login');
};


async function postResetPassword(req, res) {
    (req, res)
    const { email } = req.body;
    await userManagerDb.actualizarContraseña(email);
    res.send(`Se ha enviado un email a ${email} para resetear la contraseña`);
};


async function postResetToken(req, res) {
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
        await userManagerDb.setPremiumRole(email);
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

async function deleteUserInactivo(req, res) {
    try {
        await userManagerDb.deleteInactiveUsers();
        return res.status(200).json({ message: 'Usuarios inactivos eliminados correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error);
        return res.status(500).json({ message: 'Error al eliminar usuarios inactivos' });
    }
}

//agrego funcion para eliminar un usuario por email desde administrador

async function deleteUser(req, res) {
    try {
        const email = req.params.email;
        console.log(email);
        await userManagerDb.deleteUser(email);
        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        return res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
}

//agrego fucion para obtener todos los usuarios y sus datos nombre, correo y rol

async function getAllUsers(req, res) {
    try {
        const users = await userManagerDb.getUsersData();
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
}

async function getAdmin(req, res) {
    try {
        const users = await userManagerDb.getUsersData();
        return res.render('vistaAdministrador', { users });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
}

//aguego funcion para setear rol de usaurio admin/premium

async function postSetRoleByEmail(req, res) {
    try {
        const email = req.params.email;
        const role = req.body.rol;
        console.log(role);
        const masterUser = 'admin@example.com';
        if (email === masterUser) {
            return res.status(401).json({ message: 'No se puede modificar el rol del usuario Maestro' });
        }
        if (role === 'admin') {
            await userManagerDb.setAdminRole(email);
        }
        else if (role === 'user') {
            await userManagerDb.setUserRole(email);
        }
        else {
            await userManagerDb.setPremiumRole(email);
        }
        return res.status(200).json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el rol del usuario:', error);
        return res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
    }
}



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
    postPremiumUser,
    deleteUserInactivo,
    postSetAdminRole,
    getAllUsers,
    getAdmin,
    deleteUser,
    postSetRoleByEmail
};

