const redis = require('redis');





let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: ' reconnecting',
    ERROR: 'error'
}

const REDIS_CONNECT_TIMEOUT = 10000, REDIS_CONNECT_MESSAGE = {
    code: -99,
    massage: {
        vn: 'Redis bi loi',
        en: 'Server connection error'
    }
}

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new RedisErrorResponse({
            message: REDIS_CONNECT_MESSAGE.message.vn,
            statusCode: REDIS_CONNECT_MESSAGE.code
        })
    }, REDIS_CONNECT_TIMEOUT);
}

const handleEventConnection = ({
    connectionRedis
}) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`connectionRedis - Connection status: connected`);
        clearTimeout(connectionTimeout);
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionRedis - Connection status: disconnected`);
        //coneect retry
        handleTimeoutError();
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionRedis - Connection status: reconnected`);
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionRedis - Connection status: error`);
        handleTimeoutError();
    })
}

const initRedis = () => {

    const instanceRedis = redis.createClien()
    client.instanceConnect = instanceRedis
    handleEventConnection({
        connectionRedis: instanceRedis
    })
}

const getRedis = () => client

const closeRedis = () => {

}

module.exports =
{
    initRedis,
    getRedis,
    closeRedis
}