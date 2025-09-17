"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.getMongoClient = void 0;
const mongodb_1 = require("mongodb");
let mongoClient = null;
let cachedDb = null;
const getMongoClient = async () => {
    if (mongoClient)
        return mongoClient;
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/simplon_form';
    mongoClient = new mongodb_1.MongoClient(uri);
    await mongoClient.connect();
    return mongoClient;
};
exports.getMongoClient = getMongoClient;
const getDb = async () => {
    if (cachedDb)
        return cachedDb;
    const client = await (0, exports.getMongoClient)();
    cachedDb = client.db();
    return cachedDb;
};
exports.getDb = getDb;
