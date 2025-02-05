const { MongoClient } = require("mongodb");
const dayjs = require('dayjs')

// MongoDB 连接字符串
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
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  // 允许的 HTTP 方法
    'Access-Control-Allow-Headers': 'Content-Type',        // 允许的请求头
    'Content-Type': 'application/json'
}

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight passed' })
        };
    }

    const fiveMinutesAgo = dayjs().subtract(5, 'minute');

    // 获取时间戳（毫秒）
    const timestamp = fiveMinutesAgo.valueOf();
    try {
        const db = await connectToDatabase();
        const collection = db.collection("activeApp");
        const cursor = collection.find({
            updateAt: { $gte: timestamp } // 5 分钟之内
          }).sort({ updateAt: -1 }); // 按时间倒序排列;
        const resultCountList = await cursor.toArray();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ resultCountList: resultCountList.map(item => item.app) }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};