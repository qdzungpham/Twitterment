const Sentiment = require('sentiment');

function appendTweet(tweet, sentiment, overallSentiment, icon) {
    const sentimentTweet = {
        sentiment: sentiment,
        overallSentiment: overallSentiment,
        icon: icon,
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
        let tweetSentiment = Sentiment(tweet.text);
        let overallSentiment;
        let icon;
        if(tweetSentiment.score < 0) {
            overallSentiment = 'negative';
            icon = `<i class="fa fa-frown-o" aria-hidden="true" style="color:red"></i>`;
        } else if(tweetSentiment.score > 0) {
            overallSentiment = 'positive';
            icon = `<i class="fa fa-smile-o" aria-hidden="true" style="color:darkorange"></i>`;
        } else {
            overallSentiment = 'neutral';
            icon = `<i class="fa fa-meh-o" aria-hidden="true"></i>`;
        }

        return appendTweet(tweet, tweetSentiment, overallSentiment, icon);
    }
};