const { MongoClient } = require('mongodb');
const Database = require('../../../config/config.cjs')



this.db = new Database();

async function createDocument(collection, document) {
    console.log(collection, document);
    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
        }
        await this.db[collection].insertOne(document);
    } catch (e) {
        console.error(e);
    }
}

async function getDocument(collection, query) {

    try {
        if (!this.db[collection]) {
            await this.connectToDatabase();
        }
        const document = await this.db[collection].findOne(query);
        return document;
    } catch (e) {
        console.error(e);
    }
}

async function getDocuments(collection, query) {
    try {
        if (!this.db[collection]) {
            await this.connectToDatabase();
        }
        const documents = await this.db[collection].find(query).toArray();
        return documents;
    } catch (e) {
        console.error(e);
    }
}

module.exports = { createDocument, getDocument, getDocuments }

