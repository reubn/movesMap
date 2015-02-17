//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
//require('longjohn');
var fs = require("fs");
var http = require("http");
var path = require('path');
var url = require('url');
var moves = require('./moves-api');
var cp = require('child_process');
var mime = require('mime');
var colors = require('colors/safe');
var uuid = require('node-uuid');
var moment = require('moment');
var config;

fs.readFile('./config/application.json', 'utf8', function(err, configFromFile) {
  if (err) throw err;
  config = JSON.parse(configFromFile);


  if (config.moves) {
    initMoves(config);
    doRefresh(config);
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

function doRefresh(config) {
  if (config.moves.auth.refresh_token) {
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
    console.error(colors.red("Cant Refresh AuthToken"));
  }
}

function doAuthConversion(config, req, res, query) {
  if (query.code) {
    moves.token(query.code, function(error, response, body) {
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
            res.writeHead(200, {});
            res.end(JSON.stringify(accessToken));
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

function serveFile(filename, config, status, res, req, params, query) {
  if (config.app.fileBlackList.map(function(f) {
      return filename.replace(/[\\]/g, "/").indexOf(f.replace(/[\\]/g, "/")) >= 0;
    }).every(function(r) {
      return r === false;
    })) {
    //console.info(colors.blue("Serving Static File From: " + filename));
    status.code = 200;
    status.operation = "serveStatic"
    logReq(config, status, req, res, params, query);
    var mimeType = mime.lookup(filename);
    res.writeHead(200, {
      'Content-Type': mimeType
    });

    var fileStream = fs.createReadStream(filename);
    fileStream.pipe(res);
  } else {
    //console.log(colors.yellow("File BlackListed: " + filename));
    logReq(config, status, req, res, params, query);
    res.writeHead(401, {});
    res.end("Access Denied");
  }
}

function logReq(config, status, req, res, params, query) {
  status.timeDiff = process.hrtime(status.start);
  console.info(colors[config.app.statusColors[status.code.toString()[0]]]("█") + " [" + moment().format("YYYY-MM-DD HH:mm:ss:SSSZZ") + "] " + colors.cyan(req.url + " " + JSON.stringify(params) + " " + JSON.stringify(query)) + " " + colors.blue(JSON.stringify(status)) + "  " + (status.timeDiff[0]*1e9 + status.timeDiff[1]) + "ns");
}

function startServer(config) {
  http.createServer(function(req, res) {
    var status = {
      code: 200,
      operation: null,
      uuid: uuid.v4(),
      start: process.hrtime()
    };
    var params = req.url.replace(/\?[^\/]+(\/?)/g, "$1").split("/");
    var query = url.parse(req.url, true).query;

    if (params[1] == "auth") {
      //console.info(colors.blue("Auth Flow"));
      status.code = 200;
      status.operation = "authFlow"
      logReq(config, status, req, res, params, query);
      doAuthConversion(config, req, res, query);

    } else if (params[1] == "login") {
      //console.info(colors.blue("Login Flow"));
      status.code = 302;
      status.operation = "loginRedir"
      logReq(config, status, req, res, params, query);
      res.writeHead(status.code, {
        'Location': moves.authorize({
          scope: ['activity', 'location'], //can contain either activity, location or both
          state: 'ThisIsState' //optional state as per oauth
        })
      });
      res.end();

    } else if (params[1] == "update") {
      //console.info(colors.blue("Update Flow"));
      status.code = 202;
      status.operation = "update"
      logReq(config, status, req, res, params, query);
      res.writeHead(202, {});
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

    } else if (params[0] === "") {
      var uri = url.parse(req.url).pathname;
      var filename = path.join(process.cwd(), (params[1] != "config" && params[1] != "data") ? ("front") : (""), unescape(uri));
      var stats;

      try {
        stats = fs.lstatSync(filename); // throws if path doesn't exist
      } catch (e) {
        status.code = 404;
        status.operation = "serveStatic"
        logReq(config, status, req, res, params, query);
        res.writeHead(status.code, {
          'Content-Type': 'text/plain'
        });
        res.write('404 Not Found\n');
        res.end();
        return;
      }

      if (stats.isDirectory()) {
        filename = path.join(filename, "/index.html");
        try {
          stats = fs.lstatSync(filename); // throws if path doesn't exist
        } catch (e) {
          status.code = 404;
          status.operation = "serveStatic"
          logReq(config, status, req, res, params, query);
          res.writeHead(status.code, {
            'Content-Type': 'text/plain'
          });
          res.write('404 Not Found\n');
          res.end();
          return;
        }

      }

      if (stats.isFile()) {
        // path exists, is a file
        serveFile(filename, config, status, res, req, params, query);
      } else {
        // Symbolic link, other?
        // TODO: follow symlinks?  security?
        status.code = 500;
        status.operation = "serveStatic"
        logReq(config, status, req, res, params, query);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.write('500 Internal server error\n');
        res.end();
      }

    } else {
      //console.info(colors.yellow("Request Not Handled"));
      status.code = 500;
      status.operation = null
      logReq(config, status, req, res, params, query);
      res.writeHead(500, {});
      res.end("Hmmmm...");
    }

  }).listen(config.app.port, config.app.ip);
  console.info(colors.blue("Server Started. Port: " + colors.magenta(config.app.port) + " IP: " + colors.magenta(config.app.ip)));
}
