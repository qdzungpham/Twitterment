const AWS = require('aws-sdk');
const Promise = require('bluebird');
const zlib = require('zlib');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJRLAKEEDV7NVNFVA";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-west-2";

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function compressString(string) {
    return new Promise(function (resolve, reject) {
        zlib.deflate(string, (err, buffer) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(buffer)
            }
        });
    })
}

function decompressString(buffer) {
    return new Promise(function (resolve, reject) {
        zlib.inflate(buffer, (err, buff) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(buff.toString())
            }
        });
    })
}

module.exports = {
    updateItem: function(socketID, allWords, positiveWords, negativeWords) {

        Promise.all([compressString(allWords.join(' ')), compressString(positiveWords.join(' ')), compressString(negativeWords.join(' '))]).then(function(buffer) {
            const params = {
                Item: {
                    "socketID": {
                        S: socketID
                    },
                    "allWords": {
                        B: buffer[0]
                    },
                    "positiveWords": {
                        B: buffer[1]
                    },
                    "negativeWords": {
                        B: buffer[2]
                    }
                },
                TableName: "WordsForAnalysis"
            };

            dynamodb.putItem(params, function(err) {
                if (err) console.log(err, err.stack);
            })

        }).catch(function (error) {
            console.error(error)
        });
    },

    getItem: function(socketID) {
        return new Promise( function( resolve, reject )
        {
            const params = {
                Key: {
                    "socketID": {
                        S: socketID
                    }
                },
                TableName: "WordsForAnalysis"
            };

            dynamodb.getItem(params, function(err, data) {
                if (err) {
                    console.error(err)
                } else {
                    if (!data.Item) return;
                    Promise.all([decompressString(data.Item.allWords.B), decompressString(data.Item.positiveWords.B), decompressString(data.Item.negativeWords.B)]).then(function(string) {
                        return resolve(string)
                    }).catch(function (error) {
                        return reject(error)
                    });
                }
            })
        });


    },

    deleteItem: function (socketID) {
        const params = {
            Key: {
                "socketID": {
                    S: socketID
                }
            },
            TableName: "WordsForAnalysis"
        };
        dynamodb.deleteItem(params, function(err, data) {
            if (err) console.error(err); // an error occurred
        });
    },

    saveSearch: function(keyWords, avgScore, allWords, positiveWords, negativeWords) {
        const params = {
            Item: {
                "keyWords": {
                    S: keyWords.replace(/\s/g, "")
                },
                "date": {
                    S: new Date().toISOString()
                },
                "avgScore": {
                    N: avgScore.toString()
                },
                "allWords": {
                    S: allWords.join(' ')
                },
                "positiveWords": {
                    S: positiveWords.join(' ')
                },
                "negativeWords": {
                    S: negativeWords.join(' ')
                }
            },
            TableName: "SearchHistory"
        };

        dynamodb.putItem(params, function(err) {
            if (err) console.log(err, err.stack);
        })
    },

    getPrevSearch: function(keyWords) {

        return new Promise( function( resolve, reject )
        {
            const params = {
                KeyConditionExpression: "keyWords = :keyWords",
                ExpressionAttributeValues: {
                    ":keyWords": {
                        S: keyWords.replace(/\s/g, "")
                    }
                },
                TableName: "SearchHistory"
            };

            dynamodb.query(params, function(err, data) {
                if (err) {
                    return reject(err)
                } else {
                    //console.log(data);
                    return resolve(data)
                }
            })
        });
    }


};
