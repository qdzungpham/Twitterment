$(document).ready(function() {
    getTrends();
    initSocketConnection();
    chart();
});

let socket;
let graph;
let graphData = 0;
let totalScore = 0;
let totalTweets = 0;

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
    socket.on('sendTweet', function(data) {
        console.log(data);
        addTweet(data.tweet);
        appendGraphData(data.tweet.sentiment.score)
    })
}

function startStreaming() {
    socket.emit('search', {keyword: $('#searchInput').val()});
}

function addTweet(tweet) {
    $('.media-list').prepend(`<li class="media">
                  <a href="#" class="pull-left">
                    <img src="${tweet.user.profile_image_url_https}" alt="" class="img-circle">
                  </a>
                  <div class="media-body">
                    <span class="pull-right">
                      ${tweet.icon}
                    </span>
                    <strong class="text-success">@ ${tweet.user.name}</strong>
                    <p>
                      ${tweet.text}
                    </p>
                  </div>
                </li>`)
}

function chart() {
    const palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );

    var tv = 1000;
    graph = new Rickshaw.Graph({
        element: document.getElementById('chart'),
        min: 'auto',
        renderer: 'line',
        stroke: true,
        preserve: true,
        //interpolation: 'linear',
        series: new Rickshaw.Series.FixedDuration([{ name: 'RealTimeScore', color: '#9E9E9E'}, { name: 'AverageScore', color: '#B71C1C' }], undefined, {
            timeInterval: tv,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
        })
    });

    graph.render();

    var ticksTreatment = 'glow';
    var xAxis = new Rickshaw.Graph.Axis.Time( {
        graph: graph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
    } );
    xAxis.render();
    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        ticksTreatment: ticksTreatment,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT
    });
    yAxis.render();

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
    } );

    var legend = new Rickshaw.Graph.Legend( {
        element: document.querySelector('#legend'),
        graph: graph
    } );

    var iv = setInterval( function() {

        graph.series.addData(graphData);
        graph.render();

    }, tv );
}

function appendGraphData(score) {
    totalScore += score;
    totalTweets += 1;
    graphData = { RealTimeScore: score, AverageScore: totalScore/totalTweets};
}