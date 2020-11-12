export const headers = {
    'Access-Control-Allow-Origin': '*',
}

export const internalError = {
    statusCode: 500,
    headers,
    body: 'Internal Server Error'
}
