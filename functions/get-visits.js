const { MongoClient } = require("mongodb");

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

exports.handler = async (event, context) => {
    // 解析文章 slug
    const { slug } = event.queryStringParameters;

    if (!slug) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing slug parameter" }),
        };
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection("visits");

        // 查询访问量
        const result = await collection.findOne({ slug });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  // 允许的 HTTP 方法
                'Access-Control-Allow-Headers': 'Content-Type',        // 允许的请求头
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug, count: result ? result.count : 0 }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};