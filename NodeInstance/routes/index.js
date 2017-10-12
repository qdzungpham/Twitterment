var express = require('express');
var router = express.Router();

const Twitter = require('./../services/TwitterService');

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



/*
Twitter.getTrends(1).then(function(data) {
    console.log(data);
}).catch(function(error) {
    console.error(error);
});
*/
module.exports = router;
