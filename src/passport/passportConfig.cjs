const passport = require('passport');
const bcrypt = require('bcrypt');
const passportLocal = require('passport-local').Strategy;
const passportGithub = require('passport-github').Strategy;
const { mensajes, errores } = require('../errores/errores.cjs');
const UserManagerDb  = require('../dao/mongo/user-manager-db.cjs');
const userManagerDb = new UserManagerDb();



const passportConfig = (app) => {
    // Configuración de passport local
    passport.use(new passportLocal(
        { usernameField: 'email' },
        async (email, password, done) => {
            const user = await userManagerDb.getUserByField('email', email);
            if (!user) {
                return done(null, false, { message: mensajes[errores.ERROR_LOGIN] });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: mensajes[errores.ERROR_LOGIN] });
            }
            return done(null, user);
        }
    ));

    // Serialización y deserialización de usuario
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userManagerDb.getUserByField('_id', id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
  

    // Configuración de passport GitHub
    passport.use(new passportGithub({
        clientID: 'Iv1.b77e98c047845c88',
        clientSecret: 'aef39f4c432ce50e2d5cee5305d46fc3ade23ee1',
        callbackURL: 'http://localhost:8080/login/github/callback'
    },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports = passportConfig;