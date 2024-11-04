const redis = require('./redis-connect');

const getDataWithRedisLock = async (key, timeout ,callBackFunction) => {

  return new Promise((resolve, reject) => {

      redis.redisClient.set(`lock_${key}_lock`, 'locked', 'NX', 'EX', 10, (error, result) => {
        if (result === 'OK') {
          
            redisClient.get(key, async (err, data) => {
              if (err) {
                  reject(err);
              }
              if (data == null) {
                  resolve(JSON.parse(data));
                  const freshData = await callBackFunction();
                  if(freshData){
                      await redisClient.set(key, JSON.stringify(freshData));
                      if(timeout){
                          await redisClient.expire(key, timeout);
                      }
                  }
                  redis.redisClient.del(`lock_${key}_lock`, (error, result) => {
                    if (result === 'OK') console.log('Lock released for ->',`lock_${key}_lock`);
                    else console.log('Lock not released for ->',`lock_${key}_lock`);
                  });
                  
                  resolve(freshData);
              }else{
                  return resolve(JSON.parse(data));
              }
            });

        } else {
          error.message = "Resource is locked.";
          error.statusCode = 204;
          reject(error);
        }
      });
  });
};


module.exports ={
    getDataWithRedisLock
}