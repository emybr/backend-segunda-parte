const fs = require('fs');
const { json } = require('stream/consumers');

 class ProductManager {
    constructor() {
        this.products = []; // Almacena la lista de productos
        this.id = 0; // Contador para generar el ID de cada producto
    }

    // guardo contenido en un archivo json antes de sobreescribirlo
    saveProducts() {
        fs.writeFileSync('./products.json', JSON.stringify(this.products, null, '\t'));
    }

    // Añade un nuevo producto a la lista de productos
    addProduct(title, description, price, thumbnail, code, stock) {
        // Validar que todos los campos sean obligatorios
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.log("Todos los campos son obligatorios");
            return;
        }

        // Validar que no se repita el campo "code"
        let existingProduct = this.products.find(product => product.code === code);
        if (existingProduct) {
            console.log("Ya existe un producto con ese código");
            return;

        }

        // Crear un nuevo producto con un id autoincrementable
        this.id++;
        let newProduct = {
            id: this.id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };
        this.products.push(newProduct);
    }

    // Devuelve la lista de productos
    getProducts() {
        return this.products;
    }

    // Busca un producto por su ID
    getProductById(id) {
        let product = this.products.find(product => product.id === id);
        if (!product) {
            console.log("Producto no encontrado");
            return;
        }
        return product;
    }

    // Carga los productos desde un archivo JSON
    loadProductsFromFile() {
        // Lee los datos del archivo JSON
        let productsData = fs.readFileSync("./products.json", "utf-8");
        // Convierte los datos en un objeto JavaScript
        let products = JSON.parse(productsData);
        // Concatena los productos nuevos con los existentes
        this.products = this.products.concat(products);
    }
    // Eliminalo producto por su ID
    eliminarProducto(id) {
        let product = this.products.find(product => product.id === id);
        if (!product) {
            console.log("Not found");
            return;
        }
        this.products.splice(product, 1);
    }

    // Actualiza un producto por su ID
    updateProduc(id, title, description, price, thumbnail, code, stock) {
        let product = this.products.find(product => product.id === id);
        if (!product) {
            console.log("Not found");
            return;
        }
        product.title = title;
        product.description = description;
        product.price = price;
        product.thumbnail = thumbnail;
        product.code = code;
        product.stock = stock;
    }


}


// Agregar un nuevo producto al archivo JSON
const productManager = new ProductManager();
productManager.loadProductsFromFile();

let newProduct3 = {
    title: "Producto 3",
    description: "Descripción del producto 3",
    price: 700,
    thumbnail: "https://via.placeholder.com/150",
    code: "123461",
    stock: 70
};

let newProduct4 = {
    title: "Producto 4",
    description: "Descripción del producto 4",
    price: 800,
    thumbnail: "https://via.placeholder.com/150",
    code: "123462",
    stock: 80
};

let newProduct5 = {
    title: "Producto 5",
    description: "Descripción del producto 10",
    price: 1000,
    thumbnail: "https://via.placeholder.com/150",
    code: "123463",
    stock: 100
};

productManager.addProduct(newProduct3.title, newProduct3.description, newProduct3.price, newProduct3.thumbnail, newProduct3.code, newProduct3.stock);
productManager.addProduct(newProduct4.title, newProduct4.description, newProduct4.price, newProduct4.thumbnail, newProduct4.code, newProduct4.stock);
productManager.addProduct(newProduct5.title, newProduct5.description, newProduct5.price, newProduct5.thumbnail, newProduct5.code, newProduct5.stock);
console.log(productManager.getProducts());
productManager.saveProducts();

// Elimina un producto

productManager.eliminarProducto(5);
console.log(productManager.getProducts());
productManager.saveProducts();

// Actualiza un producto

productManager.updateProduc(1, "Producto 1 actualizado", "Descripción del producto 1 actualizada de nuevo", 600, "https://via.placeholder.com/150", "123460", 60);
console.log(productManager.getProducts());
productManager.saveProducts();

// buscco un producto por su id

console.log(productManager.getProductById(1));


// exports.ProductManager = ProductManager;
module.exports.ProductManager = ProductManager;
