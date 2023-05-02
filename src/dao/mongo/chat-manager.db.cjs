const Database = require('../../config/config.cjs');



class ChatManagerDB {
    constructor() {
        this.db = new Database();
    }

    async insertMessage(message, username) {
        try {
            if (!this.db.messagesCollection) {
                await this.db.connectToDatabase();
            }
            const result = await this.db.messagesCollection.insertOne({ message, username });
            return result;
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = ChatManagerDB;