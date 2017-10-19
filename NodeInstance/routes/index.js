const express = require('express');
const router = express.Router();
const zlib = require('zlib');
const Promise = require('bluebird');

const Twitter = require('./../services/TwitterService');
const DynamoDB = require('./../services/DynamoDBService');
const WordAnalysis = require('./../services/WordAnalysisService');
const RedisService = require('./../services/RedisService');

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
    /*
    DynamoDB.getItem(req.body.socketID).then(function (data) {
        //console.log(data);

        const topAllWords = WordAnalysis.analyseCount(data[0]);
        if (topAllWords !== null && topAllWords.length > 10) {
            topAllWords.length = 10;
        }

        const topPositiveWords = WordAnalysis.analyseCount(data[1]);
        if (topPositiveWords !== null && topPositiveWords.length > 10) {
            topPositiveWords.length = 10;
        }
        const topNegativeWords = WordAnalysis.analyseCount(data[2]);
        if (topNegativeWords !== null && topNegativeWords.length > 10) {
            topNegativeWords.length = 10;
        }

        res.json({topAllWords: topAllWords, topPositiveWords: topPositiveWords, topNegativeWords: topNegativeWords});

    }).catch(function (error) {
        console.error(error)
    });
    */

    Promise.all([RedisService.get(req.body.socketID, 'allWords'), RedisService.get(req.body.socketID, 'positiveWords'),
        RedisService.get(req.body.socketID, 'negativeWords')]).then(function (data) {

        const topAllWords = WordAnalysis.analyseCount(data[0]);
        if (topAllWords !== null && topAllWords.length > 10) {
            topAllWords.length = 10;
        }

        const topPositiveWords = WordAnalysis.analyseCount(data[1]);
        if (topPositiveWords !== null && topPositiveWords.length > 10) {
            topPositiveWords.length = 10;
        }
        const topNegativeWords = WordAnalysis.analyseCount(data[2]);
        if (topNegativeWords !== null && topNegativeWords.length > 10) {
            topNegativeWords.length = 10;
        }

        res.json({topAllWords: topAllWords, topPositiveWords: topPositiveWords, topNegativeWords: topNegativeWords});

    }).catch(function (error) {
        console.error(error)
    });


});

router.post('/trends', function(req, res, next) {
    DynamoDB.getPrevSearch(req.body.keyWords).then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.error(error)
    });
});



module.exports = router;
