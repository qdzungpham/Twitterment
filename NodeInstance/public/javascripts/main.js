$(document).ready(function() {
    getTrends();
    initSocketConnection();
    initchart();
    document.getElementById("tweetAnalysis").style.display = "none";
});

let socket;
let graph;
let annotator;
let graphData = 0;
let totalScore = 0;
let totalTweets = 0;

function getTrends() {
    $.ajax({
        type: "POST",
        url: '/trends',
        dataType: 'json',
        cache: false,
        data: {WOEID: 1}
    }).done(function (data) {
        console.log(data);
        displayTrends(data[0].trends, 'globalTrends')
    });
    $.ajax({
        type: "POST",
        url: '/trends',
        dataType: 'json',
        cache: false,
        data: {WOEID: 23424748}
    }).done(function (data) {
        console.log(data);
        displayTrends(data[0].trends, 'auTrends')
    })
}


function displayTrends(trends, type) {
    $.each(trends, function(key, val) {
        const button = document.createElement('button');
        const trend = document.createTextNode(val.name);
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-default customBtn');
        button.appendChild(trend);
        button.onclick = function() {
            $('#searchInput').val(val.name);
            startStreaming();
        };
        document.getElementById(type).appendChild(button);
    })
}

function initSocketConnection() {
    socket = io();
    socket.on('sendTweet', function(data) {
        console.log(data);
        totalTweets += 1;
        addTweet(data.tweet);
        appendGraphData(data.tweet.sentiment.score);
        displayOverallSentiment();
        displayPositiveNegativeWords(data.tweet.sentiment.positive, data.tweet.sentiment.negative)

        const frequency = 1;
        if(totalTweets % frequency === 0) {
            socket.emit('getTopWords');
        }
    });

    socket.on('sendTopWords', function(data) {
        console.log(data);
        displayTopWords(data);

        let topWords = '';
        $.each(data, function(key, val) {
            topWords += (' ' + val.word + ' | ');
        });
        annotator.add(graph.series[0].data[98].x, 'Top Words:' + topWords);
        annotator.update();
    })
}

function startStreaming() {
    reset();
    document.getElementById("tweetAnalysis").style.display = "block";
    socket.emit('search', {keyword: $('#searchInput').val()});
    $('html, body').animate({
        scrollTop: $("#tweetAnalysisSection").offset().top
    }, 1000);
}

function reset() {
    graphData = 0;
    totalScore = 0;
    totalTweets = 0;
    $('#positiveWords').find('span').remove();
    $('#negativeWords').find('span').remove();
    $('#topWords').find('span').remove();
    $('.media-list').find('li').remove();
    $('#overallSentiment').find('i').remove();
    $('#totalTweet').text(totalTweets);

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
    $('#totalTweet').text(totalTweets);

}

function initchart() {

    const tv = 500;
    graph = new Rickshaw.Graph({
        element: document.getElementById('chart'),
        min: -10,
        max: 10,
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


    annotator = new Rickshaw.Graph.Annotate( {
        graph: graph,
        element: document.getElementById('timeline')
    } );

    const ticksTreatment = 'glow';
    const xAxis = new Rickshaw.Graph.Axis.Time( {
        graph: graph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
    } );
    xAxis.render();

    const yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        ticksTreatment: ticksTreatment,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    });
    yAxis.render();

    const hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
    } );

    const legend = new Rickshaw.Graph.Legend( {
        element: document.querySelector('#legend'),
        graph: graph
    } );

    const iv = setInterval( function() {

        graph.series.addData(graphData);
        graph.render();

    }, tv );
}

function appendGraphData(score) {
    totalScore += score;
    graphData = { RealTimeScore: score, AverageScore: totalScore/totalTweets};
}

function displayOverallSentiment() {
    const avg = totalScore/totalTweets;
    if(avg < -0.5) {
        $('#overallSentiment').find('i').remove();
        $('#overallSentiment').append('<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="color:red"></i>')
    } else if(avg > 0.5) {
        $('#overallSentiment').find('i').remove();
        $('#overallSentiment').append('<i class="fa fa-smile-o fa-5x" aria-hidden="true" style="color:darkorange"></i>')
    } else {
        $('#overallSentiment').find('i').remove();
        $('#overallSentiment').append('<i class="fa fa-meh-o fa-5x" aria-hidden="true"></i>')
    }
}

function displayPositiveNegativeWords(positive, negative) {
    if (positive.length > 0) {
        $.each(positive, function(key, val) {
            let currentNumWords  = document.getElementById("positiveWords").childElementCount;
            while (currentNumWords >= 10) {
                $('#positiveWords').find('span').first().remove();
                currentNumWords -= 1;
            }
            $('#positiveWords').append(`<span class="label label-success customBtn">${val}</span>`);
        })
    }

    if (negative.length > 0) {
        let currentNumWords  = document.getElementById("negativeWords").childElementCount;
        $.each(negative, function(key, val) {
            while (currentNumWords >= 10) {
                $('#negativeWords').find('span').first().remove();
                currentNumWords -= 1;
            }
            $('#negativeWords').append(`<span class="label label-danger customBtn">${val}</span>`);
        })
    }
}

function displayTopWords(words) {
    $('#topWords').find('span').remove();
    $.each(words, function(key, val) {

        $('#topWords').append(`<span class="label label-info customBtn">${val.word}</span>`);
    })
}