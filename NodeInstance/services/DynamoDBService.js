const AWS = require('aws-sdk');
const Promise = require('bluebird');
const WordAnalysis = require('./../services/WordAnalysisService');
const RedisService = require('./../services/RedisService');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJRLAKEEDV7NVNFVA";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-west-2";

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    saveSearch: function(socketID, keyWords, avgScore) {

        Promise.all([RedisService.get(socketID, 'allWords'), RedisService.get(socketID, 'positiveWords'),
            RedisService.get(socketID, 'negativeWords')]).then(function (data) {

            let topAllWordsString = '| ';
            const topAllWords = WordAnalysis.analyseCount(data[0]);
            if (topAllWords !== null) {
                if (topAllWords.length > 10) {
                    topAllWords.length = 10;
                }
                topAllWords.forEach(function (val) {
                    topAllWordsString += (val.word + ' | ');
                });
            }

            let topPositiveWordsString = '| ';
            const topPositiveWords = WordAnalysis.analyseCount(data[1]);
            if (topPositiveWords !== null) {
                if (topPositiveWords.length > 10) {
                    topPositiveWords.length = 10;
                }
                topPositiveWords.forEach(function (val) {
                    topPositiveWordsString += (val.word + ' | ');
                });
            }

            let topNegativeWordsString = '| ';
            const topNegativeWords = WordAnalysis.analyseCount(data[2]);
            if (topNegativeWords !== null) {
                if (topNegativeWords.length > 10) {
                    topNegativeWords.length = 10;
                }
                topNegativeWords.forEach(function (val) {
                    topNegativeWordsString += (val.word + ' | ');
                });
            }

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
                    "topAllWords": {
                        S: topAllWordsString
                    },
                    "topPositiveWords": {
                        S: topPositiveWordsString
                    },
                    "topNegativeWords": {
                        S: topNegativeWordsString
                    }
                },
                TableName: "SearchHistory"
            };

            dynamodb.putItem(params, function(err) {
                if (err) console.log(err, err.stack);
            })

        }).catch(function (error) {
            console.error(error)
        });
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
