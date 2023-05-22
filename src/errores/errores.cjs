const errores = {   
    ERROR_LOGIN:'ERROR_LOGIN',
    ERROR_ADMIN: 'ERROR_ADMIN',
    ERROR_PRODUCTO: 'ERROR_PRODUCTO',
    ERROR_NEW_PRODUCTO: 'ERROR_NEW_PRODUCTO',
    ERROR_PRODUCTO_ID: 'ERROR_PRODUCTO_ID',
    ERROR_ACTUALIZAR_PRODUCTO: 'ERROR_ACTUALIZAR_PRODUCTO',
    ERROR_ELIMINAR_PRODUCTO: 'ERROR_ELIMINAR_PRODUCTO',
    ERROR_PRODUCTO_STOCK: 'ERROR_PRODUCTO_STOCK',
    ERROR_USUARIO: 'ERROR_USUARIO',
    ERROR_USUARIO_ID: 'ERROR_USUARIO_ID',
    ERROR_USUARIO_ID_NO_ENCONTRADO: 'ERROR_USUARIO_ID_NO_ENCONTRADO',
    ERROR_USUARIO_EMAIL: 'ERROR_USUARIO_EMAIL',
    ERROR_CARRITO: 'ERROR_CARRITO',
    ERROR_CARRITO_STOCK: 'ERROR_CARRITO_STOCK',
    ERROR_TICKET: 'ERROR_TICKET',

}

const mensajes = {
    'ERROR_LOGIN': 'El usuario no existe.',
    'ERROR_ADMIN': 'El usuario no es administrador.',
    'ERROR_PRODUCTO': 'El producto no existe',
    'ERROR_NEW_PRODUCTO': 'Error al agregar el producto',
    'ERROR_PRODUCTO_ID': 'El id del producto no existe',
    'ERROR_ACTUALIZAR_PRODUCTO': 'Error al actualizar el producto',
    'ERROR_ELIMINAR_PRODUCTO': 'Error al eliminar el producto',
    'ERROR_PRODUCTO_STOCK': 'No se pudieron procesar todos los productos',
    'ERROR_USUARIO': 'El usuario no existe',
    'ERROR_USUARIO_ID': 'Error al obtener el usuario por id:',
    'ERROR_USUARIO_ID_NO_ENCONTRADO': 'El usuario no existe',
    'ERROR_USUARIO_EMAIL': 'Error al obtener el usuario por correo electrónico',
    'ERROR_CARRITO': 'Carrito no encontrado',
    'ERROR_CARRITO_STOCK': 'No hay stock suficiente',
    'ERROR_TICKET': 'Error al generar el ticket',
}

module.exports = { errores, mensajes };