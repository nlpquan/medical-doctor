const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise;

const dbConfig = require("../config/db.config.js");

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.doctors = require("./doctor.model.js")(mongoose, mongoosePaginate);

db.user = require("./user.model"); 
db.role = require("./role.model"); 
db.refreshToken = require("./refreshToken.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
