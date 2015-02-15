//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
var me = {
  movementGraph: {
    name: "movementGraph",
    url: "../data/map.json",
    classes: "ones",
    specialConstructor: google.maps.Map,
    desc: "Movement",
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
      placeIcon: "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='{{SIZE}}' height='{{SIZE}}' viewBox='0 0 {{SIZE}} {{SIZE}}'><circle opacity='0.1' fill='{{HEX}}' cx='{{SIZE/2}}' cy='{{SIZE/2}}' r='{{SIZE/2}}'/><circle fill='{{HEX}}' cx='{{SIZE/2}}' cy='{{SIZE/2}}' r='2'/></svg>",
      keyElements: [],
      filters: []
    },
    beforeConstructionFunctions: {},
    afterConstructionFunctions: {
      // makePlaces: function (chart) {
      //
      //     //Init Array
      //     chart.data.processedPlaces = [];
      //
      //     //Calculate Min and Mix
      //     chart.other.aMax = 0;
      //     chart.data.chart.places.map(function (a) {
      //         if (chart.other.aMax < a.timesVisited) {
      //             chart.other.aMax = a.timesVisited;
      //         }
      //     });
      //     chart.other.aMin = Infinity;
      //     chart.data.chart.places.map(function (a) {
      //         if (chart.other.aMin > a.timesVisited) {
      //             chart.other.aMin = a.timesVisited;
      //         }
      //     });
      //
      //     //Loop Over Places Adding to Map
      //     for (var i = 0; i < chart.data.chart.places.length; i++) {
      //
      //         //Ignore Places that Have No Name
      //         if (chart.data.chart.places[i].name) {
      //
      //             //Create Marker
      //             chart.data.processedPlaces[i] = new google.maps.Marker({
      //                 position: new google.maps.LatLng(chart.data.chart.places[i].lat, chart.data.chart.places[i].lon),
      //                 map: null,
      //                 name: chart.data.chart.places[i].name,
      //                 timesVisited: chart.data.chart.places[i].timesVisited,
      //                 zIndex: 1000 - chart.data.chart.places[i].timesVisited,
      //                 id: chart.data.chart.places[i].id,
      //                 size: ((chart.other.placeSizeMax - chart.other.placeSizeMin) * ((chart.data.chart.places[i].timesVisited - chart.other.aMin) / (chart.other.aMax - chart.other.aMin))) + chart.other.placeSizeMin,
      //                 icon: {
      //                     url: "data:image/svg+xml;charset=utf-8;base64," + ((chart.other.diffColourSize === true) ? (window.btoa(chart.other.placeIcon.replace(/\{\{HEX\}\}/g, chart.data.chart.places[i].color).replace(/\{\{SIZE\}\}/g, (((chart.other.placeSizeMax - chart.other.placeSizeMin) * ((chart.data.chart.places[i].timesVisited - chart.other.aMin) / (chart.other.aMax - chart.other.aMin))) + chart.other.placeSizeMin)).replace(/\{\{SIZE\/2\}\}/g, (((chart.other.placeSizeMax - chart.other.placeSizeMin) * ((chart.data.chart.places[i].timesVisited - chart.other.aMin) / (chart.other.aMax - chart.other.aMin))) + chart.other.placeSizeMin) / 2))) : (window.btoa(chart.other.placeIcon.replace(/\{\{HEX\}\}/g, "#00AEEF").replace(/\{\{SIZE\}\}/g, 60).replace(/\{\{SIZE\/2\}\}/g, 30)))),
      //                     anchor: (chart.other.diffColourSize === true) ? (new google.maps.Point((((chart.other.placeSizeMax - chart.other.placeSizeMin) * ((chart.data.chart.places[i].timesVisited - chart.other.aMin) / (chart.other.aMax - chart.other.aMin))) + chart.other.placeSizeMin) / 2, (((chart.other.placeSizeMax - chart.other.placeSizeMin) * ((chart.data.chart.places[i].timesVisited - chart.other.aMin) / (chart.other.aMax - chart.other.aMin))) + chart.other.placeSizeMin) / 2)) : (new google.maps.Point(30, 30))
      //                 }
      //             });
      //
      //             //InfoWindow on Click
      //             google.maps.event.addListener(chart.data.processedPlaces[i], 'click', function () {
      //                 console.log(this);
      //                 var infoWindow = new google.maps.InfoWindow({
      //                     content: this.name + ":" + this.timesVisited,
      //                     position: this.position
      //                 });
      //                 infoWindow.open(chart.graph);
      //             });
      //         }
      //     }
      //
      //     //Make Place Toggle
      //     chart.other.placeToggle = document.createElement("section");
      //     chart.other.placeToggle.className = "standaloneToggle off";
      //     chart.other.placeToggle.on = false;
      //     chart.other.placeToggle.id = "placeToggle";
      //     chart.other.placeToggle.innerHTML = "Places";
      //     chart.other.placeToggle.addEventListener("click", function () {
      //         if (this.on === false) {
      //             this.className = this.className.replace(/(\soff\s|\soff$)/g, " on");
      //             this.on = true;
      //             chart.data.processedPlaces.map(function (a) {
      //                 a.setMap(chart.graph);
      //             });
      //         } else {
      //             this.className = this.className.replace(/(\son\s|\son$)/g, " off");
      //             this.on = false;
      //             chart.data.processedPlaces.map(function (a) {
      //                 a.setMap(null);
      //             });
      //         }
      //     });
      //
      //     chart.graph.controls[google.maps.ControlPosition.RIGHT_CENTER].push(chart.other.placeToggle);
      //
      // },
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
            chart.data.processedPaths[i] = new google.maps.Polyline({
              path: chart.data.chart.paths[i].points.map(function(p) {
                var l = new google.maps.LatLng(p.lat, p.lon);
                chart.other.bounds.extend(l);
                return l;
              }),
              geodesic: true,
              strokeColor: chart.data.chart.paths[i].strokeColor,
              type: chart.data.chart.paths[i].type,
              strokeOpacity: 0.4,
              strokeWeight: 2.5,
              startTime: moment(chart.data.chart.paths[i].points[0].time, "YYYYMMDDThhmmss+ZZ"),
              endTime: moment(chart.data.chart.paths[i].points[chart.data.chart.paths[i].points.length - 1].time, "YYYYMMDDThhmmss+ZZ")
            });

            //Populate Min & Max Dates
            chart.other.dateSlider.rangeObj.timestampArray.push(moment(chart.data.processedPaths[i].startTime.valueOf()).startOf("day"));
            chart.other.dateSlider.rangeObj.timestampArray.push(moment(chart.data.processedPaths[i].endTime.valueOf()).endOf("day"));

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
                  this.className = this.className.replace(/on/g, "off");

                  // chart.data.processedPaths.map(function (a) {
                  //     //console.log(a.type + " " + thisOne.type);
                  //     if (a.type == thisOne.type) {
                  //         a.setMap(null);
                  //     }
                  //
                  // });
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
                  this.className = this.className.replace(/off/g, "on");

                  // chart.data.processedPaths.map(function(a) {
                  //   //console.log(a.type + " " + thisOne.type);
                  //   if (a.type == thisOne.type) {
                  //     a.setMap(chart.graph);
                  //   }
                  // });
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
              //<span class="toggle on" style="color: #00d55a">Walking</span>
            }


            //Zoom Map
            chart.graph.fitBounds(chart.other.bounds);

            //Right Click Group Select
            /*google.maps.event.addListener(chart.data.processedPaths[i], 'rightclick', function (event) {
                        console.log(this);
                                    var infowindow = new google.maps.InfoWindow({
                                        content: convertCase(this.type) + "</br>" + this.inKm().toFixed(2) + "km",
                                        position: event.latLng
                                    }); infowindow.open(chart.graph);
                        var thisOne = this;
                        chart.data.processedPaths.map(function (a) {
                            //console.log(a.type + " " + thisOne.type);
                            if (a.type != thisOne.type) {
                                a.setMap(null);
                            }
                        });
                        google.maps.event.addListener(chart.graph, 'click', function (event) {
                            chart.data.processedPaths.map(function (a) {
                                a.setMap(chart.graph);
                            });
                        });
                    });*/

            google.maps.event.addListener(chart.data.processedPaths[i], 'click', function(event) {
              console.log(this);
              var infoWindow = new google.maps.InfoWindow({
                content: this.inKm().toFixed(2) + "km" + "</br>" + this.startTime.format("dddd, MMMM Do YYYY, h:mm:ss a"),
                position: event.latLng
              });
              infoWindow.open(chart.graph);
              var thisOne = this;
              //FIX THIS

              // chart.data.processedPaths.map(function(a) {
              //   if (a !== thisOne) {
              //     a.setMap(null);
              //   }
              // });
              // google.maps.event.addListener(infoWindow, 'closeclick', function() {
              //   chart.data.processedPaths.map(function(a) {
              //     a.setMap(chart.graph);
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

        //From
        chart.other.dateSliderFrom = document.createElement("input");
        chart.other.dateSliderFrom.type = "range";
        chart.other.dateSliderFrom.step = 86400000;
        chart.other.dateSliderFrom.min = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderFrom.max = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderFrom.value = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
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

          chart.other.dataFilter.remove('startTime');
          //chart.other.dataFilter.remove('endTime');


          chart.other.dataFilter.add('startTime', function(a, b) {
            if ((a.isAfter(b) || a.isSame(b, 'day'))) {
              return true;
            } else {
              return false
            }
          }, chart.other.dateSlider.rangeObj.from.date);

          chart.other.dataFilter.add('endTime', function(a, b) {
            if ((a.isBefore(b) || a.isSame(b, 'day'))) {
              return true;
            } else {
              return false
            }
          }, chart.other.dateSlider.rangeObj.to.date);

          chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
          chart.data.processedPaths.forEach(function(p) {
            p.setMap(null);
          });
          chart.data.filtered.forEach(function(p) {
            p.setMap(chart.graph);
          });

          //Reset Key
          // chart.other.key.entries.map(function(a) {
          //   if (a.on === false) {
          //     a.className = a.className.replace(/off/g, "on");
          //     a.on = true;
          //   }
          // });
        });

        //Push
        chart.other.dateSlider.appendChild(chart.other.dateSliderFrom);

        //Set Initial Values
        chart.other.dateSlider.rangeObj.from.date = moment(Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray));
        chart.other.dateSlider.rangeObj.from.raw = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);


        //To
        chart.other.dateSliderTo = document.createElement("input");
        chart.other.dateSliderTo.type = "range";
        chart.other.dateSliderTo.step = 86400000;
        chart.other.dateSliderTo.min = Math.min.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderTo.max = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
        chart.other.dateSliderTo.value = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);
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

          //Apply Filter
          // chart.data.processedPaths.map(function(a) {
          //   //console.log(a.type + " " + thisOne.type);
          //   if (a.startTime.isAfter(chart.other.dateSlider.rangeObj.from.date) && a.endTime.isBefore(chart.other.dateSlider.rangeObj.to.date)) {
          //     a.setMap(chart.graph);
          //   } else {
          //     a.setMap(null);
          //   }
          //
          // });

          //chart.other.dataFilter.remove('startTime');
          chart.other.dataFilter.remove('endTime');

          chart.other.dataFilter.add('startTime', function(a, b) {
            if (a.isAfter(b)) {
              return true;
            } else {
              return false
            }
          }, chart.other.dateSlider.rangeObj.from.date);

          chart.other.dataFilter.add('endTime', function(a, b) {
            if (a.isBefore(b)) {
              return true;
            } else {
              return false
            }
          }, chart.other.dateSlider.rangeObj.to.date);

          chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
          chart.data.processedPaths.forEach(function(p) {
            p.setMap(null);
          });
          chart.data.filtered.forEach(function(p) {
            p.setMap(chart.graph);
          });

          //
          // //Reset Key
          // chart.other.key.entries.map(function(a) {
          //   if (a.on === false) {
          //     a.className = a.className.replace(/off/g, "on");
          //     a.on = true;
          //   }
          // });
        });

        //Push
        chart.other.dateSlider.appendChild(chart.other.dateSliderTo);

        //Set Initial Values
        chart.other.dateSlider.rangeObj.to.date = moment(Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray));
        chart.other.dateSlider.rangeObj.to.raw = Math.max.apply(Math, chart.other.dateSlider.rangeObj.timestampArray);

      }
    }
  }
};
