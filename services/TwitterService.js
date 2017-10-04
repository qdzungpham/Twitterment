//Require Dependencies
const Twit = require('twit');
const Promise = require('bluebird');

const config = {
    consumer_key:         'YSc1Wr6hjrYNzT2tDQllMWtkN',
    consumer_secret:      'mylliNEO3gxwyi0DH53L0NOsBrYACAORmKmRwUIRMtb50kpLro',
    access_token:         '895857760096501760-zQgQ9gWERGVnJhPqbKoIc8CqixYpGeM',
    access_token_secret:  'l01I09Ux3lVYYoGZZwzzNSmyd9scdRGmw6Voc9hoqTZ6P'
    //timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
};

//Create Twitter Instance
const Twitter = new Twit(config);

module.exports = {

    stream: function(keyword) {
        return Twitter.stream('statuses/filter', {language: 'en', track: keyword});

    },

    getTrends: function(locationId) {
        return new Promise( function( resolve, reject )
        {
            var params = { id: locationId };
            Twitter.get('trends/place', params, function(error, trends, response){
                if (!error) {
                    return resolve(trends);
                }
                else{
                    console.log(error);
                    return reject(error);
                }
            })
        });
    }
};