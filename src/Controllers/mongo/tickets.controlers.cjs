const TicketManagerDb = require("../../dao/mongo/ticket-manager.db.cjs");
const ProductManagerDb = require('../../dao/mongo/product-manager-db.cjs')
const CartsManagerDb = require('../../dao/mongo/carts-manager.db.cjs')
const cartsManagerDb = new CartsManagerDb
const ticketManagerDb = new TicketManagerDb
const productManagerDb = new ProductManagerDb
const { sendEmail } = require('../../service/email.service.cjs');

const { winstonLogger } = require('../../middleware/logger.cjs')

const { mensajes, errores } = require('../../errores/errores.cjs');


async function postTiketDB(req, res) {
    {
        const { amount, purchaser, email } = req.body;
        const carts = await cartsManagerDb.getCartsByEmail(email);
        console.log(carts);
        const productIds = carts.products.map(product => product.id);
        let flag = true;
        try {
            for (var i = 0; i < productIds.length; i++) {
                const product = await productManagerDb.getProductById(parseInt(productIds[i]));
                console.log(product);
                const quantity = carts.products[i].quantity; // Obtener la cantidad de productos en el carrito
                if (product.stock < quantity) {
                    flag = false;
                    throw new Error(mensajes.ERROR_CARRITO_STOCK);
                }
            }

            if (flag === true) {
                // Si todos los productos tienen suficiente stock, restar el stock y generar el ticket
                await Promise.all(productIds.map((productId, i) => productManagerDb.updateProductStock(parseInt(productId), carts.products[i].quantity)));
                const result = await ticketManagerDb.createTicket(amount, purchaser, email);

                //obtener los detalles del los productos del carrito

                const productDetails = await Promise.all(productIds.map(async (productId, i) => {
                    const product = await productManagerDb.getProductById(parseInt(productId));
                    return {
                        name: product.title,
                        quantity: carts.products[i].quantity,
                        price: product.price
                    };
                }));

                // Construir el texto del correo electrónico con los detalles de los productos
                let text = `Gracias por tu compra. Aquí están los detalles:\n\nMonto total: ${amount}\nComprador: ${purchaser}\nCorreo electrónico: ${email}\n\nProductos:\n`;
                productDetails.forEach((product) => {
                    const totalPrice = product.quantity * product.price;
                    text += `${product.name} x${product.quantity} - Precio unitario: ${product.price} - Precio total: ${totalPrice}\n`;
                });
                const subject = 'Compra realizada';
                await sendEmail(email, subject, text);

                // Eliminar los productos comprados del carrito
                for (var i = 0; i < productIds.length; i++) {
                    await cartsManagerDb.removeCartItem(email, productIds[i]);
                }


                // res.send({ message: 'Ticket creado exitosamente', data: result });
                res.render('vistaTicket', { amount, email, message: 'Su ticket creado exitosamente', data: result });
            } else {
                // Si hay productos sin stock suficiente, devolver los IDs de los productos no procesados
                res.send({
                    message: mensajes.ERROR_PRODUCTO_STOCK,
                    data: { unprocessedProductIds: productIds },
                });
            }
        } catch (e) {
            console.error(e);
            // res.status(500).send({ message:mensajes.ERROR_CARRITO_STOCK });
            winstonLogger.http('No hay stock suficiente');
        }
    }
}


module.exports = { postTiketDB }