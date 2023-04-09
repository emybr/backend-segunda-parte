const { MongoClient } = require('mongodb');
const { get } = require('./routes.cjs');
const bcrypt = require('bcrypt');



class Database {
  constructor() {
    this.uri = "mongodb+srv://emybr82ar:92713@cluster0.apsr9qa.mongodb.net/?retryWrites=true&w=majority";
    this.client = new MongoClient(this.uri);
  }

  async connectToDatabase() {
    try {
      await this.client.connect();
      console.log("Conectado correctamente a la base de datos mongo");
      this.database = this.client.db("products").collection("products");
      this.messagesCollection = this.client.db("messages").collection("messages");
      this.cartsCollection = this.client.db("carts").collection("carts");
      this.usersCollection = this.client.db("users").collection("users");
    } catch (e) {
      console.error(e);
    }
  }

  async disconnect() {
    await this.client.close();
  }
 
  async getProducts(limit = 10, page = 1, sort, query) {
    const skip = (page - 1) * limit;
    const filter = query ? { $text: { $search: query } } : {};
    const sortOption = sort ? { [sort]: 1 } : {};
  
    try {
      if (!this.database) {
        await this.connectToDatabase();
      }

      const products = await this.database
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .toArray();
  
      return products;
    } catch (e) {
      console.error(e);
    }
  }


  async getCartsById(id) {
    try {
      if (!this.cartsCollection) {
        await this.connectToDatabase();
      }
      const cart = await this.cartsCollection.findOne({ _id: id });
      return cart;
    } catch (e) {
      console.error(e);
    }
  }


  async createProduct(id,title, description, price, thumbnail, code, stock) {
    try {
      if (!this.database) {
        await this.connectToDatabase();
      }
      const result = await this.database.insertOne({id, title, description, price, thumbnail, code, stock });
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async updateProduct(id, name, price) {
    try {
      if (!this.database) {
        await this.connectToDatabase();
      }
      const result = await this.database.updateOne(
        { _id: id },
        { $set: { name: name, price: price } }
      );
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async deleteProduct(id) {
    try {
      if (!this.database) {
        await this.connectToDatabase();
      }
      const result = await this.database.deleteOne({ _id: id });
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async insertMessage(message, username) {
    try {
      if (!this.messagesCollection) {
        await this.connectToDatabase();
      }
      const result = await this.messagesCollection.insertOne({ message, username });
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async addCart() {
    try {
      if (!this.cartsCollection) {
        await this.connectToDatabase();
      }
      const result = await this.cartsCollection.insertOne({ products: [] });
      return result;
    } catch (e) {
      console.error(e);
    }
  }


  
  async addProductToCart(cartId, product) {
    console.log(product);
    try {
      if (!this.cartsCollection) {
        await this.connectToDatabase();
      }
      const cart = await this.cartsCollection.findOne({ _id: cartId });
      if (cart) {
        const existingProduct = cart.products.find(p => p.id === product.id);
        if (existingProduct) {
          existingProduct.quantity++;
        } else {
          product.quantity = 1;
          const cartProduct = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail: product.thumbnail,
            code: product.code,
            stock: product.stock,
            quantity: 1
          };
          cart.products.push(cartProduct);
        }
        await this.cartsCollection.updateOne({ _id: cartId }, { $set: { products: cart.products } });
        console.log("Producto agregado al carrito");
      } else {
        await this.cartsCollection.insertOne({
          _id: cartId,
          timestamp: new Date(),
          products: [{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail: product.thumbnail,
            code: product.code,
            stock: product.stock,
            quantity: 1
          }]
        });
        console.log("Carrito creado y producto agregado");
      }
    } catch (e) {
      console.error(e);
    }
  }
  

  async getTotalProducts() {
    try {
      if (!this.database) {
        await this.connectToDatabase();
      }
      const totalProducts = await this.database.countDocuments();
      return totalProducts;
    } catch (e) {
      console.error(e);
    }
  }
  
  
  async getTotalCarts() {
    try {
      if (!this.cartsCollection) {
        await this.connectToDatabase();
      }
      const totalCarts = await this.cartsCollection.countDocuments();
      return totalCarts;
    } catch (e) {
      console.error(e);
    }
  }

  //estratejia de autenticacion

  async createUser(nombre, apellido, edad, email, password) {
    try {
      if (!this.usersCollection) {
        await this.connectToDatabase();
      }
      const isAdmin = email === 'admin@example.com';
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.usersCollection.insertOne({ nombre, apellido, edad, email, password: hashedPassword, role: isAdmin ? 'admin' : 'user' });
    }
    catch (e) {
      console.error(e);
    }
  }

  async setAdminRole(email) {
    try {
      if (!this.usersCollection) {
        await this.connectToDatabase();
      }
      const user = await this.usersCollection.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      user.role = 'admin';
      await this.usersCollection.replaceOne({ email }, user);
      return user;
    } catch (e) {
      console.error(e);
    }
  }
  



  async validateUser(email, password) {
    try {
      if (!this.usersCollection) {
        await this.connectToDatabase();
      }
      const user = await this.usersCollection.findOne({ email, password });
      return user !== null;
    } catch (e) {
      console.error(e);
    }
  }


// agrego passport y passport-local


async getUserByEmail(email) {
  try {
    if (!this.usersCollection) {
      await this.connectToDatabase();
    }
    const user = await this.usersCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error(`Error al obtener el usuario por correo electrónico: ${error.message}`);
  }
}

async getUserById(id) {
  try {
    if (!this.usersCollection) {
      await this.connectToDatabase();
    }
    const user = await this.usersCollection.findOne({ _id: id });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error(`Error al obtener el usuario por id: ${error.message}`);
  }
}

}



module.exports = Database;
