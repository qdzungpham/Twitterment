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
//using ajax to get trends from the server
function getTrends() {
    $.ajax({
        type: "POST",
        url: '/trends',
        dataType: 'json',
        cache: false,
        // Location Id of worldwide
        data: {WOEID: 1}
    }).done(function (data) {
        //console.log(data);
        displayTrends(data[0].trends, 'globalTrends')
    });
    $.ajax({
        type: "POST",
        url: '/trends',
        dataType: 'json',
        cache: false,
        //Australia location ID
        data: {WOEID: 23424748}
    }).done(function (data) {
        //console.log(data);
        displayTrends(data[0].trends, 'auTrends')
    })
}

//display the trends
function displayTrends(trends, type) {
    $.each(trends, function(key, val) {
        const button = document.createElement('button');
        const trend = document.createTextNode(val.name);
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'btn btn-default customBtn');
        button.appendChild(trend);
        button.onclick = function() {
            const inputText = $('#searchInput').val();
            if (inputText === '') {
                $('#searchInput').val(val.name);
            } else {
                $('#searchInput').val($('#searchInput').val() + ', ' + val.name);
            }
        };
        document.getElementById(type).appendChild(button);
    })
}

function initSocketConnection() {
    socket = io();
    socket.on('sendTweet', function(data) {
        //console.log(data);
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
                url: '/analysis',
                dataType: 'json',
                cache: false,
                data: {socketID: data.socketID}
            }).done(function (data) {
                //console.log(data);
                displayTopWords(data.topAllWords, data.topPositiveWords, data.topNegativeWords);

                let topAllWordsString = '';
                $.each(data.topAllWords, function(key, val) {
                    topAllWordsString += (' ' + val.word + ' |');
                });
                annotator.add(graph.series[0].data[98].x, 'Top Words:' + topAllWordsString);
                annotator.update();
            })
        }
    });

}
// check for the keyword, reset the data of the previous stream and start a new stream
function startStreaming() {
    const keyWord = $('#searchInput').val();
    if (keyWord === null || keyWord.trim() === '') {
        window.alert('Please enter one or more keywords.');
        return;
    }
    reset();
    document.getElementById("tweetAnalysis").style.display = "block";
    $('#inputText').text(keyWord);
    socket.emit('search', {keyword: keyWord});
    $('html, body').animate({
        scrollTop: $("#tweetAnalysisSection").offset().top
    }, 1000);

    getPrevSearch();
}
// Reset the data of the stream
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
//display the data of previous stream of the keyword
function getPrevSearch() {
    $.ajax({
        type: "POST",
        url: '/getPrevSearch',
        dataType: 'json',
        cache: false,
        data: {keyWords: $('#searchInput').val()}
    }).done(function (data) {
        //console.log(data);
        $('#prevSearchTable').find('tr').remove();
        for (let i = data.Items.length - 1; i >= 0; i--)  {
            const val = data.Items[i];
            const date = new Date(val.date.S).toLocaleString();
            $('#prevSearchTable').append(`<tr>
                                            <th class="col-xs-2" scope="row">${date}</th>
                                            <td class="col-xs-1">${Math.round(val.avgScore.N * 100)/100}</td>
                                            <td class="col-xs-3">${val.topAllWords.S}</td>
                                            <td class="col-xs-3">${val.topPositiveWords.S}</td>
                                            <td class="col-xs-3">${val.topNegativeWords.S}</td>
                                          </tr>`);
        }

    })
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
//init the chart that used to displayy the overall sentiment
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
// append the data into the graph
function appendGraphData(score, avg) {
    graphData = { RealTimeScore: score, AverageScore: avg};
}

//display overall sentiment using icon based in the average score
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

//get the top all/postive/negative words from json response
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