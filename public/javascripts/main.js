$(document).ready(function() {
    getTrends();
    initSocketConnection();
});

let socket;

function getTrends() {
    $.ajax({
        url: '/trends',
        dataType: 'json',
        cache: false,
    }).done(function (data) {
        console.log(data);
        displayTrends(data[0].trends)
    })
}

function displayTrends(trends) {
    $.each(trends, function(key, val) {
        const button = document.createElement('button');
        const trend = document.createTextNode(val.name);
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-default trendBtn');
        button.appendChild(trend);
        button.onclick = function() {
            alert(val.name)
        };
        document.getElementById('trends').appendChild(button);
    })
}

function initSocketConnection() {
    socket = io();
    socket.on('sendTweet', function(tweet) {
        console.log(tweet)
    })
}

function startStreaming() {
    socket.emit('search', {keyword: $('#searchInput').val()});
}