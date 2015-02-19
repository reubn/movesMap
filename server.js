//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
//require('longjohn');
var fs = require("fs");
var moves = require('./moves-api');
var cp = require('child_process');
var colors = require('colors/safe');

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var session = require('express-session');
var serveStatic = require('serve-static');

var config;
var app = express();
var server;

fs.readFile('./config/application.json', 'utf8', function(err, configFromFile) {
  if (err) throw err;
  config = JSON.parse(configFromFile);


  if (config.moves) {
    initMoves(config);
    doRefresh(config);
  }
  if (config.app) {
    startServer(config, app, server);
  }
});

function saveConfig(config) {
  fs.writeFile('./config/application.json', JSON.stringify(config), function(err) {
    if (err) throw err;
    console.info(colors.blue('Config Saved'));
  });
}

function initMoves(config) {
  if (config.error !== true) {
    moves = new moves({
      client_id: config.moves.clientID,
      client_secret: config.moves.clientSecret,
      redirect_uri: config.moves.redirectURI
    });
  }
}

function doRefresh(config) {
  if (config.moves.auth) {
    moves.refresh_token(config.moves.auth.refresh_token, function(error, response, body) {
      var accessToken = JSON.parse(body);
      if (!accessToken.error) {
        var now = new Date();
        now.setSeconds(now.getSeconds() + accessToken.expires_in);
        accessToken.expireDate = now;
        console.info(colors.blue("Recived Responce"));
        try {
          moves.get('/user/profile', accessToken.access_token, function(error, response, body) {
            try {
              config.moves.user = JSON.parse(body);
            } catch (e) {
              console.error(colors.red(e));
            }
            console.info(colors.blue("Refreshed Auth!!"));
            console.log(colors.green("We Have Auth!!"));
            config.moves.auth = accessToken;
            saveConfig(config);
          });
        } catch (e) {
          console.error(colors.red(e));
          console.error(colors.red(JSON.stringify(accessToken)));
        }
        //console.info(accessToken);
      } else {
        console.error(colors.red("Error From Moves Refresh: " + JSON.stringify(accessToken)));
      }
    });
  } else {
    console.error(colors.red("Dont have previous AuthToken to refresh from, Login with Moves"));
  }
}

function doAuthConversion(config, authCode, callback) {
  if (authCode) {
    moves.token(authCode, function(error, response, body) {
      var accessToken = JSON.parse(body);
      if (!accessToken.error) {
        var now = new Date();
        now.setSeconds(now.getSeconds() + accessToken.expires_in);
        accessToken.expireDate = now;
        console.info(colors.blue("Recived Responce"));
        try {
          moves.get('/user/profile', accessToken.access_token, function(error, response, body) {
            try {
              config.moves.user = JSON.parse(body);
            } catch (e) {
              console.error(colors.red(e));
              console.error(colors.red(body));
            }
            console.log(colors.green("We Have Auth!!"));
            config.moves.auth = accessToken;
            saveConfig(config);
            callback(accessToken);
          });
        } catch (e) {
          console.error(colors.red(e));
          console.error(colors.red(JSON.stringify(accessToken)));
        }
        //console.info(accessToken);
      } else {
        console.error(colors.red("authCode wont convert to accessToken: " + JSON.stringify(accessToken)));
      }
    });
  } else {
    console.error(colors.red("No AuthCode Provided"));
  }
}



//function logReq(config, status, req, res, params, query) {
//status.timeDiff = process.hrtime(status.start);
//console.info(colors[config.app.statusColors[status.code.toString()[0]]]("█") + " [" + moment().format("YYYY-MM-DD HH:mm:ss:SSSZZ") + "] " + colors.cyan(req.url + " " + JSON.stringify(params) + " " + JSON.stringify(query)) + " " + colors.blue(JSON.stringify(status)) + "  " + (status.timeDiff[0] * 1e9 + status.timeDiff[1]) + "ns");
//}

function startServer(config, app, server) {
  //Middleware
  app.use(morgan('dev'));
  app.use(compression());
  //app.use(session({secret: config.app.sessionSecret}));
  app.use(serveStatic('front/'));
  app.use('/data', serveStatic('data/'));

  //Routing
  app.get('/login', function(req, res) {
    moves.authorize({
      scope: ['activity', 'location'],
      state: 'ThisIsState'
    }, res);
  });

  app.get('/auth', function(req, res) {
    doAuthConversion(config, req.query.code, function(a) {
      res.json(a);
    });
  });

  app.get('/update', function(req, res) {
    var updaterSpawn = cp.fork('./update.js');
    updaterSpawn.send({
      from: req.query.from || null,
      to: req.query.to || null,
      config: config,
      moves: moves
    });
    updaterSpawn.on('message', function() {
      res.send("Updated");
      updaterSpawn.disconnect();
    });
  });

  app.get('/config/*', function(req, res) {
    res.sendfile("config/front.js");
  });

  //Start Server
  server = app.listen(config.app.port, function() {
    console.info(colors.blue("Server Started. Port: " + colors.magenta(server.address().port) + " IP: " + colors.magenta(server.address().address)));
  });
}
