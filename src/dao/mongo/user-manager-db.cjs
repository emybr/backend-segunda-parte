const { connect } = require('mongoose');
const Database = require('../../config/config.cjs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../../service/email.service.cjs');
const UserModels = require('./models/user.models.cjs');
const { createDocument, getDocument, getDocuments } = require('./factory/factoryMd.cjs');
const CartsManagerDb = require('./carts-manager.db.cjs');

class UserManagerDb {
    constructor() {
        this.db = new Database();
        this.createDocument = createDocument;
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

    async setPremiunRole(email) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ email });
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
                await this.db.connectToDatabase();
            }
            const user = await this.db.usersCollection.findOne({ _id: id });
            return user;
        } catch (error) {
            console.error(error);
            throw new Error(`Error al obtener el usuario por id: ${error.message}`);
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
        console.log(fileUrls, 'fileUrls');
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }
            await this.db.usersCollection.updateOne({ email }, { $set: { files: fileUrls } });
        } catch (error) {
            console.error(error);
        }
    }


    async setLastConnection(email) {
        try {
            if (!this.db.usersCollection) {
                await this.db.connectToDatabase();
            }

            const updatedUser = await this.db.usersCollection.findOneAndUpdate(
                { email },
                { $set: { lastConnection: new Date() } },
                { returnOriginal: false }
            );

            if (updatedUser.value) {
                console.log('El campo lastConnection ha sido actualizado correctamente');
            } else {
                console.log('No se pudo actualizar el campo lastConnection');
            }
        } catch (error) {
            console.error('Error al actualizar lastConnection:', error);
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

}

module.exports = UserManagerDb;