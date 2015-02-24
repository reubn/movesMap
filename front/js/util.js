function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}

function convertCase(str) {
  return str.toLowerCase().replace(/_/g, " ").replace(/(^| |_)(\w)/g, function(x) {
    return x.toUpperCase();
  });
}

function outputToInfoWindow(obj, conf, infoWindow, onclose) {
  while (infoWindow.getElementsByClassName('infoWindowEntry')[0]) {
    infoWindow.removeChild(infoWindow.getElementsByClassName('infoWindowEntry')[0]);
  }
  var holder = {};

  conf.forEach(function(c) {
    holder[c.name] = document.createElement("div");
    holder[c.name].className = "infoWindowEntry";
    holder[c.name].id = "iw" + c.name;

    holder[c.name].prop = document.createElement("span");
    holder[c.name].prop.className = "prop";
    holder[c.name].prop.innerHTML = c.name;

    holder[c.name].val = document.createElement("span");
    holder[c.name].val.className = "val";
    holder[c.name].val.innerHTML = (isFunction(c.func)) ? (c.func(obj)) : (objByPath(obj, c.func));

    holder[c.name].appendChild(holder[c.name].prop);
    holder[c.name].appendChild(holder[c.name].val);

    infoWindow.appendChild(holder[c.name]);
  });
  infoWindow.classList.add("showing");

  infoWindow.close.addEventListener("click", function _func() {
    infoWindow.close.removeEventListener('click', _func);
    infoWindow.classList.remove("showing");

    while (infoWindow.getElementsByClassName('infoWindowEntry')[0]) {
      infoWindow.removeChild(infoWindow.getElementsByClassName('infoWindowEntry')[0]);
    }

    onclose.call(obj);
  });
}

L.Polyline.prototype.measureDistance = function() {
  var distance = 0,
    coords = null,
    coordsArray = this._latlngs;

  for (i = 0; i < coordsArray.length - 1; i++) {
    coords = coordsArray[i];
    distance += coords.distanceTo(coordsArray[i + 1]);
  }

  // Return formatted distance
  return distance / 1000;
};

function pip(point, _latlngs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point.lat,
    y = point.lng;
  var vs = _latlngs;

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i].lat,
      yi = vs[i].lng;
    var xj = vs[j].lat,
      yj = vs[j].lng;

    var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};


function objByPath(element, field) {
  var a = field.replace(/\[(\w+)\]/g, '.$1').split('.');
  while (a.length) {
    var n = a.shift();
    if (n in element) {
      element = element[n];
    } else {
      return;
    }
  }
  return element;
}
