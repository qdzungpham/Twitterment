const AWS = require('aws-sdk');
const Promise = require('bluebird');
const zlib = require('zlib');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJRLAKEEDV7NVNFVA";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-west-2";

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


module.exports = {
    updateItem: function(socketID, allWords, positiveWords, negativeWords) {
        zlib.deflate(allWords.join(' '), (err, buffer) => {
            if (err) {
                console.log(err);
            } else {
                const params = {
                    Item: {
                        "socketID": {
                            S: socketID
                        },
                        "allWords": {
                            B: buffer
                        },
                        "positiveWords": {
                            S: positiveWords.join(' ')
                        },
                        "negativeWords": {
                            S: negativeWords.join(' ')
                        }
                    },
                    TableName: "WordsForAnalysis"
                };

                dynamodb.putItem(params, function(err) {
                    if (err) console.log(err, err.stack);
                })
            }
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
                    return reject(err)
                } else {
                    //console.log(data);
                    return resolve(data)
                }
            })
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

