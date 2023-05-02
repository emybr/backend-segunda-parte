const Database = require('../../config/config.cjs');


class UserManagerDb {
    constructor() {
        this.db = new Database();
    }

    async createUser(nombre, apellido, edad, email, password, cartId) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const isAdmin = email === 'admin@example.com';
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.db.usersCollection.insertOne({ nombre, apellido, edad, email, password: hashedPassword, role: isAdmin ? 'admin' : 'user', cartId });
        }
        catch (e) {
            console.error(e);
        }
    }

    async setAdminRole(email) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            user.role = 'admin';
            await this.db.usersCollection.replaceOne({ email }, user);
            return user;
        } catch (e) {
            console.error(e);
        }
    }




    async validateUser(email, password) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ email, password });
            return user !== null;
        } catch (e) {
            console.error(e);
        }
    }


    // agrego passport y passport-local


    async getUserByEmail(email) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ email });
            return user;
        } catch (error) {
            console.error(error);
            throw new Error(`Error al obtener el usuario por correo electrónico: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            if (!this.db.usersCollection) {
                await this.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ _id: id });
            return user;
        } catch (error) {
            console.error(error);
            throw new Error(`Error al obtener el usuario por id: ${error.message}`);
        }
    }


}

module.exports = UserManagerDb;