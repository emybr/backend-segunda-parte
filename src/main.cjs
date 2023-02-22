
const express = require('express');
const app = express();
const port = 8080;

const routes = require('./routes.cjs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});



















