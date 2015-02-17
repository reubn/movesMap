//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
var moves = require('./moves-api');
var moment = require('moment');
var uuid = require('node-uuid');
var colors = require('colors/safe');

//var placeList = JSON.parse(fs.readFileSync('./config/placeColours.json'));

var config;
var toReturn = {
  done: true,
  data: {
    chart: {
      paths: [],
      places: []
    }
  }
};
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

    console.info(colors.blue(JSON.stringify({
      from: from,
      to: to
    })));
    processData(from, to, 0, countDone, true);

  } else {
    //console.info(colors.blue("BIG!"));
    var daysdiff = dayDiff(moment(from, 'YYYYMMDD'), moment(to, 'YYYYMMDD'));
    var numOfChunks = Math.ceil(daysdiff / 6);
    chunks = [{
      from: moment(from, 'YYYYMMDD').format('YYYYMMDD'),
      to: moment(from, 'YYYYMMDD').add(6, 'd').format('YYYYMMDD')
    }];
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
      processData(chunk.from, chunk.to, i, countDone, false);
    });

  }

}

function dayDiff(first, second) {
  return Math.ceil((second - first) / (1000 * 60 * 60 * 24));
}

function processData(from, to, index, callback, single, retry) {
  console.info(colors.blue("processData Called for: " + from + " to " + to));
  if (retry === true) {
    console.log(colors.yellow("processData RETRY no. " + retry + " Called for: " + from + " to " + to));
  }
  if (retry > 5 || !retry) {
    moves.get('/user/storyline/daily?trackPoints=true&from=' + from + '&to=' + to, config.moves.auth.access_token, function(error, response, body) {
      //console.info(colors.blue("Reached Request Callback"))
      if (error) {
        throw error;
      } else {
        //console.error(colors.red("No http Error"));
      }
      var data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        console.error(colors.red(e)); //error in the above string(in this case,yes)!
        console.error(colors.red(body));
      }

      if (body[0]) {
        //console.info(colors.blue("body[0] exists"));
      } else {
        console.error(colors.red("No body[0] for " + from + " to " + to));
        console.error(colors.red(body));
        processData(from, to, index, callback, single, (retry) ? (retry + 1) : (1));
      }
      //console.info(colors.blue(body));
      if (data && body[0]) {
        //console.info(colors.blue("data exists"));
        data.forEach(function(day) {
          if (day.segments) {
            //console.info(colors.blue("day.segments exists"));
            day.segments.forEach(function(segment) {
              if (segment) {
                //console.info(colors.blue("segment exists"));
                if (segment.type == "move") {
                  if (segment.activities) {
                    //console.info(colors.blue("segment.activities exists"));
                    segment.activities.forEach(function(activity) {
                      //Reached Activity: Individual PolylineThing
                      activity.uuid = uuid.v1();
                      delete activity.manual;
                      activity.points = activity.trackPoints;
                      delete activity.trackPoints;
                      activity.type = activity.activity;
                      delete activity.activity;
                      activity.strokeColor = "#" + (config.moves.activityColours[activity.type] || "FF0000");
                      toReturn.data.chart.paths.push(activity);
                      //console.log(colors.green("Pushed Activity. Paths Array Length is now: " + paths.length));
                    });
                  }
                } else if (segment.type == "place" && segment.place.name && toReturn.data.chart.places.filter(function(p) {
                    return (p.id === segment.place.id || (/*p.location.lat.toFixed(2) === segment.place.location.lat.toFixed(2) && p.location.lon.toFixed(2) === segment.place.location.lon.toFixed(2) &&*/ p.name === segment.place.name));
                  }).length === 0) {
                  // segment.place.startTime = segment.startTime;
                  // segment.place.endTime = segment.endTime;
                  // segment.place.activities = segment.activities;
                  toReturn.data.chart.places.push(segment.place);
                }
                //console.info(colors.blue("3 segment.activities loop should be done."));
              }

            });
          }
          //console.info(colors.blue("2 day.segments loop should be done."));
        });
        //Should be done now
        console.info(colors.blue("1 data loop should be done."));
        callback(single);
      }
    });
  } else {
    console.log(colors.yellow("Retry Limit Reached for: " + from + " to " + to));
  }
}

var intCount = 0;

function countDone(single) {
  intCount++;
  console.info(colors.blue(intCount + " vs " + (single) ? (1) : (chunks.length)));
  if ((single === false && intCount === chunks.length) || (single === true)) {
    console.info(colors.blue("0 chunk loop should be done."));
    process.send(toReturn);
    console.log(colors.green('END! File Sent to Parent'));
    console.timeEnd("fromMapMovement");
  }
}
