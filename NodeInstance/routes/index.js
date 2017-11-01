const express = require('express');
const router = express.Router();

const Twitter = require('./../services/TwitterService');
const DynamoDB = require('./../services/DynamoDBService');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Twitterment' });
});
//get twitter trends and send them as json response
router.post('/trends', function(req, res, next) {
    Twitter.getTrends(req.body.WOEID).then(function(data) {
        //console.log(data);
        res.json(data);
    }).catch(function(error) {
        console.error(error);
    });
});

// get the data for the previous stream and send them as json response
router.post('/getPrevSearch', function(req, res, next) {
    DynamoDB.getPrevSearch(req.body.keyWords).then(function (data) {
        //console.log(data);
        res.json(data);
    }).catch(function (error) {
        console.error(error)
    });
});


module.exports = router;

