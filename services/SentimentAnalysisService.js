const Sentiment = require('sentiment');

function appendTweet(tweet, sentiment) {
    const sentimentTweet = {
        sentiment: sentiment,
        created_at: tweet.created_at,
        timestamp_ms: tweet.timestamp_ms,
        id_str: tweet.id_str,
        user: {
            name: tweet.user.name,
            screen_name: tweet.user.screen_name,
            profile_image_url_https: tweet.user.profile_image_url_https,
            location: tweet.user.location,
            time_zone: tweet.user.time_zone
        },
        text: tweet.text,
        lang: tweet.lang
    };

    return sentimentTweet;
}
module.exports = {
    getSentimentTweet: function(tweet) {
        var tweetSentiment = Sentiment(tweet.text);

        /*
        if(tweetSentiment.score < 0) {
            tweetSentiment = 'negative';
        } else if(tweetSentiment.score > 0) {
            tweetSentiment = 'positive';
        } else {
            tweetSentiment = 'neutral';
        }
        */
        return appendTweet(tweet, tweetSentiment);
    }
};