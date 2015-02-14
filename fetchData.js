//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
var moves = require('./moves-api');
var moment = require('moment');
var fs = require("fs");
var colors = require('colors/safe');
var randomColor = require('randomColor');

//var placeList = JSON.parse(fs.readFileSync('./config/placeColours.json'));

var config;
var paths = [];
var chunks;

process.on('message', function(m) {
  config = m.config;
  moves = new moves({
    client_id: config.moves.clientID,
    client_secret: config.moves.clientSecret,
    redirect_uri: config.moves.redirectURI
  });
  mapMovement(m.from, m.to);
});

function mapMovement(from, to) {
  console.time("fromMapMovement");
  if (to === null) {
    to = moment().format('YYYYMMDD');
  }
  //console.info(colors.blue(from + " " + to));
  if (dayDiff(moment(from, 'YYYYMMDD'), moment(to, 'YYYYMMDD')) <= 7) {

  } else {
    //console.info(colors.blue("BIG!"));
    var daysdiff = dayDiff(moment(from, 'YYYYMMDD'), moment(to, 'YYYYMMDD'));
    var numOfChunks = Math.ceil(daysdiff / 6);
    chunks = [{
      from: moment(from, 'YYYYMMDD').format('YYYYMMDD'),
      to: moment(from, 'YYYYMMDD').add(6, 'd').format('YYYYMMDD')
    }];
    var collectedPaths = {};
    var collectedPlaces = [];
    for (var i = 0; i < numOfChunks; i++) {
      if (chunks[i]) {
        var pair = {
          from: ((moment(chunks[i].to, 'YYYYMMDD').add(1, 'd') < moment(to, 'YYYYMMDD')) ? moment(chunks[i].to, 'YYYYMMDD').add(1, 'd').format('YYYYMMDD') : chunks[i].to),
          to: ((moment(chunks[i].to, 'YYYYMMDD').add(6, 'd') < moment(to, 'YYYYMMDD')) ? moment(chunks[i].to, 'YYYYMMDD').add(6, 'd').format('YYYYMMDD') : moment(to, 'YYYYMMDD').format('YYYYMMDD'))
        };
        if (pair.from != pair.to) {
          chunks.push(pair);

        }
      }
    }

    chunks.forEach(function(chunk, i) {
      console.info(colors.blue(JSON.stringify(chunk)));
      processData(chunk.from, chunk.to, i, countDone);
    });

  }

}

function dayDiff(first, second) {
  return Math.ceil((second - first) / (1000 * 60 * 60 * 24));
}

function processData(from, to, index, callback) {
  console.info(colors.blue("processData Called for Chunk: " + from + " to " + to));
  moves.get('/user/storyline/daily?trackPoints=true&from=' + from + '&to=' + to, config.moves.auth.access_token, function(error, response, body) {
    //console.info(colors.blue("Reached Request Callback"))
    if (error) {
      throw error;
    } else {
      //console.error(colors.red("No http Error"));
    }

    try {
      var data = JSON.parse(body)
    } catch (e) {
      console.error(colors.red(e)); //error in the above string(in this case,yes)!
      console.error(colors.red(body));
    }

    if (body[0]) {
      //console.info(colors.blue("body[0] exists"));
    } else {
      console.error(colors.red("No body[0] for " + from + " to " + to));
      console.error(colors.red(body));
    }
    //console.info(colors.blue(body));
    if (data) {
      //console.info(colors.blue("data exists"));
      data.forEach(function(day, i) {
        if (day.segments) {
          //console.info(colors.blue("day.segments exists"));
          day.segments.forEach(function(segment, i) {
            if (segment) {
              //console.info(colors.blue("segment exists"));
              if (segment.type == "move") {
                if (segment.activities) {
                  //console.info(colors.blue("segment.activities exists"));
                  segment.activities.forEach(function(activity, i) {
                    //Reached Activity: Individual PolylineThing
                    delete activity.manual;
                    activity.points = activity.trackPoints;
                    delete activity.trackPoints;
                    activity.type = activity.activity;
                    delete activity.activity;
                    activity.strokeColor = "#" + (config.moves.activityColours[activity.type] || "FF0000");
                    paths.push(activity);
                    //console.log(colors.green("Pushed Activity. Paths Array Length is now: " + paths.length));
                  });
                }
              }
              //console.info(colors.blue("3 segment.activities loop should be done."));
            }

          });
        }
        //console.info(colors.blue("2 day.segments loop should be done."));
      });
      //Should be done now
      console.info(colors.blue("1 data loop should be done."));
      callback();
    }
  });
}

var intCount = 0;

function countDone() {
  //console.info(colors.blue("countDone Called"));
  intCount++;
  console.info(colors.blue(intCount + " vs " + chunks.length));
  if (intCount === chunks.length) {
    console.info(colors.blue("0 chunk loop should be done."));
    process.send({
      done: true,
      data: {
        chart: {
          paths: paths
        }
      }
    });
    console.log(colors.green('END! File Sent to Parent'));
    console.timeEnd("fromMapMovement");
    // fs.writeFile('./test.json', JSON.stringify({
    //   chart: {
    //     paths: paths
    //   }
    // }), function(err) {
    //   if (err) throw err;
    //   console.log(colors.green('Path Test Saved'));
    // });
  }
}
