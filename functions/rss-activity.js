/**
 * 文章访问统计
 */
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    const { id } = event.queryStringParameters;
    // 限制页大小


    try {
        const db = await connectToDatabase('blog-news');
        const collection = db.collection("article");

        const result = await collection.updateOne(
            { _id: ObjectId.createFromHexString(id) }, // 查询条件
            { $inc: { pv: 1 } }
        );

        return SuccessResponse({
            body: null
        });
    } catch (error) {
        console.log(error, 'rss-activity-32')
        return ErrorResponse({
            body: JSON.stringify({ error: 'Unable to fetch data' }),
        });
    }
};
