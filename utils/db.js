const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
// 缓存数据库连接
let cachedDb = null;

async function connectToDatabase(dbName = 'test') {
    try {

        if (cachedDb) return cachedDb;

        // 连接 MongoDB
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 10 });
        await client.connect();

        // 选择数据库
        cachedDb = client.db(dbName); // 替换为你的数据库名
        return cachedDb;
    } catch (error) {
        console.log(error, 'db-19')
        return null
    }
}

module.exports = {
    connectToDatabase
}