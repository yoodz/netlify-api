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

    // 解析文章 slug
    const { app } = event.queryStringParameters;

    if (!app) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing app parameter" }),
        };
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection("activeApp");

        // 更新访问量
        await collection.updateOne(
            { app },
            {
                $set: { updateAt: dayjs().second() }, // 更新操作：设置 age 字段为 30
                $setOnInsert: { createdAt: dayjs().second() } // 仅在插入时设置的字段
            }, // 增加访问量
            { upsert: true }        // 如果不存在则创建
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ app }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};