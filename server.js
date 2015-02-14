//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
require('longjohn');
var fs = require("fs");
var http = require("http");
var path = require('path');
var moves = require('./moves-api');
var cp = require('child_process');
var mime = require('mime');
var colors = require('colors/safe');
var config;

fs.readFile('./config/application.json', 'utf8', function(err, configFromFile) {
  if (err) throw err;
  config = JSON.parse(configFromFile);


  if (config.moves) {
    initMoves(config);
    doAuth(config);
  }
  if (config.app) {
    startServer(config);
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

function doAuth(config) {
  if (config.moves.auth.refresh_token) {
    moves.refresh_token(config.moves.auth.refresh_token, function(error, response, body) {
      var accessToken = JSON.parse(body);
      var now = new Date();
      now.setSeconds(now.getSeconds() + accessToken.expires_in);
      accessToken.expireDate = now;
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
      //console.info(accessToken);

    });
  } else {
    console.error(colors.red("Cant Refresh AuthToken"));
  }
}

function startServer(config) {
  http.createServer(function(req, res) {
    var params = req.url.replace(/\?[^\/]+(\/?)/g, "$1").split("/");
    var query = require('url').parse(req.url, true).query;

    if (params[1] == "auth") {
      moves.token(query.code, function(error, response, body) {
        var accessToken = JSON.parse(body);
        if (accessToken.error !== null) {
          var now = new Date();
          now.setSeconds(now.getSeconds() + accessToken.expires_in);
          accessToken.expireDate = now;
          moves.get('/user/profile', accessToken.access_token, function(error, response, body) {
            try {
              config.moves.user = JSON.parse(body);
            } catch (e) {
              console.error(colors.red(e));
            }
            console.log(colors.green("We Have Auth!!"));
            config.moves.auth = accessToken;
            saveConfig(config);
          });
        } else {
          console.error(colors.red("authCode wont convert to accessToken"));
        }
        res.writeHead(200, {});
        res.end(JSON.stringify(accessToken));
      });
    } else if (params[1] == "login") {
      res.writeHead(302, {
        'Location': moves.authorize({
          scope: ['activity', 'location'], //can contain either activity, location or both
          state: 'ThisIsState' //optional state as per oauth
        })
      });
      res.end();

    } else if (params[1] == "update") {
      res.writeHead(200, {});
      var updaterSpawn = cp.fork('./update.js');
      updaterSpawn.send({
        from: query.from || null,
        to: query.to || null,
        config: config,
        moves: moves
      });
      updaterSpawn.on('message', function() {
        res.end("Updated");
        updaterSpawn.disconnect();
      });
    } else {
      res.writeHead(200, {});
      res.end("HAPROXRESPONCEs");
    }
  }).listen(config.app.port, config.app.ip);
  console.info(colors.blue("Server Started. Port: " + colors.magenta(config.app.port) + " IP: " + colors.magenta(config.app.ip)));
}
