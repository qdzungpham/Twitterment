

const AWS = require('aws-sdk');
AWS.config.update({
    region:'ap-southeast-2',
    aws_access_key_id: 'AKIAJRLAKEEDV7NVNFVA',
    aws_secret_access_key: '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'
});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    updateItem: function(socketID, allWords, positiveWords, negativeWords) {
        const params = {
            Item: {
                "socketID": {
                    S: socketID
                },
                "allWords": {
                    S: allWords.join(' ')
                }
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "WordsForAnalysis"
        };

        dynamodb.putItem(params, function(err, data) {
            if (err) console.log(err, err.stack);
        })
    }
};