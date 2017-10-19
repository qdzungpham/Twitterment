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
        appendGraphData(data.tweet.sentiment.score, data.avgScore);
        displayOverallSentiment(data.avgScore);
        //displayPositiveNegativeWords(data.tweet.sentiment.positive, data.tweet.sentiment.negative);

        const frequency = 1;
        if(totalTweets % frequency === 0) {
            //socket.emit('getTopWords');
            $.ajax({
                type: "POST",
                url: '/wordsAnalysis',
                dataType: 'json',
                cache: false,
                data: {socketID: data.socketID}
            }).done(function (data) {
                console.log(data);
                displayTopWords(data.topAllWords, data.topPositiveWords, data.topNegativeWords);

                let topAllWordsString = '';
                $.each(data.topAllWords, function(key, val) {
                    topAllWordsString += (' ' + val.word + ' | ');
                });
                annotator.add(graph.series[0].data[98].x, 'Top Words:' + topAllWordsString);
                annotator.update();
            })
        }
    });

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

    const tv = 250;
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

function appendGraphData(score, avg) {
    graphData = { RealTimeScore: score, AverageScore: avg};
}

function displayOverallSentiment(avg) {
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


function displayTopWords(allWords, positiveWords, negativeWords) {
    $('#topWords').find('span').remove();
    $.each(allWords, function(key, val) {
        if (val.word === '>>') return;
        $('#topWords').append(`<span class="label label-info customBtn">${val.word}</span>`);
    });

    $('#positiveWords').find('span').remove();
    $.each(positiveWords, function(key, val) {
        if (val.word === '>>') return;
        $('#positiveWords').append(`<span class="label label-success customBtn">${val.word}</span>`);
    });

    $('#negativeWords').find('span').remove();
    $.each(negativeWords, function(key, val) {
        if (val.word === '>>') return;
        $('#negativeWords').append(`<span class="label label-danger customBtn">${val.word}</span>`);
    })
}