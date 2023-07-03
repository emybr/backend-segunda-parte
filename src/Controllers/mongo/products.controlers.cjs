const ProductManagerDb = require('../../dao/mongo/product-manager-db.cjs')
const productManagerDb = new ProductManagerDb


async function getProducDB (req, res) {
    
        try {
            const limit = parseInt(req.query.limit) || 5;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort;
            const query = req.query.query;
    
            const products = await productManagerDb.getProducts(limit, page, sort, query)
    
            const totalProducts = await productManagerDb.getTotalProducts({
                $text: { $search: query },
            });
            const email = req.session.email;
            const totalPages = Math.ceil(totalProducts / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
            const prevPage = hasPrevPage ? page - 1 : null;
            const nextPage = hasNextPage ? page + 1 : null;
            const prevLink = hasPrevPage
                ? `${req.protocol}://${req.get('host')}${req.path}?limit=${limit}&page=${prevPage}`
                : null;
            const nextLink = hasNextPage
                ? `${req.protocol}://${req.get('host')}${req.path}?limit=${limit}&page=${nextPage}`
                : null;
    
            res.render('vistaProductos', {
                products,
                totalPages,
                prevPage,
                nextPage,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink,
                message: req.session.message,
                email,
            });
        } catch (error) {
            // res.status(500).send(mensajes.ERROR_PRODUCTO);
            winstonLogger.http('El producto no existe');
        }
    }


async function postProduc (req, res) {
    try {
        const { id,title, description, price, thumbnail, code, stock } = req.body;
        const result = await productManagerDb.createProduct(id,title, description, price, thumbnail, code, stock);
        res.status(200).json(result);
    } catch (error) {
        // res.status(500).send(mensajes.ERROR_NEW_PRODUCTO);
        winstonLogger.info('Error al agregar el producto');
    }
}

async function putPoducsDB (req , res) {
    try {
        const id = parseInt (req.params.id);
        const { title, price } = req.body;
        const result = await productManagerDb.updateProduct(id, title, price);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(mensajes.ERROR_ACTUALIZAR_PRODUCTO);
        winstonLogger.info('Error al actualizar el producto');
    }
}

async function deleteProduct (req, res)
    {
            try {
                const { id } = req.params;
                console.log(id);
                const numericId = parseInt(id);
                const result = await productManagerDb.deleteProduct(numericId);
                res.status(200).json(result);
            } catch (error) {
                // res.status(500).send(mensajes.ERROR_ELIMINAR_PRODUCTO);
                winstonLogger.info('Error al eliminar el producto');
            }
}


    module.exports = {getProducDB,postProduc,putPoducsDB,deleteProduct}