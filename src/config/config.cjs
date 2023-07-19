require('dotenv').config();
const { MongoClient } = require('mongodb');
const { winstonLogger } = require('../middleware/logger.cjs');
require('dotenv').config();

class Database {
    constructor() {
        this.uri = "mongodb+srv://emybr82ar:92713@cluster0.apsr9qa.mongodb.net/?retryWrites=true&w=majority"
        // this.uri = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_URI : process.env.PRODUCTION_DB_URI;
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
            this.ordersCollection = this.client.db("ticket").collection("tickets");
            this.passwordResetTokensCollection = this.client.db("passwordResetTokens").collection("passwordResetTokens");
        } catch (e) {
            // console.error(e);
            winstonLogger.error('Error al conectar a la base de datos');
        }
    }
    
    async disconnect() {
        await this.client.close();
    }
}




module.exports = Database;
