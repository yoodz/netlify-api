const { connectToDatabase } = require('../utils/db')
const { SuccessResponse, ErrorResponse } = require('../utils/response')
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');


exports.handler = async (event, context) => {
  
    if (event.httpMethod === 'OPTIONS') {
        return SuccessResponse({
            body: JSON.stringify({ message: 'CORS preflight passed' })
        });
    }

    const userAgent = event.headers['user-agent'];
    const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || event.headers['remote-address'];

    const parser = new UAParser();
 
    try {
        const uaResult = parser.setUA(userAgent).getResult();

        let location;
        if (clientIp) {
        // 查询 IP 地址对应的地理位置信息
            location = geoip.lookup(clientIp);
        }

        const db = await connectToDatabase();
        const collection = db.collection("logs");
        const { city, timezone, country, ll, area } = location || {};
        collection.insertOne({
            ...event?.queryStringParameters,
            clientIp,
            uaResult,
            createdAt: Date.now(),
            city, // 完整的城市名称
            timezone, // 来自 IANA 时区数据库的时区
            country, // 2 个字母的 ISO-3166-1 国家代码
            ll, // 城市的经纬度
            area // 精度半径
        })

        return SuccessResponse({
            body: JSON.stringify({ }),
        });
    } catch (err) {
        console.log(err, 'logs-40')
        return ErrorResponse({
            body: JSON.stringify({ error: err.message }),
        });
    }
};