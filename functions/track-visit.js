const { MongoClient } = require("mongodb");

// MongoDB 连接字符串
const uri = process.env.MONGODB_URI;

// 缓存数据库连接
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  // 连接 MongoDB
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  // 选择数据库
  const db = client.db("article_stats"); // 替换为你的数据库名
  cachedDb = db;
  return db;
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

    // 更新访问量
    const result = await collection.updateOne(
      { slug },
      { $inc: { count: 1 } }, // 增加访问量
      { upsert: true }        // 如果不存在则创建
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ slug, count: result.modifiedCount }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};