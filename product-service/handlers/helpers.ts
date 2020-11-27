export const headers = {
    'Access-Control-Allow-Origin': '*',
}

export const internalError = {
    statusCode: 500,
    headers,
    body: 'Internal Server Error'
}

export const isValid = ({title, price, count}) => {
    return !(!title || !price || price < 0 || count < 0);
}
