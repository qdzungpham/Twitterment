var redis = require('redis');
const Promise = require('bluebird');

var redisClient = redis.createClient({host : 'ec2-35-167-174-90.us-west-2.compute.amazonaws.com', port : 6379});

redisClient.on('ready',function() {
    console.log("Redis is ready");
});
/*
redisClient.rpush(["languages","angularjs","nodejs","go"],function(err,reply) {
    console.log(err);
    console.log(reply);
});


redisClient.lrange('languages', 0, -1, function(err, data) {
    if (err) {
        console.error(err)
    }
    console.log(data);
});
*/
module.exports = {
    push: function (socketID, type, words) {
        if (words.length === 0) return;
        words.unshift(socketID + type);
        redisClient.rpush(words, function(err, reply) {
            if (err) {
                console.error(err)
            }
        });
    },

    get: function (socketID, type) {
        return new Promise(function (resolve, reject) {
            redisClient.lrange(socketID + type, 0, -1, function(err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            });
        })
    },

    delete: function (socketID, type) {
        redisClient.del(socketID + type,function(err,reply) {
            if(err) {
                console.error(err)
            }
        });
    }
};

