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
        if (this.products.find(product => product.id === this.id)) {
            console.log("Ya existe un producto con ese id");
            this.id = this.products.reduce((acc, product) => {
                return product.id > acc ? product.id : acc;
            }, 0) + 1;
        } else {
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
            console.log("Producto agregado");
            this.id++;
        }
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
    deleteProduct(id) {
        let product = this.products.find(product => product.id === id);
        if (!product) {
            console.log("Not found");
            return;

        }
        this.products.splice(product, 1);
        console.log("Producto eliminado");
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
        console.log("Producto actualizado");
    }


}

// agregar productos al archivo json

const productManager = new ProductManager();
productManager.loadProductsFromFile();


console.log(productManager.getProducts());
productManager.saveProducts();

// Elimina un producto

productManager.deleteProduct(5);
console.log(productManager.getProducts());
productManager.saveProducts();

// Actualiza un producto

productManager.updateProduc(1, "Producto 1 actualizado 2", "Descripción del producto 1 actualizada de nuevo 2", 600, "https://via.placeholder.com/150", "123460", 60);
console.log(productManager.getProducts());
productManager.saveProducts();

// buscco un producto por su id

console.log(productManager.getProductById(1));


module.exports.ProductManager = ProductManager;


