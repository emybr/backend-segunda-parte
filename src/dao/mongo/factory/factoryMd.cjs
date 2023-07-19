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


async function updateDocument(collection, filter, update) {
    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
        }
        const result = await this.db[collection].updateOne(
            filter,
            { $set: update }
        );
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Error al actualizar el documento');
    }
}

async function delleDocument(collection, filter) {
    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
        }
        const result = await this.db[collection].deleteOne(filter);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Error al eliminar el documento');
    }
}


async function getDocument(collection, query) {

    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
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
            await this.db.connectToDatabase();
        }
        const documents = await this.db[collection].find(query).toArray();
        return documents;
    } catch (e) {
        console.error(e);
    }
}

async function getTotalDocuments(collection) {
    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
        }
        const totalDocuments = await this.db[collection].countDocuments();
        return totalDocuments;
    } catch (e) {
        console.error(e);
    }
}

async function getBasicUserData(collection, query, projection) {
    try {
        if (!this.db[collection]) {
            await this.db.connectToDatabase();
        }
        const documents = await this.db[collection].find(query).project(projection).toArray();
        return documents;
    } catch (e) {
        console.error(e);
    }
}

module.exports = { createDocument, updateDocument, delleDocument, getDocument, getDocuments,getTotalDocuments, getBasicUserData }

