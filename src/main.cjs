const express = require('express');
const app = express();
const port = 8080;
const { engine } = require('express-handlebars');
const routes = require('./routes.cjs');
const { webRouter } = require('./webRouters.cjs');




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(`handlebars`, engine());
app.set(`views`, `../views`);
app.set(`view engine`, `handlebars`);

app.use('/api', routes);
app.use('/', webRouter);




app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});


