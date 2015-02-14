//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true

//On Window Load
window.onload = function() {

  //Put Test Code HERE:
  //document.getElementById('uploadTest').addEventListener('touchstart',function(evt){this.className += " hovered"});
  //document.getElementById('uploadTest').addEventListener('touchend',function(evt){this.className = this.className.replace(/hovered/g,"")});

  //Loop Over Config
  for (var chart in me) {

    //Init Request Mechanism
    me[chart].request = (window.XMLHttpRequest) ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));

    //When Data Is Ready
    me[chart].request.onreadystatechange = (function(chart) {

      //Some Complicated Magic
      return function() {

        //If Request Ready
        if (me[chart].request.readyState == 4 && me[chart].request.status == 200) {
          console.log(chart);
          //Generic Init
          me[chart].data = JSON.parse(me[chart].request.responseText);
          me[chart].container = document.getElementById(me[chart].name);
          me[chart].canvas = document.getElementById(me[chart].name + "Canvas");

          //Init Canvas Context
          if (!!me[chart].canvas.getContext) {
            me[chart].ctx = me[chart].canvas.getContext("2d");
          }

          //Before Construction Functions
          for (var bcf in me[chart].beforeConstructionFunctions) {
            me[chart].beforeConstructionFunctions[bcf](me[chart]);
          }

          me[chart].graph = new me[chart].specialConstructor(me[chart].canvas, me[chart].config);

          //After Construction Functions
          for (var acf in me[chart].afterConstructionFunctions) {
            me[chart].afterConstructionFunctions[acf](me[chart]);
          }

          //Event Handlers
          for (var handle in me[chart].handlers) {
            me[chart].canvas.addEventListener(handle, me[chart].handlers[handle]);
          }

          //Announce
          console.log("Got " + me[chart].url);
        }
      }
    })(chart);

    //Fetch Data
    me[chart].request.open("GET", me[chart].url, true);
    me[chart].request.send();
  }

  //FastClick
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
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


function findWithAttr(arra, attr, value) {
  var key = null;
  for (var i = 0; i < arra.length; i += 1) {
    if (arra[i][attr] == value) {
      key = i;
    }
  }
  return key;
}

function formatSeconds(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  return ((h > 0 ? (h < 10 ? "0" + h + ":" : h + ":") : "00:") + (m > 0 ? (m < 10 ? "0" : "") + m : "00"));
}

function clone(src) {
  function mixin(dest, source, copyFunc) {
    var name, s, i, empty = {};
    for (name in source) {
      // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
      // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
      // don't overwrite it with the toString() method that source inherited from Object.prototype
      s = source[name];
      if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
        dest[name] = copyFunc ? copyFunc(s) : s;
      }
    }
    return dest;
  }

  if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
    // null, undefined, any non-object, or function
    return src; // anything
  }
  if (src.nodeType && "cloneNode" in src) {
    // DOM Node
    return src.cloneNode(true); // Node
  }
  if (src instanceof Date) {
    // Date
    return new Date(src.getTime()); // Date
  }
  if (src instanceof RegExp) {
    // RegExp
    return new RegExp(src); // RegExp
  }
  var r, i, l;
  if (src instanceof Array) {
    // array
    r = [];
    for (i = 0, l = src.length; i < l; ++i) {
      if (i in src) {
        r.push(clone(src[i]));
      }
    }
    // we don't clone functions for performance reasons
    //		}else if(d.isFunction(src)){
    //			// function
    //			r = function(){ return src.apply(this, arguments); };
  } else {
    // generic objects
    r = src.constructor ? new src.constructor() : {};
  }
  return mixin(r, src, clone);

}

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
