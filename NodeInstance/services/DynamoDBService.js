const AWS = require('aws-sdk');
const Promise = require('bluebird');
const WordAnalysis = require('./../services/WordAnalysisService');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJRLAKEEDV7NVNFVA";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-west-2";

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    saveSearch: function(keyWords, avgScore, allWords, positiveWords, negativeWords) {


        const topAllWords = WordAnalysis.analyseCount(allWords);
        if (topAllWords !== null && topAllWords.length > 10) {
            topAllWords.length = 10;
        }
        let topAllWordsString = '| ';
        topAllWords.forEach(function (val) {
            if (val.word === '>>') return;
            topAllWordsString += (val.word + ' | ');
        });

        const topPositiveWords = WordAnalysis.analyseCount(positiveWords);
        if (topPositiveWords !== null && topPositiveWords.length > 10) {
            topPositiveWords.length = 10;
        }
        let topPositiveWordsString = '| ';
        topPositiveWords.forEach(function (val) {
            if (val.word === '>>') return;
            topPositiveWordsString += (val.word + ' | ');
        });

        const topNegativeWords = WordAnalysis.analyseCount(negativeWords);
        if (topNegativeWords !== null && topNegativeWords.length > 10) {
            topNegativeWords.length = 10;
        }
        let topNegativeWordsString = '| ';
        topNegativeWords.forEach(function (val) {
            if (val.word === '>>') return;
            topNegativeWordsString += (val.word + ' | ');
        });

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
