const chai = require('chai');
const supertest = require('supertest');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
require('dotenv').config();


const expect = chai.expect;
const request = supertest('http://localhost:8080');


describe('POST /register', () => {
    it('deberia crear un usuario', async () => {
        const res = await request.post('/register').send({
            nombre: 'test1',
            apellido: 'test1',
            edad: 'test1',
            email: 'test@test1.com',
            password: 'test',
            cartId: ''
        });
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('nombre');
        expect(res.body).to.have.property('apellido');
        expect(res.body).to.have.property('edad');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('password');
        expect(res.body).to.have.property('cartId');
    });
});

// agrego test para login

describe('POST /login', () => {
  it('should log in the user and redirect to /products/db', function (done) {
    this.timeout(5000); // Establece un tiempo de espera de 5000 ms

    const credentials = {
      email: 'test@test.com',
      password: 'test'
    };

    request // 'app' es tu aplicación Express
      .post('/login')
      .send(credentials)
      .expect(302) // Verifica el código de estado de redirección
      .expect('Location', '/products/db') // Verifica que la respuesta redireccione a la ruta /products/db
      .end(done);
  });
});

// agrego test para login con credenciales invalidas

it('should return 401 status and error message for invalid credentials', (done) => {
  const credentials = {
      email: 'invalid@example.com',
      password: 'invalidpassword'
  };

  request
      .post('/login')
      .send(credentials)
      .expect(401)
     
      .end(done);
});

