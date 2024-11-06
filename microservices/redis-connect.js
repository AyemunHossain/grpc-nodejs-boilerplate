const redis = require("redis");
const config = require("config");

let redisClient = redis.createClient(
    config.get(`redis.port`),
    config.get(`redis.host`)
);


async function connectRedis() {
    await redisClient.connect();
    console.log('Connected to Redis');
}

connectRedis().catch(console.error);


redisClient.on("error", function (error) { console.error(error) });
// redisClient.on("ready", () => console.log(`Redis client is ready`));
redisClient.on("end", () => console.log(`Redis client has closed.`));
redisClient.on("reconnecting", (o) => {
    console.log(`Redis client is reconnecting.`);
    console.log(`Attempt number ${o}.`);
    console.log(`Milliseconds since last attempt: ${o}.`);
});
redisClient.on("connect", () => {
    console.log('Redis client connected');
})

redisClient.on("warning", (o) => {
    console.log(`Redis client warning.`);
    console.log(`Attempt number ${o}.`);
    console.log(`Milliseconds since last attempt: ${o}.`);
});

const getOrSetOnRedisDB = async (key, timeout, callBackFunction) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (err, data) => {
            if (err) {
                reject(err);
            }
            if (data == null) {
                resolve(JSON.parse(data));
                const freshData = await callBackFunction();
                if (freshData) {
                    await redisClient.set(key, JSON.stringify(freshData));
                    if (timeout) {
                        await redisClient.expire(key, timeout);
                    }
                }
                resolve(freshData);
            } else {
                return resolve(JSON.parse(data));
            }

        });
    });
};

const setOnRedisDB = async (key, data, timeout) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, JSON.stringify(data), (err, data) => {
            if (err) {
                reject(err);
            }
            if (timeout) {
                redisClient.expire(key, timeout);
            }
            resolve(data);
        });
    });
}

const getFromRedisDB = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
}

const deleteFromRedisDB = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.del(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}



module.exports = {
    getOrSetOnRedisDB,
    redisClient,
    setOnRedisDB,
    getFromRedisDB,
    deleteFromRedisDB
}