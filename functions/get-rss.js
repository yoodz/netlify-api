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
    // 限制页大小
    const pageSize = Math.min(parseInt(page_size, 10) || 20, 20);
    

    try {
        const db = await connectToDatabase('blog-news');
        const collection = db.collection("article");

        const cursor = collection.find({})
            .sort({ pubDate: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

        const results = await cursor.toArray();
        const totalCount = await collection.countDocuments({}); // 或者使用 estimatedDocumentCount() 根据需求选择


        let config = []
        let totalRss = 0
        // 只在首页获取的数据
        if (page === 1) {
            // 获取config配置
            const configCollection = db.collection("config");
            const configCursor = configCollection.find({})
            config = await configCursor.toArray();

            const rssCollection = db.collection("rss-url");
            totalRss = await rssCollection.countDocuments({});
            // 拿总的收录数据，成功的收录数据
        }

        return SuccessResponse({
            body: JSON.stringify({ results, total: totalCount, page, pageSize, config: configResults?.[0], totalRss }),
        });
    } catch (error) {
        console.log(error, 'get-rss-51')
        return ErrorResponse({
            body: JSON.stringify({ error: 'Unable to fetch data' }),
        });
    }
};
