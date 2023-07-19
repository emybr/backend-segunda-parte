
const Database = require('../../config/config.cjs');
const { createDocument, updateDocument, delleDocument, getDocument,getTotalDocuments } = require('./factory/factoryMd.cjs');
const ProductModels = require('./models/produc.models.cjs')


class ProductManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
        this.updateDocument = updateDocument;
        this.delleDocument = delleDocument;
        this.getDocument = getDocument;
        this.getTotalDocuments = getTotalDocuments;
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


    async createProduct(id, title, description, price, thumbnail, code, stock, creatorEmail, creatorRole) {
        const product = new ProductModels({
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            creatorEmail,
            creatorRole
        });

        await this.createDocument('database', product);
    }


    async updateProduct(id, title, price, description, thumbnail, code, stock) {
        try {
            const filter = { id }; // Filtro para buscar el producto por su ID
            const update = { title, price, description, thumbnail, code, stock }; // Campos y valores a actualizar

            const result = await this.updateDocument('database', filter, update);

            return result;
        } catch (error) {
            // console.error(error);
            throw new Error('Error al actualizar el producto');
        }
    }

    async deleteProduct(id) {
        try {
            const result = await this.delleDocument('database', { id });
            return result;
        } catch (e) {
            console.error(e);
        }
    }

    //cambio por getTotalDocuments/ antes estaba getDocumentTotal

    async getTotalProducts() {
        try {
            const totalProducts = await this.getTotalDocuments('database');
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
            const product = await this.getDocument('database', { id: id });
            return product;
        } catch (e) {
            console.error(e);
        }
    }



    async updateProductStock(productId, quantity) {
        console.log(productId, quantity);
        try {
            const product = await this.getDocument('database', { id: productId });
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


