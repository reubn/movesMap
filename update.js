var fs = require("fs");
var cp = require('child_process');
var moment = require('moment');
var colors = require('colors/safe');
var data;
if (process.argv[0] == "node") {
  runIt(process.argv[2] || null, process.argv[3] || null, process.argv[3] || null);
} else {
  process.on('message', function(m) {
    runIt(m.from, m.to, m.config, m.moves);
    //process.disconnect();
  });

}

function runIt(from, to, config, moves) {
  var toDo = {
    config: config,
    moves: moves
  };

  toDo.from = (from === null) ? (config.moves.user.profile.firstDate) : (from);
  toDo.to = (to === null) ? (moment().format('YYYYMMDD')) : (to);

  console.log(JSON.stringify(toDo));
  var fetchSpawn = cp.fork('./fetchData.js');
  fetchSpawn.send(toDo);
  fetchSpawn.on('message', function(m) {
    if (m.done === true) {
      fetchSpawn.disconnect();
      console.info(colors.blue("Updated"));

      fs.writeFile('./data/map.json', JSON.stringify(m.data), function(err) {
        if (err) throw err;
        fs.writeFile('./data/' + toDo.from + "-" + toDo.to + '.json', JSON.stringify(m.data), function(err) {
          if (err) throw err;
          process.send({
            done: true
          });
          process.disconnect();
          console.log(colors.green('Data Saved'));
        });
      });
    }
  });
}
