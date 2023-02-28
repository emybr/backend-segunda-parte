
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
  const price = parseFloat(document.getElementById('price').value);
  const thumbnail = document.getElementById('thumbnail').value;
  const code = parseInt(document.getElementById('code').value);
  const stock = parseInt(document.getElementById('stock').value);
  const product = { title, description, price, thumbnail, code, stock };
  
  try {
    socket.emit('newProduct', product);
    productForm.reset();
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
  }
});





