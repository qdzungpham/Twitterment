var express = require('express');
var router = express.Router();

const Twitter = require('./../services/TwitterService');
const DynamoDB = require('./../services/DynamoDBService');
const WordAnalysis = require('./../services/WordAnalysisService');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Twitter Streaming' });
});

router.post('/trends', function(req, res, next) {
    Twitter.getTrends(req.body.WOEID).then(function(data) {
        //console.log(data);
        res.json(data);
    }).catch(function(error) {
        console.error(error);
    });
});

router.post('/wordsAnalysis', function(req, res, next) {
    DynamoDB.getItem(req.body.socketID).then(function (data) {
        //console.log(data);
        const topAllWords = WordAnalysis.analyseCount(data.Item.allWords.S);
        if (topAllWords !== null && topAllWords.length > 10) {
            topAllWords.length = 10;
        }
        const topPositiveWords = WordAnalysis.analyseCount(data.Item.positiveWords.S);
        if (topPositiveWords !== null && topPositiveWords.length > 10) {
            topPositiveWords.length = 10;
        }
        const topNegativeWords = WordAnalysis.analyseCount(data.Item.negativeWords.S);
        if (topNegativeWords !== null && topNegativeWords.length > 10) {
            topNegativeWords.length = 10;
        }
        res.json({topAllWords: topAllWords, topPositiveWords: topPositiveWords, topNegativeWords: topNegativeWords});
    }).catch(function (error) {
        console.error(error)
    });

    //const data = DynamoDB.getItem(req.body.socketID);
    //const topAllWords = WordAnalysis.analyseCount(data.Item.allWords);
    //const topPositiveWords = WordAnalysis.analyseCount(data.Item.positiveWords);
    //const topNegativeWords = WordAnalysis.analyseCount(data.Item.negativeWords);

    //res.json({topAllWords: topAllWords, topPositiveWords: topPositiveWords, topNegativeWords: topNegativeWords});
});



/*
Twitter.getTrends(1).then(function(data) {
    console.log(data);
}).catch(function(error) {
    console.error(error);
});
*/
module.exports = router;
