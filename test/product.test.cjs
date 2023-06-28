
// const { it } = require('@faker-js/faker');
const chai = require('chai');
const supertest = require('supertest');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
require('dotenv').config();



const expect = chai.expect;
const request = supertest('http://localhost:8080');

describe('Pruebas de la ruta /mongo/productos/addproduc', () => {
    before(() => {
        process.env.NODE_ENV = 'test';
    });


    it('should add a product', async () => {
        const productoMock = {
            id: 18,
            title: 'Producto agregado con test 3 ',
            description: 'Descripcion del producto 1',
            price: 100,
            thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/bus-vehicle-transport-school-128.png',
            code: '93947854758956',
            stock: 10
        };
        const response = await request.post('/db/mongo/products/addproduts').send(productoMock);
        const { statusCode, ok, body } = response; // Corregido 'statuscode' a 'statusCode'
        console.log(statusCode);
        console.log(ok);
        console.log(body);
        // Realiza las expectativas aquí usando chai.expect
        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
    });
});

// prueba para eliminar producto por id//

describe('Pruebas de la ruta /mongo/productos/:id', () => {
    it('should delete a product', async () => {
        const id = 17;
        const response = await request.delete(`/db/mongo/products/${id}`);
        const { statusCode, ok, body } = response; // Corregido 'statuscode' a 'statusCode'
        console.log(statusCode);
        console.log(ok);
        console.log(body);
        // Realiza las expectativas aquí usando chai.expect
        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
    });
}
);


// prueba para ruta autualizar producto por id//

describe('Pruebas de la ruta db/mongo/products/:id', () => {
    it('should update a product', async () => {
        const id = 15;
        const updatedProductData = {
            title: 'Producto actualizado con test3',
            price: 1600
        };
        const response = await request
            .put(`/db/mongo/products/${id}`)
            .send(updatedProductData);
        expect(response.statusCode).to.equal(200);
        expect(response.ok).to.be.true;
        // Agrega más expectativas según sea necesario para verificar el resultado de la actualización
    });

    it('should handle errors when updating a product', async () => {
        const id = 17;
        const updatedProductData = {
            title: 'Producto actualizado con test',
            price: 1000
        };

        const response = await request
            .put(`/db/mongo/products/${id}`)
            .send(updatedProductData);

        expect(response.statusCode).to.equal(500);
        expect(response.ok).to.be.false;
        // Agrega más expectativas según sea necesario para verificar el manejo de errores
    });
});


