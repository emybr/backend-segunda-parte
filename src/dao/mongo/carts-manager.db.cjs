const Database = require('../../config/config.cjs');

class CartsManagerDb {
    constructor() {
        this.db = new Database();
    }


    async addCart(email) {
        try {
            if (!this.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const result = await this.cartsCollection.insertOne({ email, products: [] });
            return result;
        } catch (e) {
            console.error(e);
        }
    }



    async addProductToCart(email, product) {
        console.log(product);
        try {
            if (!this.db.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const cart = await this.db.cartsCollection.findOne({ email });
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
                await this.db.cartsCollection.updateOne({ email }, { $set: { products: cart.products } });
                console.log("Producto agregado al carrito");
            } else {
                await this.db.cartsCollection.insertOne({
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
                });
                console.log("Carrito creado y producto agregado");
            }
        } catch (e) {
            console.error(e);
        }
    }
    

    async updateCartIdUser(email) {
        try {
            if (!this.db.cartsCollection || !this.usersCollection) {
                await this.db.connectToDatabase();
            }
            const cart = await this.db.cartsCollection.findOne({ email });
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
            if (!this.database) {
                await this.connectToDatabase();
            }
            const totalProducts = await this.database.countDocuments();
            return totalProducts;
        } catch (e) {
            console.error(e);
        }
    }


    async getTotalCarts() {
        try {
            if (!this.db.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const totalCarts = await this.db.cartsCollection.countDocuments();
            return totalCarts;
        } catch (e) {
            console.error(e);
        }
    }

    async getCartsByEmail(email) {
        try {
            if (!this.db.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const cart = await this.db.cartsCollection.findOne({ email });
            return cart;
        } catch (error) {
            console.error(error);
            throw new Error('Error getting cart');
        }
    }
    
    // Actualizar el carrito del usuario después de la compra

    async updateCartAfterPurchase(email, purchasedProductIds) {
        try {
            if (!this.db.cartsCollection) {
                await this.db.connectToDatabase();
            }
            const cart = await this.db.cartsCollection.findOne({ email });
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