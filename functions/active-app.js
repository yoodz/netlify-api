const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    // 解析文章 slug
    const { app } = event.queryStringParameters;

    if (!app) {
        return ErrorResponse({
            statusCode: 400,
            body: JSON.stringify({ error: "Missing app parameter" }),
        });
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection("activeApp");

        // 更新访问量
        await collection.updateOne(
            { app },
            {
                $set: { updateAt: Date.now() }, // 更新操作：设置 age 字段为 30
                $setOnInsert: { createdAt: Date.now() } // 仅在插入时设置的字段
            }, // 增加访问量
            { upsert: true }        // 如果不存在则创建
        );

        return SuccessResponse({
            body: JSON.stringify({ app }),
        });
    } catch (err) {
        return ErrorResponse({
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        });
    }
};