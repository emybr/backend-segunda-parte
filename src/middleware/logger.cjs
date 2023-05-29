const winston = require('winston');

const winstonLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
        }),
        new winston.transports.File({
            level: 'warn',
            filename: 'errors.log'
        })
    ]
});

module.exports = {
    winstonLogger: winstonLogger
};