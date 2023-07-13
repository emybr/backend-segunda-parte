
const Database = require('../../config/config.cjs');
const { createDocument } = require('./factory/factoryMd.cjs');
const ProductModels = require('./models/produc.models.cjs')


class ProductManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
    }

    async getProducts(limit = 10, page = 1, sort, query) {
        const skip = (page - 1) * limit;
        const filter = query ? { $text: { $search: query } } : {};
        const sortOption = sort ? { [sort]: 1 } : {};

        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }

            const products = await this.db.database
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort(sortOption)
                .toArray();

            return products;
        } catch (e) {
            console.error(e);
        }
    }


    async createProduct(id, title, description, price, thumbnail, code, stock) {
        const product = new ProductModels( {
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        });

        await this.createDocument('database', product);
    }

    async updateProduct(id, title, price) {
        console.log(id, title, price);
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const result = await this.db.database.updateOne(
                { id },
                { $set: { title, price } }
            );
            return result;
        } catch (e) {
            // console.error(e);
            throw new Error('Error al actualizar el producto');
        }
    }

    async deleteProduct(id) {
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const result = await this.db.database.deleteOne({ id });
            return result;
        } catch (e) {
            console.error(e);
        }
    }

    async getTotalProducts() {
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const totalProducts = await this.db.database.countDocuments();
            return totalProducts;
        } catch (e) {
            console.error(e);
        }
    }


    async getAllProducts() {
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const products = await this.db.database.find({}).toArray();
            return products;
        } catch (e) {
            console.error(e);
        }
    }


    async getProductById(id) {
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const product = await this.db.database.findOne({ id: id });
            return product;
        } catch (e) {
            console.error(e);
        }
    }

    async updateProductStock(productId, quantity) {
        console.log(productId, quantity);
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const product = await this.db.database.findOne({ id: productId });
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado`);
            }
            product.stock -= quantity;
            await this.db.database.replaceOne({ id: productId }, product);
        } catch (e) {
            console.error(e);
            throw new Error(`Error al actualizar el stock del producto: ${e.message}`);
        }
    }

}

module.exports = ProductManagerDb;


