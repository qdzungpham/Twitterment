//Require Dependencies
const Twit = require('twit');
const Promise = require('bluebird');
//login details for the twitter API
const config = {
    consumer_key:         'YSc1Wr6hjrYNzT2tDQllMWtkN',
    consumer_secret:      'mylliNEO3gxwyi0DH53L0NOsBrYACAORmKmRwUIRMtb50kpLro',
    access_token:         '895857760096501760-zQgQ9gWERGVnJhPqbKoIc8CqixYpGeM',
    access_token_secret:  'l01I09Ux3lVYYoGZZwzzNSmyd9scdRGmw6Voc9hoqTZ6P'
    //timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
};

//Create Twitter Instance
let Twitter = new Twit(config);

module.exports = {
    // retrieve the stream of tweets from twitter by entering keywords
    stream: function(keyword) {
        return Twitter.stream('statuses/filter', {language: 'en', track: keyword});

    },
    // get trends in the area by using the Twitter Location Id
    //Example: Australia : 23424748
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