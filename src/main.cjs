const express = require('express');
const app = express();
const port = 8080;
const { engine } = require('express-handlebars');
const routes = require('./routes.cjs');
const { webRouter } = require('./webRouters.cjs');
const httpServer = require('http').createServer(app);
const { Server } = require('socket.io');
const { SoketIOServer } = require('socket.io');
const { ProductManager } = require('./entrega3.cjs');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(`handlebars`, engine());
app.set(`views`, `../views`);
app.set(`view engine`, `handlebars`);

app.use(express.static('../public'));

app.use('/api', routes);
app.use('/', webRouter);

httpServer.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});


const io = new Server(httpServer);

const productManager = new ProductManager();
productManager.loadProductsFromFile();

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!');

    const products = productManager.getProducts();
    socket.emit('products', { products: products });
    console.log(products);


    socket.on('newProduct', (product, callback) => {
        try {
            // Agrega el nuevo producto al ProductManager
            productManager.addProduct(product);

            // Confirma que el producto se agregó correctamente
            callback({ status: 'ok' });

            // Emite la lista actualizada de productos a todos los clientes
            io.emit('updateProducts', { products: productManager.getProducts() });
        } catch (error) {
            // Si ocurre un error, envía un mensaje de error al cliente
            callback({ status: 'error', message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});
