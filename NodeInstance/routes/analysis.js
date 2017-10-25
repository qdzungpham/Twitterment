var express = require('express');
var router = express.Router();
const WordAnalysis = require('./../services/WordAnalysisService');
const RedisService = require('./../services/RedisService');

/* GET users listing. */
router.post('/', function(req, res, next) {
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

module.exports = router;
