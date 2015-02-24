//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true

//On Window Load
window.onload = function() {
  //Loop Over Config
  for (var chart in movesMap) {

    //Init Request Mechanism
    movesMap[chart].request = (window.XMLHttpRequest) ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));

    //When Data Is Ready
    movesMap[chart].request.onreadystatechange = (function(chart) {

      //Some Complicated Magic
      return function() {

        //If Request Ready
        if (movesMap[chart].request.readyState == 4 && movesMap[chart].request.status == 200) {
          console.log(chart);
          //Generic Init
          movesMap[chart].data = JSON.parse(movesMap[chart].request.responseText);
          movesMap[chart].container = document.getElementById(movesMap[chart].name);
          movesMap[chart].canvas = document.getElementById(movesMap[chart].name + "Canvas");

          //Init Canvas Context
          if (!!movesMap[chart].canvas.getContext) {
            movesMap[chart].ctx = movesMap[chart].canvas.getContext("2d");
          }

          //Before Construction Functions
          for (var bcf in movesMap[chart].beforeConstructionFunctions) {
            movesMap[chart].beforeConstructionFunctions[bcf](movesMap[chart]);
          }

          if (movesMap[chart].newConstructor) {
            movesMap[chart].graph = new movesMap[chart].specialConstructor(movesMap[chart].canvas, movesMap[chart].config);
          } else {
            movesMap[chart].graph = movesMap[chart].specialConstructor(movesMap[chart].canvas, movesMap[chart].config);
          }

          //After Construction Functions
          for (var acf in movesMap[chart].afterConstructionFunctions) {
            movesMap[chart].afterConstructionFunctions[acf](movesMap[chart]);
          }

          //Event Handlers
          for (var handle in movesMap[chart].handlers) {
            movesMap[chart].canvas.addEventListener(handle, movesMap[chart].handlers[handle]);
          }

          //Announce
          console.log("Got " + movesMap[chart].url);
        }
      };
    })(chart);

    //Fetch Data
    movesMap[chart].request.open("GET", movesMap[chart].url, true);
    movesMap[chart].request.send();
  }

};
