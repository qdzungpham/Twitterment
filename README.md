# Twitterment
Twitterment has been developed as a live Twitter sentiment analysis dashboard for individuals to discover how people feel about a particular topic in real-time. Twitter data constitutes a rich source that can be used for capturing information about any topic imaginable. This data can be used in different use cases such as finding trends related to a specific keyword, measuring brand sentiment, and gathering feedback about new products and services. Twitterment lets users enter one or more keywords which becomes a “live filter” applied against the inflow of Twitter messages. The application streams tweets in real-time, analyses and gauges the sentiment of the tweets, and calculates top words over the time. It also has the ability to scale out and scale in to handle increased or decreased usage demands, which is referred to as horizontal scaling. 

## Screenshots
A screenshot showing how users can see lists of global and national trending topics and hashtags when they access the website.
![](https://github.com/qdzungpham/Twitterment/blob/master/screenshots/1.PNG)

A screenshot showing how users view a graph displaying sentiment score trend, a Twitter feed detailing the tweet updates, and top words ranking based on number of appearances that all happens in real-time when they start Twitterment with a keyword “Trump”.
![](https://github.com/qdzungpham/Twitterment/blob/master/screenshots/2.PNG)

A screenshot showing a table displaying previous analysis results of the same keyword “Trump” which were started by other users.
![](https://github.com/qdzungpham/Twitterment/blob/master/screenshots/3.PNG)

## Cloud Architecture
Twitterment has been developed to offer the elastic scalability that is the ability to handle increased or decreased usage demands. In this application, the most computational demand is the CPU utilisation generated from calculating top words from tweet updates. The application is set up so that it recalculates top words whenever there is a new tweet passing through the filter, which does not seem a right approach, but it will help to generate high load on the CPU. The below diagram represents the cloud architecture of the application.
![](https://github.com/qdzungpham/Twitterment/blob/master/screenshots/7.png)
