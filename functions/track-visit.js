const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    // 解析文章 slug
    const { slug } = event.queryStringParameters;

    if (!slug) {
        return ErrorResponse({
            statusCode: 400,
            body: JSON.stringify({ error: "Missing slug parameter" }),
        });
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection("visits");

        // 更新访问量
        await collection.updateOne(
            { slug },
            { $inc: { count: 1 } }, // 增加访问量
            { upsert: true }        // 如果不存在则创建
        );
        let resultCount;
        const formattedObject = {};

        if (slug === '/') {
            const cursor = collection.find({});
            const resultCountList = await cursor.toArray();

            resultCountList.forEach(item => {
                formattedObject[item.slug] = item.count;
            });
            // 打印查询结果
        } else {
            resultCount = await collection.findOne({ slug });
        }

        return SuccessResponse({
            statusCode: 200,
            headers,
            body: JSON.stringify({ slug, count: resultCount ? resultCount.count : 0, formattedObject }),
        });
    } catch (err) {
        return ErrorResponse({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        });
    }
};