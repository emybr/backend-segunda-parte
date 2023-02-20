
const fs = require('fs');

class Carts {
    constructor() {
        this.carts = [];
        this.id = 0;
    }

    saveCarts() {
        fs.writeFileSync('./carts.json', JSON.stringify(this.carts, null, '\t'));
        console.log("Carritos guardados");
    }

    addCart() {
        let newCart = {
            id: this.id,
            timestamp: new Date(),
            products: []
        };
        this.carts.push(newCart);
        console.log("Carrito agregado");
        this.id++;
        console.log(this.carts);
    }

    addProductToCart(cartId, product) {
        const cart = this.getCartById(cartId);
        if (cart) {
            const existingProduct = cart.products.find(p => p.id === product.id);
            if (existingProduct) {
                existingProduct.quantity++;
                console.log("Cantidad del producto actualizada");
            } else {
                cart.products.push({ ...product, quantity: 1 });
                console.log("Producto agregado al carrito");
            }
        } else {
            console.log(`No se encontró ningún carrito con el id ${cartId}`);
            // crear nuevo carrito y agregar producto
            let newCart = {
                id: this.id,
                timestamp: new Date(),
                products: []
            };
            this.carts.push(newCart);
            console.log("Carrito agregado");
            this.id++;
            console.log(this.carts);
        }
    }

    getCartById(id) {
        return this.carts.find(cart => cart.id === id);
    }

    getCarts() {
        return this.carts;
    }

    deleteCart(id) {
        const cart = this.getCartById(id);
        if (cart) {
            this.carts = this.carts.filter(cart => cart.id !== id);
        }
    }

    deleteProductFromCart(id, productId) {
        const cart = this.getCartById(id);
        if (cart) {
            cart.products = cart.products.filter(product => product.id !== productId);
        }
    }

    updateCart(id, product) {
        const cart = this.getCartById(id);
        if (cart) {
            cart.products = cart.products.map(p => {
                if (p.id === product.id) {
                    return { ...p, ...product };
                } else {
                    return p;
                }
            });
        }
    }

}

const carts = new Carts();

module.exports.Carts = Carts;
