const dayjs = require('dayjs')
const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    const fiveMinutesAgo = dayjs().subtract(10, 'minute');

    // 获取时间戳（毫秒）
    const timestamp = fiveMinutesAgo.valueOf();
    try {
        const db = await connectToDatabase();
        const collection = db.collection("activeApp");
        const cursor = collection.find({
            updateAt: { $gte: timestamp } // 10 分钟之内
          }).sort({ updateAt: -1 }); // 按时间倒序排列;
        const resultCountList = await cursor.toArray();

        // 如果10min 内只有一个活动的 app 可能是空闲锁屏状态，不展示
        // if (resultCountList.length < 2) {
        //     resultCountList = []
        // }

        return SuccessResponse({
            body: JSON.stringify({ resultCountList: resultCountList.map(item => item.app) }),
        });
    } catch (err) {
        return ErrorResponse({
            body: JSON.stringify({ error: err.message }),
        });
    }
};