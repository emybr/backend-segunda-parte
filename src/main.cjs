const express = require('express');
const app = express();
const port = 8080;
const { engine } = require('express-handlebars');
const routes = require('./routes.cjs');
const { webRouter } = require('./webRouters.cjs');
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const { ProductManager } = require('./entrega3.cjs');
const mongoRoutes = require('./routes-mongo.cjs');
const Database = require('./mongo.cjs');
const db = new Database();
const session = require('express-session');
const fileStore = require('session-file-store');
const FileStore = fileStore(session);

const axios = require('axios');
const OPENAI_API_KEY = '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';


const database = new Database();

//agrego fileStore



app.use(session({
    store: new FileStore({}),
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

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


    // socket.on('chat message', async (message, username) => {
    //     console.log(`${username}: ${message}`);
    //     // Guardar el mensaje en la base de datos
    //     await database.insertMessage(message, username);
    //     // Emitir el mensaje a todos los clientes conectados
    //     io.emit('chat message', message, username);
    // });

    // socket.on('disconnect', () => {
    //     console.log('Cliente desconectado');
    // });

    socket.on('chat message', async (message, username) => {
        console.log(`${username}: ${message}`);
        // Guardar el mensaje en la base de datos
        await database.insertMessage(message, username);
        // Obtener la respuesta de Chat-GPT
        const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
            prompt: message,
            max_tokens: 1000,
            temperature: 0.5
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' +  OPENAI_API_KEY // Reemplaza OPENAI_API_KEY con tu clave de API de Chat-GPT
            }
        });
        const botMessage = response.data.choices[0].text;
        // Emitir el mensaje del bot a todos los clientes conectados
        io.emit('chat message', botMessage, 'Bot');
    });
});


