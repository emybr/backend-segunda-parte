const { faker } = require('@faker-js/faker');



function generateProducts(count = 100) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.commerce.productDescription(),
      stock: faker.finance.accountNumber(2),
    };

    products.push(product);
    }
    return products;
}


module.exports = { generateProducts };

