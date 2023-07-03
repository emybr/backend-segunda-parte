const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = (app) => {
    const store = MongoStore.create({
        mongoUrl: 'mongodb+srv://emybr82ar:92713@cluster0.apsr9qa.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 60 * 60 * 24 * 7 // 1 week
    });

    app.use(session({
        secret: 'secreto',
        resave: false,
        saveUninitialized: false,
        store: store
    }));
};

module.exports = sessionConfig;