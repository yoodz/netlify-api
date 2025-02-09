const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
// 缓存数据库连接
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    // 连接 MongoDB
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 10 });
    await client.connect();

    // 选择数据库
    cachedDb = client.db("test"); // 替换为你的数据库名
    return cachedDb;
}

module.exports = {
    connectToDatabase
}