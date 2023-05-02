const express = require('express');
const app = express();
const port = 8080;
const { engine } = require('express-handlebars');
const routes = require('./routes/routes.cjs');
const { webRouter } = require('./routes/webRouters.cjs');
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const mongoRoutes = require('./routes/routes-mongo.cjs');
const Database = require (`./config/config.cjs`)
const UserManagerDb = require('./dao/mongo/user-manager-db.cjs');
const ChatManagerDB = require('./dao/mongo/chat-manager.db.cjs');
const {ProductManager} = require('./dao/file/product-manager.cjs');
const db = new Database();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const MongoStore = require('connect-mongo');
const passport = require('passport');
const bcrypt = require('bcrypt');
const passportGithub = require('passport-github');



// creo configuracion de mango para guardar sesiones

const store = MongoStore.create({
    mongoUrl: 'mongodb+srv://emybr82ar:92713@cluster0.apsr9qa.mongodb.net/?retryWrites=true&w=majority',
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    ttl: 60 * 60 * 24 * 7 // 1 week
});

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    store: store
}));


const axios = require('axios');
const OPENAI_API_KEY = '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';


const database = new Database();
const  userManagerDb = new UserManagerDb();
const chatManagerDb = new ChatManagerDB();

// agrego passport
app.use(passport.initialize());
app.use(passport.session());

// agrego passport local
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    { usernameField: 'email' }, // le digo que el campo de usuario es el email
    async function (email, password, done) {
        const user = await userManagerDb.getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
    }
));

//serializo el usuario y sederilizo el usuario
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userManagerDb.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// agrego passport github

const GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: 'Iv1.b77e98c047845c88',
    clientSecret: 'aef39f4c432ce50e2d5cee5305d46fc3ade23ee1',
    callbackURL: 'http://localhost:8080/login/github/callback'
},
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
)
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine());
app.set('views', '../views');
app.set('view engine', 'handlebars');


app.use(express.static('../public'));

app.use('/db', mongoRoutes);
app.use('/api', routes);
app.use('/', webRouter);

httpServer.listen(port, async () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
    await db.connectToDatabase(); // Conéctate a la base de datos de MongoDB
});

const io = new Server(httpServer);

const productManager = new ProductManager();
productManager.loadProductsFromFile();

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!');

    const products = productManager.getProducts();
    socket.emit('products', { products: products });
    console.log(products);

    socket.on('newProduct', async (product) => {
        try {
            await db.createProduct(product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
            console.log(product);

            io.emit('updateProducts', { products: await db.getAllProducts() });
        } catch (error) {
            socket.emit('errorMessage', { status: 'error', message: error.message });
        }
    });


    socket.on('chat message', async (message, username) => {
        console.log(`${username}: ${message}`);
        // Guardar el mensaje en la base de datos
        await chatManagerDb.insertMessage(message, username);
        // Emitir el mensaje a todos los clientes conectados
        io.emit('chat message', message, username);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

});







