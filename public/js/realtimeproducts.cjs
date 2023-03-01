
const productsElement = document.getElementById('products');
const productForm = document.getElementById('product-form');
const socket = io();

function renderProducts(products) {
  let html = '';
  products.forEach(product => {
    html += `
      <div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p>${product.price}</p>
        <img src="${product.thumbnail}" alt="${product.title}">
        <p>${product.code}</p>
        <p>${product.stock}</p>
      </div>
    `;
  });
  productsElement.innerHTML = html;
}

socket.on('products', data => {
  renderProducts(data.products);
  console.log(data.products);
});

socket.on('updateProducts', data => {
  renderProducts(data.products);
});

productForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const price = Number(document.getElementById('price').value);
  const thumbnail = document.getElementById('thumbnail').value;
  const code = (document.getElementById('code').value);
  const stock = Number(document.getElementById('stock').value);

  // Validar que todos los campos sean obligatorios antes de enviar el producto al servidor
  if (!title || !description || !price || !thumbnail || !code || !stock) {
    console.log('Todos los campos del servidor  son obligatorios');
    return;
  }

  const product = { title, description, price, thumbnail, code, stock };

  try {
    socket.emit('newProduct', product);
    productForm.reset();
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
  }
});

