const AWS = require('aws-sdk');
const Promise = require('bluebird');
const zlib = require('zlib');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = "AKIAJRLAKEEDV7NVNFVA";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-west-2";

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function compressString() {
    return new Promise( function( resolve, reject )
    {

    });
}

module.exports = {
    updateItem: function(socketID, allWords, positiveWords, negativeWords) {
        const params = {
            Item: {
                "socketID": {
                    S: socketID
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
            ReturnConsumedCapacity: "TOTAL",
            TableName: "WordsForAnalysis"
        };

        dynamodb.putItem(params, function(err, data) {
            if (err) console.log(err, err.stack);
        })
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
                    console.log(err, err.stack);
                    return reject(err)
                } else {
                    //console.log(data);
                    return resolve(data)
                }
            })
        });
    }
};


const input = 'he llo hi';
var buff;
zlib.deflate(input, (err, buffer) => {
    if (err) {
        console.log(err);
    } else {
        console.log(buffer);
        zlib.inflate(buffer, (err, buffer) => {
            if (err) {
                console.log(err);
            } else {
                console.log(buffer.toString());

            }
        });
    }
});

