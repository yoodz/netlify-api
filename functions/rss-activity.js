/**
 * 文章访问统计
 */
const { MongoClient } = require("mongodb");
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
            { _id: new MongoClient.ObjectId(id) }, // 查询条件
            { $inc: { [pv]: 1 } }
        );

        return SuccessResponse({
            body: null
        });
    } catch (error) {
        return ErrorResponse({
            body: JSON.stringify({ error: 'Unable to fetch data' }),
        });
    }
};
