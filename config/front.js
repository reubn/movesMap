//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
var movesMap = {
  movementGraph: {
    name: "movementGraph",
    url: "../data/map.json",
    specialConstructor: google.maps.Map,
    type: "Map",
    config: {
      zoom: 3,
      center: new google.maps.LatLng(0, -180),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      streetViewControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      styles: [{
        "featureType": "landscape",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#101010"
        }]
      }, {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{
          "color": "#464646"
        }, {
          "visibility": "simplified"
        }]
      }, {
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      }, {
        "featureType": "poi",
        "stylers": [{
          "visibility": "off"
        }]
      }, {
        "featureType": "transit",
        "stylers": [{
          "visibility": "off"
        }]
      }, {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#222222"
        }, {
          "weight": 1
        }]
      }, {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{
          "visibility": "on"
        }, {
          "weight": 2.8
        }, {
          "color": "#525252"
        }]
      }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#2D2D2D"
        }]
      }, {
        "featureType": "transit.line",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#2A2A2A"
        }]
      }, {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [{
          "visibility": "off"
        }]
      }, {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#0F0F0F"
        }, {
          "weight": 1
        }]
      }, {
        "featureType": "administrative",
        "elementType": "labels.text.stroke",
        "stylers": [{
          "visibility": "on"
        }, {
          "weight": 4
        }, {
          "color": "#464646"
        }]
      }, {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#313131"
        }, {
          "weight": 1.3
        }]
      }]
    },
    handlers: {
      dblclick: function() {
        var elem = this.children[0];
        console.log(elem);
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      }
    },
    other: {
      oof: 0,
      orig: null,
      diffColourSize: false,
      placeSizeMax: 100,
      placeSizeMin: 20,
      placeIcon: "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='50' height='50' viewBox='0 0 50 50'><circle opacity='0.1' fill='#fff' cx='25' cy='25' r='25'/><circle fill='#fff' cx='25' cy='25' r='2'/></svg>",
      keyElements: [],
      filters: []
    },
    beforeConstructionFunctions: {},
    afterConstructionFunctions: {
      makeInfoWindow: function(chart) {
        //Make Info Window
        chart.other.infoWindow = document.createElement("section");
        chart.other.infoWindow.className = "infoWindowContainer";
        chart.other.infoWindow.id = "infoWindow";

        chart.other.infoWindow.close = document.createElement("span");
        chart.other.infoWindow.close.className = "close";
        chart.other.infoWindow.close.id = "iwclose";
        chart.other.infoWindow.close.innerHTML = "+";

        chart.other.infoWindow.appendChild(chart.other.infoWindow.close);
        chart.graph.controls[google.maps.ControlPosition.RIGHT_TOP].push(chart.other.infoWindow);
      },
      makePlaces: function(chart) {

        //Init Array
        chart.data.processedPlaces = [];

        //Loop Over Places Adding to Map
        for (var i = 0; i < chart.data.chart.places.length; i++) {

          //Ignore Places that Have No Name
          if (chart.data.chart.places[i].name) {

            //Create Marker
            chart.data.processedPlaces[i] = new google.maps.Marker({
              position: new google.maps.LatLng(chart.data.chart.places[i].location.lat, chart.data.chart.places[i].location.lon),
              map: null,
              name: chart.data.chart.places[i].name,
              //timesVisited: chart.data.chart.places[i].timesVisited,
              id: chart.data.chart.places[i].id,
              draggable: true,
              size: 1,
              icon: {
                url: "data:image/svg+xml;charset=utf-8;base64," + window.btoa(chart.other.placeIcon),
                anchor: new google.maps.Point(25, 25)
              }
            });

            //InfoWindow on Click
            google.maps.event.addListener(chart.data.processedPlaces[i], 'click', function() {
              console.log(this);
              //   var infoWindow = new google.maps.InfoWindow({
              //     content: this.name + ":" + this.timesVisited,
              //     position: this.position
              //   });
              //   infoWindow.open(chart.graph);

              outputToInfoWindow(this, [{
                name: "Name",
                func: "name"
              }], document.getElementById("infoWindow"));
            });
          }
        }

        //Make Place Toggle
        chart.other.placeToggle = document.createElement("section");
        chart.other.placeToggle.className = "standaloneToggle off";
        chart.other.placeToggle.on = false;
        chart.other.placeToggle.id = "placeToggle";
        chart.other.placeToggle.innerHTML = "Places";
        chart.other.placeToggle.addEventListener("click", function() {
          if (this.on === false) {
            this.classList.remove("off");
            this.classList.add("on");
            this.on = true;
            chart.data.processedPlaces.map(function(a) {
              a.setMap(chart.graph);
            });
          } else {
            this.classList.remove("on");
            this.classList.add("off");
            this.on = false;
            chart.data.processedPlaces.map(function(a) {
              a.setMap(null);
            });
          }
        });

        chart.graph.controls[google.maps.ControlPosition.RIGHT_CENTER].push(chart.other.placeToggle);

      },
      makePolylines: function(chart) {

        //Create DataFilter
        chart.other.dataFilter = new DataFilter();
        chart.data.filtered = [];

        //Create dateSlider Container
        chart.other.dateSlider = document.createElement("section");
        chart.other.dateSlider.className = "dateSliderContainer";
        chart.other.dateSlider.id = "dateSlider";
        chart.other.dateSlider.rangeObj = {
          from: {},
          to: {},
          timestampArray: []
        };

        //Create HUD
        chart.other.dateSlider.hud = document.createElement("div");
        chart.other.dateSlider.hud.className = "dateSliderHud";

        //Create Readings
        chart.other.dateSlider.hud.from = document.createElement("p");
        chart.other.dateSlider.hud.from.id = "textFrom";
        chart.other.dateSlider.hud.from.className = "dateSliderHudText";

        chart.other.dateSlider.hud.to = document.createElement("p");
        chart.other.dateSlider.hud.to.id = "textTo";
        chart.other.dateSlider.hud.to.className = "dateSliderHudText";

        //Child Readings
        chart.other.dateSlider.hud.appendChild(chart.other.dateSlider.hud.from);
        chart.other.dateSlider.hud.appendChild(chart.other.dateSlider.hud.to);

        //Child HUD
        chart.other.dateSlider.appendChild(chart.other.dateSlider.hud);

        //Push to Map
        chart.graph.controls[google.maps.ControlPosition.TOP_CENTER].push(chart.other.dateSlider);


        //Create Key
        chart.other.key = document.createElement("section");
        chart.other.key.className = "key";
        chart.other.key.id = "key";
        chart.other.key.entries = [];
        chart.other.key.typeMask = [];
        chart.graph.controls[google.maps.ControlPosition.LEFT_CENTER].push(chart.other.key);

        //Main
        chart.data.processedPaths = [];
        chart.other.bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < chart.data.chart.paths.length; i++) {
          if (chart.data.chart.paths[i] !== null) {
            chart.data.processedPaths[i] = new google.maps.Polyline(_.assign(chart.data.chart.paths[i], {
              bounds: new google.maps.LatLngBounds(),
              path: chart.data.chart.paths[i].points.map(function(p) {
                var l = new google.maps.LatLng(p.lat, p.lon);
                chart.other.bounds.extend(l);
                return l;
              }),
              geodesic: true,
              strokeOpacity: 0.4,
              strokeWeight: 2.5,
              startTime: moment(chart.data.chart.paths[i].points[0].time, "YYYYMMDDThhmmss+ZZ"),
              endTime: moment(chart.data.chart.paths[i].points[chart.data.chart.paths[i].points.length - 1].time, "YYYYMMDDThhmmss+ZZ")
            }));
            chart.data.chart.paths[i].points.forEach(function(p) {
              var l = new google.maps.LatLng(p.lat, p.lon);
              chart.data.processedPaths[i].bounds.extend(l);
            });

            //Populate Min & Max Dates
            chart.other.dateSlider.rangeObj.timestampArray.push(chart.data.processedPaths[i].startTime.clone().startOf("day").valueOf());
            chart.other.dateSlider.rangeObj.timestampArray.push(chart.data.processedPaths[i].endTime.clone().endOf("day").valueOf());

            //Populate Key
            if ([].filter.call(chart.other.key.childNodes, function(node) {
                return node.id == chart.data.processedPaths[i].type;
              }).length < 1) {
              chart.other.key.typeMask[i] = chart.data.processedPaths[i].type;

              chart.other.key.entries[i] = document.createElement("span");
              chart.other.key.entries[i].innerHTML = convertCase(chart.data.processedPaths[i].type);
              chart.other.key.entries[i].i = i;
              chart.other.key.entries[i].on = true;
              chart.other.key.entries[i].chart = chart;
              chart.other.key.entries[i].id = chart.data.chart.paths[i].type;
              chart.other.key.entries[i].className = "toggle on";
              chart.other.key.entries[i].style.cssText = "border-color: " + chart.data.chart.paths[i].strokeColor + ";" + "background: " + chart.data.chart.paths[i].strokeColor + ";" + "";

              chart.other.key.entries[i].addEventListener("click", function() {
                console.log(this.chart);
                var chart = this.chart;
                var thisOne = chart.data.processedPaths[this.i];

                if (this.on === true) {
                  this.classList.remove("on");
                  this.classList.add("off");

                  chart.other.key.typeMask.splice(chart.other.key.typeMask.indexOf(thisOne.type), 1);
                  chart.other.dataFilter.remove('type');
                  chart.other.dataFilter.add('type', '==', chart.other.key.typeMask);
                  chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                  chart.data.processedPaths.forEach(function(p) {
                    p.setMap(null);
                  });
                  chart.data.filtered.forEach(function(p) {
                    p.setMap(chart.graph);
                  });
                  this.on = false;
                } else {
                  this.classList.remove("off");
                  this.classList.add("on");

                  chart.other.key.typeMask.push(thisOne.type);
                  chart.other.dataFilter.remove('type');
                  chart.other.dataFilter.add('type', '==', chart.other.key.typeMask);
                  chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                  chart.data.processedPaths.forEach(function(p) {
                    p.setMap(null);
                  });
                  chart.data.filtered.forEach(function(p) {
                    p.setMap(chart.graph);
                  });
                  this.on = true;
                }
              });

              chart.other.key.appendChild(chart.other.key.entries[i]);
            }


            //Zoom Map
            chart.graph.fitBounds(chart.other.bounds);

            google.maps.event.addListener(chart.data.processedPaths[i], 'click', function(event) {
              console.log(this);
              chart.other.holdMapPos = {
                zoom: chart.graph.getZoom(),
                center: chart.graph.getCenter()
              };
              chart.graph.fitBounds(this.bounds);


              // var infoWindow = new google.maps.InfoWindow({
              //   content: this.inKm().toFixed(2) + "km" + "</br>" + this.startTime.format("dddd, MMMM Do YYYY, h:mm:ss a"),
              //   position: event.latLng
              // });
              // infoWindow.open(chart.graph);
              outputToInfoWindow(this, [{
                name: "Start",
                func: function(o) {
                  return o.startTime.format("HH:mm, dd Do MMM YY")
                }
              }, {
                name: "End",
                func: function(o) {
                  return o.endTime.format("HH:mm, dd Do MMM YY");
                }
              }, {
                name: "Speed",
                func: function(o) {
                  return (o.inKm()/o.endTime.diff(o.startTime, 'hours',true)).toFixed(2) + "km/h";
                }
              }, {
                name: "Distance",
                func: function(o) {
                  return o.inKm().toFixed(2) + "km";
                }
              }, {
                name: "Type",
                func: function(o) {
                  return convertCase(o.type);
                }
              }], document.getElementById("infoWindow"), function() {
                chart.graph.setZoom(chart.other.holdMapPos.zoom);
                chart.graph.setCenter(chart.other.holdMapPos.center);
                chart.other.dataFilter.remove('uuid');
                chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                chart.data.processedPaths.forEach(function(p) {
                  p.setMap(null);
                });
                chart.data.filtered.forEach(function(p) {
                  p.setMap(chart.graph);
                });
              });


              var thisOne = this;
              chart.other.dataFilter.add('uuid', '==', thisOne.uuid);
              chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
              chart.data.processedPaths.forEach(function(p) {
                p.setMap(null);
              });
              chart.data.filtered.forEach(function(p) {
                p.setMap(chart.graph);
              });

              // google.maps.event.addListener(infoWindow, 'closeclick', function() {
              //   chart.graph.setZoom(chart.other.holdMapPos.zoom);
              //   chart.graph.setCenter(chart.other.holdMapPos.center);
              //   chart.other.dataFilter.remove('uuid');
              //   chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
              //   chart.data.processedPaths.forEach(function(p) {
              //     p.setMap(null);
              //   });
              //   chart.data.filtered.forEach(function(p) {
              //     p.setMap(chart.graph);
              //   });
              // });


            });
          }

        }

        //Copy processedPaths to filtered
        chart.data.filtered = chart.data.processedPaths.slice(0);
        chart.data.filtered.forEach(function(p) {
          p.setMap(chart.graph);
        });

        //Create Sliders

        //Slider Update function
        chart.other.dateSlider.updateFunction = function(chart) {
          chart.other.dataFilter.remove('startTime');
          chart.other.dataFilter.remove('endTime');

          chart.other.dataFilter.add('startTime', function(a, b) {
            if (a.isAfter(b) || a.isSame(b, 'day')) {
              return true;
            } else {
              return false;
            }
          }, chart.other.dateSlider.rangeObj.from.date);

          chart.other.dataFilter.add('endTime', function(a, b) {
            if (a.isBefore(b) || a.isSame(b, 'day')) {
              return true;
            } else {
              return false;
            }
          }, chart.other.dateSlider.rangeObj.to.date);

          chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
          chart.data.processedPaths.forEach(function(p) {
            p.setMap(null);
          });
          chart.data.filtered.forEach(function(p) {
            p.setMap(chart.graph);
          });
          console.log(chart.other.dataFilter.conditions);
        }

        //From
        chart.other.dateSliderFrom = document.createElement("input");
        chart.other.dateSliderFrom.type = "range";
        chart.other.dateSliderFrom.step = 86400000;
        chart.other.dateSliderFrom.min = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderFrom.max = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderFrom.value = chart.other.dateSliderFrom.min;
        chart.other.dateSliderFrom.className = "dateSlider";
        chart.other.dateSliderFrom.id = "dateSliderFrom";

        //On 'Drag'
        chart.other.dateSliderFrom.addEventListener('input', function() {
          document.getElementById('textFrom').innerHTML = moment(this.valueAsNumber).format("ddd, Do MMMM YY");
        });

        //On End of 'Drag'
        chart.other.dateSliderFrom.addEventListener('mouseup', function() {
          chart.other.dateSlider.rangeObj.from.date = moment(this.valueAsNumber);
          chart.other.dateSlider.rangeObj.from.raw = this.valueAsNumber;
          console.log("From: " + chart.other.dateSlider.rangeObj.from.date);

          //Apply Filter
          // chart.data.processedPaths.map(function(a) {
          //   //console.log(a.type + " " + thisOne.type);
          //   if ((a.startTime.isAfter(chart.other.dateSlider.rangeObj.from.date) || a.startTime.isSame(chart.other.dateSlider.rangeObj.from.date, 'day'))
          //        && (a.endTime.isBefore(chart.other.dateSlider.rangeObj.to.date) || a.endTime.isSame(chart.other.dateSlider.rangeObj.to.date, 'day'))) {
          //     a.setMap(chart.graph);
          //   } else {
          //     a.setMap(null);
          //   }
          //
          // });

          chart.other.dateSlider.updateFunction(chart);
        });

        //Push
        chart.other.dateSlider.appendChild(chart.other.dateSliderFrom);

        //Set Initial Values
        chart.other.dateSlider.rangeObj.from.date = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSlider.rangeObj.from.raw = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);


        //To
        chart.other.dateSliderTo = document.createElement("input");
        chart.other.dateSliderTo.type = "range";
        chart.other.dateSliderTo.step = 86400000;
        chart.other.dateSliderTo.min = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderTo.max = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderTo.value = chart.other.dateSliderTo.max;
        chart.other.dateSliderTo.className = "dateSlider";
        chart.other.dateSliderTo.id = "dateSliderTo";

        //On 'Drag'
        chart.other.dateSliderTo.addEventListener('input', function() {
          document.getElementById('textTo').innerHTML = moment(this.valueAsNumber).format("ddd, Do MMMM YY");
        });

        //On End of 'Drag'
        chart.other.dateSliderTo.addEventListener('mouseup', function() {
          chart.other.dateSlider.rangeObj.to.date = moment(this.valueAsNumber);
          chart.other.dateSlider.rangeObj.to.raw = this.valueAsNumber;
          console.log("To: " + chart.other.dateSlider.rangeObj.to.date);

          chart.other.dateSlider.updateFunction(chart);
        });

        //Push
        chart.other.dateSlider.appendChild(chart.other.dateSliderTo);

        //Set Initial Values
        chart.other.dateSlider.rangeObj.to.date = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSlider.rangeObj.to.raw = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);

      }
    }
  }
};
