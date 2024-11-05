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

const deleteAllFromRedisDB = async () => {
    return new Promise((resolve, reject) => {
        redisClient.flushall((err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getKeysFromRedisDB = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.keys(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getAndSetHashData = async (key, hashKey, timeout, callBackFunction) => {
    return new Promise((resolve, reject) => {
        redisClient.hget(key, hashKey, async (err, data) => {
            if (err) {
                reject(err);
            }
            if (data == null) {
                resolve(JSON.parse(data));
                const freshData = await callBackFunction();
                if (freshData) {
                    await redisClient.hset(key, hashKey, JSON.stringify(freshData));
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
}

const setHashData = async (key, hashKey, data, timeout) => {
    return new Promise((resolve, reject) => {
        redisClient.hset(key, hashKey, JSON.stringify(data), (err, data) => {
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

const getHashData = async (key, hashKey) => {
    return new Promise((resolve, reject) => {
        redisClient.hget(key, hashKey, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
}

const getMultipleHashData = async (key, hashKeys) => {
    return new Promise((resolve, reject) => {
        redisClient.hmget(key, hashKeys, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const deleteHashData = async (key, hashKey) => {
    return new Promise((resolve, reject) => {
        redisClient.hdel(key, hashKey, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const deleteAllHashData = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.del(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashKeys = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.hkeys(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashValues = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.hvals(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashAll = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.hgetall(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashLength = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.hlen(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashExists = async (key, hashKey) => {
    return new Promise((resolve, reject) => {
        redisClient.hexists(key, hashKey, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashIncrement = async (key, hashKey, increment) => {
    return new Promise((resolve, reject) => {
        redisClient.hincrby(key, hashKey, increment, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getHashDecrement = async (key, hashKey, decrement) => {
    return new Promise((resolve, reject) => {
        redisClient.hincrby(key, hashKey, decrement, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const InsertSortedSet = async (key, score, value) => {
    return new Promise((resolve, reject) => {
        redisClient.zadd(key, score, value, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSet = async (key, start, stop) => {
    return new Promise((resolve, reject) => {
        redisClient.zrange(key, start, stop, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSetLength = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.zcard(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSetScore = async (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.zscore(key, value, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const deleteSortedSet = async (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.zrem(key, value, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const deleteAllSortedSet = async (key) => {
    return new Promise((resolve, reject) => {
        redisClient.del(key, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


const getHashDataWithLimit = async (key, limit) => {
    return new Promise((resolve, reject) => {
        redisClient.hscan(key, 0, 'COUNT', limit, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSetWithLimit = async (key, limit) => {
    return new Promise((resolve, reject) => {
        redisClient.zscan(key, 0, 'COUNT', limit, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSetWithLimitAndScore = async (key, limit, min, max) => {
    return new Promise((resolve, reject) => {
        redisClient.zscan(key, 0, 'COUNT', limit, 'MATCH', min, max, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const getSortedSetWithLimitAndScoreAndValue = async (key, limit, min, max, value) => {
    return new Promise((resolve, reject) => {
        redisClient.zscan(key, 0, 'COUNT', limit, 'MATCH', min, max, 'MATCH', value, (err, data) => {
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
    deleteFromRedisDB,
    deleteAllFromRedisDB,
    getKeysFromRedisDB,
    getAndSetHashData,
    setHashData,
    getHashData,
    getMultipleHashData,
    deleteHashData,
    deleteAllHashData,
    getHashKeys,
    getHashValues,
    getHashAll,
    getHashLength,
    getHashExists,
    getHashIncrement,
    getHashDecrement,
    InsertSortedSet,
    getSortedSet,
    getSortedSetLength,
    getSortedSetScore,
    deleteSortedSet,
    deleteAllSortedSet,
    getHashDataWithLimit,
    getSortedSetWithLimit,
    getSortedSetWithLimitAndScore,
    getSortedSetWithLimitAndScoreAndValue
};