const {ProductManager} = require ('../../dao/file/product-manager.cjs')
const productManager = new ProductManager
productManager.loadProductsFromFile();
const {winstonLogger} = require('../../middleware/logger.cjs')

async function getProducsFile (req, res) {
    
    const products = productManager.getProducts();
    res.render('products', { products: products });
    console.log(products);

}

async function getProducsFileID (req, res) {
    const product = productManager.getProductById(Number(req.params.pid));
    if (product) {
        res.send(product);
    } else {
        // res.status(404).send(mensajes.ERROR_PRODUCTO);
        winstonLogger.http('El producto no existe');
    }    
}

async function getAllProducsFile (req, res) {
    res.send(productManager.getProducts());
}

async function postNewProductFile (req, res) {
    const product = req.body;
    productManager.addProduct(product.title, product.description, product.price, product.thumbnail, product.code, product.stock);
    productManager.saveProducts();
    res.send(product);
}



module.exports= {getProducsFile, getProducsFileID,getAllProducsFile,postNewProductFile}