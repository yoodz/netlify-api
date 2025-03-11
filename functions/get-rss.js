/**
 * 获取所有的rss 文章的列表
 */
const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    const { page, page_size } = event.queryStringParameters;
    const currentPage = parseInt(page, 10) || 1;
    const pageSize = parseInt(page_size, 10) || 10;

    try {
        const db = await connectToDatabase('blog-news');
        const collection = db.collection("article");
        const configCollection = db.collection("config");

        const cursor = collection.find({})
            .sort({ pubDate: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

        const results = await cursor.toArray();
        const totalCount = await collection.countDocuments({}); // 或者使用 estimatedDocumentCount() 根据需求选择

        // 获取config配置
        const configCursor = configCollection.find({})
        const configResults = await configCursor.toArray();

        return SuccessResponse({
            body: JSON.stringify({ results, total: totalCount, page, pageSize, config: configResults?.[0] }),
        });
    } catch (error) {
        return ErrorResponse({
            body: JSON.stringify({ error: 'Unable to fetch data' }),
        });
    }
};