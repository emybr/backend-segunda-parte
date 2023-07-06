const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const UserManagerDb = require("../dao/mongo/user-manager-db.cjs");
const userManagerDb = new UserManagerDb();
const userModels = require("../dao/mongo/Models/user.models.cjs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/doc');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
    }
});

const upload = multer({ storage: storage });

module.exports = { upload };



