const Ticket = require('./Models/TicketManagerDb.cjs');
const Database = require('../../config/config.cjs');
const { v4: uuidv4 } = require('uuid');


class TicketManagerDb {
    constructor() {
        this.db = new Database();
    }

    async createTicket(amount, purchaser, email) {
        try {
            if (!this.db.ordersCollection) {
                await this.db.connectToDatabase();
            }
            const ticket = new Ticket({
                code: uuidv4(),
                amount,
                purchaser,
                purchase_datetime: new Date(),
                email,
            });
            const result = await this.db.ordersCollection.insertOne(ticket);
            return result;
        } catch (e) {
            console.error(e);
        }
    }





    // agreggo nue metodo para obtener todos los tickets

    async createOrderItem(orderItem) {
        try {
            if (!this.db.database) {
                await this.db.connectToDatabase();
            }
            const result = await this.db.database.insertOne(orderItem);
            return result;
        } catch (e) {
            console.error(e);
        }
    }

}



module.exports = TicketManagerDb;
