const { connect } = require('mongoose');
const Database = require('../../config/config.cjs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../../service/email.service.cjs');
const UserModels = require('./models/user.models.cjs');
const { createDocument, updateDocument, getDocument,getBasicUserData } = require('./factory/factoryMd.cjs');
const CartsManagerDb = require('./carts-manager.db.cjs');

class UserManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
        this.updateDocument = updateDocument;
        this.getDocument = getDocument;
        this.getBasicUserData = getBasicUserData;
        this.cartsCollection = new CartsManagerDb();

    }


    async createUser(nombre, apellido, edad, email, password, cartId) {
        const isAdmin = email === 'admin@example.com';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModels({
            nombre,
            apellido,
            edad,
            email,
            password: hashedPassword,
            role: isAdmin ? 'admin' : 'user',
            cartId
        });
        await this.createDocument('usersCollection', user);
    }




    async setAdminRole(email) {
        console.log(email);
        try {
            const user = await this.getDocument('usersCollection', { email });
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

    async setPremiumRole(email) {
        try {
            const user = await this.getDocument('usersCollection', { email });
            if (!user) {
                throw new Error('User not found');
            }
            user.role = 'premium';
            await this.db.usersCollection.replaceOne({ email }, user);
            return user;
        } catch (e) {
            console.error(e);
        }
    }

    async setUserRole(email) {
        try {
            const user = await this.getDocument('usersCollection', { email });
            if (!user) {
                throw new Error('User not found');
            }
            user.role = 'user';
            await this.db.usersCollection.replaceOne({ email }, user);
            return user;
        } catch (e) {
            console.error(e);
        }
    }



    //ver

    async validateUser(email, password) {
        try {
            const user = await this.getDocument('usersCollection', { email, password });
            return user !== null;
        } catch (e) {
            console.error(e);
        }
    }



    // agrego passport y passport-local


    async getUserByField(field, value) {
        try {
            const query = { [field]: value };
            const user = await this.getDocument('usersCollection', query);
            return user;
        } catch (error) {
            console.error(error);
            throw new Error(`Error al obtener el usuario por ${field}: ${error.message}`);
        }
    }


    async actualizarContraseña(email) {
        const token = crypto.randomBytes(20).toString('hex');
        const createdAt = Date.now();
        const expires = new Date(Date.now() + 60 + 60 + 1000); // 1 hour

        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }

            await this.db.passwordResetTokensCollection.insertOne({ email, token, createdAt, expires });

            // Envío de correo con el token
            const resetUrl = `http://localhost:8080/reset/${token}`;
            const subject = 'Link para resetear la contraseña';
            const text = `Para resetear la contraseña haga click en el siguiente link: ${resetUrl}`;

            await sendEmail(email, subject, text);
        } catch (error) {
            console.error(error);
        }
    }


    async updatePassword(email, newPassword) {
        console.log(newPassword, 'newPassword');
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10); // Generar el hash de la nueva contraseña sin utilizar un salt
            await this.db.usersCollection.updateOne({ email }, { $set: { password: hashedPassword } });
        } catch (error) {
            console.error(error);
        }
    }



    async getPasswordResetToken(token) {
        try {
            if (!this.db.passwordResetTokensCollection) {
                await this.db.connectToDatabase();
            }
            const passwordResetToken = await this.db.passwordResetTokensCollection.findOne({ token });
            return passwordResetToken;
        } catch (error) {
            console.error(error);
        }
    }


    async updateUserFiles(email, fileUrls) {
        try {
            const filter = { email }; // Filtro para buscar el usuario por su email
            const update = { files: fileUrls }; // Campo "files" y valor a actualizar

            await this.updateDocument('usersCollection', filter, update);
        } catch (error) {
            console.error(error);
            throw new Error('Error al actualizar los archivos del usuario');
        }
    }


    async setLastConnection(email) {
        try {
            const filter = { email }; // Filtro para buscar el usuario por su email
            const update = { lastConnection: new Date() }; // Campo "lastConnection" y valor a actualizar

            await this.updateDocument('usersCollection', filter, update);
            console.log('El campo lastConnection ha sido actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar lastConnection:', error);
            throw new Error('Error al actualizar lastConnection');
        }
    }





    async deleteInactiveUsers() {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }

            const inactiveUsers = await this.db.usersCollection.find({
                role: 'user',
                lastConnection: { $lt: new Date(Date.now() - 2 * 60 * 1000) }
            }).toArray();

            // Obtener solo los IDs de usuario de los usuarios inactivos
            const inactiveUserIds = inactiveUsers.map(user => user._id);
            const inactiveCartIds = inactiveUsers.map(user => user.cartId);
            console.log('Inactive User IDs:', inactiveUserIds);
            console.log('Inactive Cart IDs:', inactiveCartIds);
            if (inactiveCartIds.length > 0) {
                await this.db.cartsCollection.deleteMany({ _id: { $in: inactiveCartIds } });
            }

            if (inactiveUserIds.length > 0) {
                await this.db.usersCollection.deleteMany({ _id: { $in: inactiveUserIds } });
            }
            return { success: true, message: 'Usuarios inactivos eliminados correctamente' };
        } catch (error) {
            console.error('Error al eliminar usuarios inactivos:', error);
            throw new Error('Error al eliminar usuarios inactivos');
        }
    }
 
    async isAdminUser(email) {
        try {
            const user = await this.getDocument('usersCollection', { email });
            return user?.role === 'admin';
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async isPremiumUser(email) {
        try {
            const user = await this.getDocument('usersCollection', { email });
            return user?.role === 'premium';
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // agrego fucion para obtener todos los usuarios y sus datos nombre, correo y rol
   
    async  getUsersData() {
        try {
            const projection = { nombre: 1, email: 1, role: 1, apellido: 1 };
            const users = await this.getBasicUserData('usersCollection', {}, projection);
            return users;
        } catch (error) {
            console.error(error);
            throw new Error('Error al obtener los usuarios');
        }
    }

// agrego funcion para eliminar un usuario por email desde administrador

    async deleteUser(email) {
        try {
            const user = await this.getDocument('usersCollection', { email });
            if (!user) {
                throw new Error('User not found');
            }
            await this.db.usersCollection.deleteOne({ email });
            await this.db.cartsCollection.deleteOne({ _id: user.cartId });
            return user;
        } catch (e) {
            console.error(e);
        }
    }

}

module.exports = UserManagerDb;