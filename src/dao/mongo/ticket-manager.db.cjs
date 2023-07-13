const Ticket = require('./Models/TicketManagerDb.cjs');
const Database = require('../../config/config.cjs');
const { v4: uuidv4 } = require('uuid');
const {createDocument} = require ('./factory/factoryMd.cjs')


class TicketManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
    }


async createTicket(amount, purchaser, email) {
    const ticket = new Ticket({
        code: uuidv4(),
        amount,
        purchaser,
        purchase_datetime: new Date(),
        email,
    });
    await this.createDocument('ordersCollection', ticket);
}


}



module.exports = TicketManagerDb;
