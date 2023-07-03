const {Carts} = require('../../dao/file/carts.cjs')
const carts = new Carts
const {winstonLogger} = require('../../middleware/logger.cjs')



async function postAddCarsfile (req, res) {
    carts.addCart();
    carts.saveCarts();
    res.send({ message: 'Carrito agregado' });
}

async function postAddProductsCarFile (req, res){
    carts.addProductToCart(Number(req.params.cid), { id: Number(req.params.pid) });
    carts.saveCarts();
    res.send({ message: 'Producto agregado al carrito' });
}

async function getCarsIdFile (req, res) {
    const cart = carts.getCartById(Number(req.params.cid));
    if (cart) {
        res.send(cart);
    } else {
        // res.status(404).send(mensajes.ERROR_PRODUCTO);
        winstonLogger.http('El carrito no existe');
    }

}

module.exports = {postAddCarsfile,postAddProductsCarFile,getCarsIdFile}