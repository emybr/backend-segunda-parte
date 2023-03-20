
const { MongoClient } = require('mongodb');

// const db = new Database()

class Database {
  constructor() {
    this.uri = "mongodb+srv://emybr82ar:92713@cluster0.apsr9qa.mongodb.net/?retryWrites=true&w=majority";
    this.client = new MongoClient(this.uri);
  }

  async connectToDatabase() {
    try {
      // await this.client.connectToDatabase();
      await this.client.connect();
      console.log("Conectado correctamente a la base de datos mongo");
      this.database = this.client.db("products").collection("products");
    } catch (e) {
      console.error(e);
    }
  }

  async disconnect() {
    await this.client.close();
  }


  async getAllProducts() {
  try {
    if (!this.database) {
      await this.connectToDatabase();
    }
    const result = await this.database.find({}).toArray();
    return result;
  } catch (e) {
    console.error(e);
  }
}

async createProduct(name, price) {
  try {
    if (!this.database) {
      await this.connectToDatabase();
    }
    const result = await this.database.insertOne({ name, price });
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
}


module.exports = Database;