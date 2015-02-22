//#include 'GPX.js'

(function() {

  function d2h(d) {
    var hex = '0123456789ABCDEF';
    var r = '';
    d = Math.floor(d);
    while (d !== 0) {
      r = hex[d % 16] + r;
      d = Math.floor(d / 16);
    }
    while (r.length < 2) r = '0' + r;
    return r;
  }

  function gradient(color) {
    // First arc (0, PI) in HSV colorspace
    function f2h(d) {
      return d2h(256 * d);
    }
    if (color < 0)
      return '#FF0000';
    else if (color < 1.0 / 3)
      return '#FF' + f2h(3 * color) + '00';
    else if (color < 2.0 / 3)
      return '#' + f2h(2 - 3 * color) + 'FF00';
    else if (color < 1)
      return '#00FF' + f2h(3 * color - 2);
    else
      return '#00FFFF';
  }

  L.speedSplit = function(e, numOfChunks) {
      var maxSpeed;
      var toCalcOn = [];
      var polyArr = new L.layerGroup();
      var ll = e.getLatLngs();
      var chunk = Math.floor(ll.length / numOfChunks);
      if (chunk < 3) chunk = 3;
      var p = null;
      for (var i = 0; i < ll.length; i += chunk) {
        var d = 0,
          t = null;
        if (i + chunk > ll.length)
          chunk = ll.length - i;
        for (var j = 0; j < chunk; j++) {
          if (p) d += p.distanceTo(ll[i + j]);
          p = ll[i + j];
          if (!t) t = p.time;
        }
        p = ll[i + chunk - 1];
        t = p.time.diff(t) / (3600 * 1000);
        var speed = 0.001 * d / t;
        toCalcOn.push({
          latLngs: ll,
          i: i,
          d: d,
          chunk: chunk,
          speed: speed
        });
      }

      maxSpeed = Math.max.apply(Math, toCalcOn.map(function(a) {
        if (a.speed != Infinity) {
          return a.speed
        } else {
          return 0;
        }
      }));
      console.log(maxSpeed);
      toCalcOn.forEach(function(entry, i) {
        var color = gradient(entry.speed / maxSpeed);
        var poly = new L.Polyline(entry.latLngs.slice(entry.i, entry.i + entry.chunk + 1), {
          color: color,
          weight: 2,
          opacity: 1
        });
        poly.bindPopup('Dist: ' + entry.d.toFixed() + 'm; Speed: ' + entry.speed.toFixed(2) + ' km/h');
        polyArr.addLayer(poly);
      });


      return polyArr;
    };
})();
