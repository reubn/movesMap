//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true

//On Window Load
window.onload = function() {

  //Put Test Code HERE:
  //document.getElementById('uploadTest').addEventListener('touchstart',function(evt){this.className += " hovered"});
  //document.getElementById('uploadTest').addEventListener('touchend',function(evt){this.className = this.className.replace(/hovered/g,"")});

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

          movesMap[chart].graph = new movesMap[chart].specialConstructor(movesMap[chart].canvas, movesMap[chart].config);

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
      }
    })(chart);

    //Fetch Data
    movesMap[chart].request.open("GET", movesMap[chart].url, true);
    movesMap[chart].request.send();
  }

};


//Init ProgressButton
var progbtn = new UIProgressButton(document.getElementById('update'), {
  callback: function(progbtn) {
    console.log("cb");
    //Init XMLHTTP
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
      console.log(xmlhttp.status);
      //Increase Button Percent by 25%
      progbtn.setProgress(xmlhttp.readyState * 0.25);
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //Updated
        console.log("good");
        progbtn.stop(1);
      } else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
        console.log("bad");
        progbtn.stop(-1);
      }
    }

    xmlhttp.open("GET", "/update", true);
    xmlhttp.send();
  }
});

function convertCase(str) {
  return str.toLowerCase().replace(/_/g, " ").replace(/(^| |_)(\w)/g, function(x) {
    return x.toUpperCase();
  });
}

google.maps.LatLng.prototype.kmTo = function(a) {
  var e = Math,
    ra = e.PI / 180;
  var b = this.lat() * ra,
    c = a.lat() * ra,
    d = b - c;
  var g = this.lng() * ra - a.lng() * ra;
  var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
  return f * 6378.137;
}

google.maps.Polyline.prototype.inKm = function(n) {
  var a = this.getPath(n),
    len = a.getLength(),
    dist = 0;
  for (var i = 0; i < len - 1; i++) {
    dist += a.getAt(i).kmTo(a.getAt(i + 1));
  }
  return dist;
}
