const Database = require('../../config/config.cjs');
const { createDocument, getDocument, getTotalDocuments, updateDocument } = require('./factory/factoryMd.cjs');

class CartsManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
        this.getDocument = getDocument;
        this.getTotalDocuments = getTotalDocuments;
        this.updateDocument = updateDocument;
    }


    async addCart(email) {
        try {
            const document = { email, products: [] };
            await this.createDocument('cartsCollection', document);
        } catch (e) {
            console.error(e);
        }
    }


    async addProductToCart(email, product) {
        console.log(product);
        try {
            const cart = await this.getDocument('cartsCollection', { email });
            if (cart) {
                const existingProduct = cart.products.find(p => p.id === parseInt(product.id));
                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    product.quantity = 1;
                    const cartProduct = {
                        id: parseInt(product.id),
                        title: product.title,
                        description: product.description,
                        price: parseFloat(product.price),
                        thumbnail: product.thumbnail,
                        code: product.code,
                        stock: parseInt(product.stock),
                        quantity: 1
                    };
                    cart.products.push(cartProduct);
                }
                await this.db.cartsCollection.replaceOne({ email }, cart);
                console.log("Producto agregado al carrito");
            } else {
                const newCart = {
                    email: email,
                    timestamp: new Date(),
                    products: [{
                        id: parseInt(product.id),
                        title: product.title,
                        description: product.description,
                        price: parseFloat(product.price),
                        thumbnail: product.thumbnail,
                        code: product.code,
                        stock: parseInt(product.stock),
                        quantity: 1
                    }]
                };
                await this.createDocument('cartsCollection', newCart);
                console.log("Carrito creado y producto agregado");
            }
        } catch (e) {
            console.error(e);
        }
    }



    async updateCartIdUser(email) {
        try {
            const cart = await this.getDocument('cartsCollection', { email });
            if (cart) {
                await this.db.usersCollection.updateOne({ email }, { $set: { cartId: cart._id } });
                console.log("CartId actualizado para el usuario", email);
            } else {
                console.log("No se encontró un carrito para el usuario", email);
            }
        } catch (e) {
            console.error(e);
        }
    }


    async getTotalProducts() {
        try {
            const totalProducts = await this.getTotalDocuments('database');
            return totalProducts;
        } catch (e) {
            console.error(e);
        }
    }

    async getTotalCarts() {
        try {
            const totalCarts = await this.getTotalDocuments('cartsCollection');
            return totalCarts;
        } catch (e) {
            console.error(e);
        }
    }



    async getCartsByEmail(email) {
        try {
            const cart = await this.getDocument('cartsCollection', { email });
            return cart;
        } catch (error) {
            console.error(error);
            throw new Error('Error getting cart');
        }
    }


    // Actualizar el carrito del usuario después de la compra

    async updateCartAfterPurchase(email, purchasedProductIds) {
        try {
            const cart = await this.getDocument('cartsCollection', { email });
            if (!cart) {
                throw new Error(`Cart with ID ${email} not found`);
            }
            const updatedProducts = cart.products.filter(p => !purchasedProductIds.includes(p.id));
            await this.db.cartsCollection.updateOne({ email }, { $set: { products: updatedProducts } });
        } catch (error) {
            console.error(error);
            throw new Error('Error updating cart after purchase');
        }
    }


    //   Agrego nuevo método para obtener todos los carritos

    async removeCartItem(email, productId) {
        try {
            if (!this.db.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const result = await this.db.cartsCollection.updateOne(
                { email: email },
                { $pull: { products: { id: productId } } }
            );
            return result;
        } catch (e) {
            console.error(e);
        }
    }



}




module.exports = CartsManagerDb;