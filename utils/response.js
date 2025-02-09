const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  // 允许的 HTTP 方法
    'Access-Control-Allow-Headers': 'Content-Type',        // 允许的请求头
    'Content-Type': 'application/json'
}

function SuccessResponse(data) {
    return {
        statusCode: 200,
        headers,
        ...data,
    }
}


function ErrorResponse(data) {
    return {
        statusCode: 500,
        headers,
        ...data,
    }
}
module.exports = {
    SuccessResponse,
    ErrorResponse
}