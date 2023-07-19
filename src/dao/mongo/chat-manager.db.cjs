const Database = require('../../config/config.cjs');
const { createDocument } = require('./factory/factoryMd.cjs');



class ChatManagerDB {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;

    }

async insertMessage(message, username) {
    try {
        const document = { message, username };
        await this.createDocument('messagesCollection', document);
    } catch (e) {
        console.error(e);
    }
}
}

module.exports = ChatManagerDB;