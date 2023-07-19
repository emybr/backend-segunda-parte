require('dotenv').config();
const express = require('express');
const app = express();
const port = 8080;
const  {engine}   = require('express-handlebars');
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const sessionConfig = require('../src/sessions/sessionConfig.cjs');
const passportConfig = require('../src/passport/passportConfig.cjs');
const routes = require('../src/routes/routes.cjs');
const {webRouter} = require('../src/routes/webRouters.cjs');
const mongoRoutes = require('../src/routes/routes-mongo.cjs');
const Database = require('../src/config/config.cjs')
const userManagerDb = require('./dao/mongo/user-manager-db.cjs');
const ChatManagerDb = require('./dao/mongo/chat-manager.db.cjs');
const { ProductManager } = require('./dao/file/product-manager.cjs');
const db = new Database();
const chatManagerDb = new ChatManagerDb
const path = require('path');


// Configuración de sesión
sessionConfig(app);

// Configuración de passport
passportConfig(app, userManagerDb);

// Configuración de express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', engine());
app.set('views', './views');
app.set('view engine', 'handlebars');


const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
  

app.use('/db', mongoRoutes);
app.use('/api', routes);
app.use('/', webRouter,);




// Conexión a la base de datos y inicio del servidor
db.connectToDatabase()
    .then(() => {
        httpServer.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });

// Configuración de Socket.IO
const io = new Server(httpServer);
const productManager = new ProductManager();
productManager.loadProductsFromFile();

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!');

    const products = productManager.getProducts();
    socket.emit('products', { products });

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



