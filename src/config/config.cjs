const { MongoClient } = require('mongodb');

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
}

module.exports = Database;

