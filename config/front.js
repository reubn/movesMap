//jshint camelcase: true,es3: true,newcap: true,unused: true,browser: true, node: true, nonstandard: true, loopfunc: true
var movesMap = {
  movementGraph: {
    name: "movementGraph",
    url: "../data/map.json",
    newConstructor: true,
    specialConstructor: L.map,
    type: "Map",
    config: {
      center: new L.latLng(52.5, -2.7),
      zoom: 1,
      worldCopyJump: true,
      layers: [L.tileLayer('//{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={at}', _.assign(((Math.floor(Math.random() * 2)) ? ({
        at: "pk.eyJ1IjoicmV1Ym5uIiwiYSI6IkdwNWk5eXcifQ.ACZOaLvBQTPi24WU8LYUXg",
        id: "reubnn.5ea8bb0f"
      }) : ({
        at: "pk.eyJ1IjoicmV1Ym5uMiIsImEiOiJwekJZZmRVIn0.rFB5X09HJ41dDGkcZKE34A",
        id: "reubnn2.pstw3ik9"
      })), {
        detectRetina: true,
        reuseTiles: true
      }))]
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
      filters: [],
      drawFilters: []
    },
    beforeConstructionFunctions: {},
    afterConstructionFunctions: {
      makeUpdateButton: function(chart) {
        //Init ProgressButton
        new UIProgressButton(document.getElementById('update'), {
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
              console.log(xmlhttp.readyState + " " + xmlhttp.status.toString()[0]);
              if (xmlhttp.readyState == 4 && xmlhttp.status.toString()[0] == "2") {
                //Updated
                console.log("good");
                progbtn.stop(1);
                location.reload();
              } else if (xmlhttp.readyState == 4 && xmlhttp.status.toString()[0] != "2") {
                console.log("bad");
                progbtn.stop(-1);
              }
            };

            xmlhttp.open("GET", "/update", true);
            xmlhttp.send();
          }
        });
      },
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

        //Display
        document.body.insertBefore(chart.other.infoWindow, chart.canvas);
      },
      makePlaces: function(chart) {

        //Init Array
        chart.data.processedPlaces = [];

        //Loop Over Places Adding to Map
        for (var i = 0; i < chart.data.chart.places.length; i++) {

          //Ignore Places that Have No Name
          if (chart.data.chart.places[i].name) {

            //Create Marker
            chart.data.processedPlaces[i] = new L.marker(new L.latLng(chart.data.chart.places[i].location.lat, chart.data.chart.places[i].location.lon), _.assign(chart.data.chart.places[i], {
              icon: new L.icon({
                iconUrl: "data:image/svg+xml;charset=utf-8;base64," + window.btoa(chart.other.placeIcon),
                iconRetinaUrl: "data:image/svg+xml;charset=utf-8;base64," + window.btoa(chart.other.placeIcon),
                iconAnchor: [25, 25]
              })
            }));

            //InfoWindow on Click
            chart.data.processedPlaces[i].addEventListener('click', function() {
              console.log(this);
              outputToInfoWindow(this, [{
                name: "Name",
                func: "options.name"
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
              chart.graph.addLayer(a);
            });
          } else {
            this.classList.remove("on");
            this.classList.add("off");
            this.on = false;
            chart.data.processedPlaces.map(function(a) {
              chart.graph.removeLayer(a);
            });
          }
        });

        //Display
        document.body.insertBefore(chart.other.placeToggle, chart.canvas);

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

        //Display
        document.body.insertBefore(chart.other.dateSlider, chart.canvas);


        //Create Key
        chart.other.key = document.createElement("section");
        chart.other.key.className = "key";
        chart.other.key.id = "key";
        chart.other.key.entries = [];
        chart.other.key.typeMask = [];

        //Display
        document.body.insertBefore(chart.other.key, chart.canvas);


        //Main
        chart.data.processedPaths = [];
        //chart.other.bounds = L.latLngBounds();
        for (var i = 0; i < chart.data.chart.paths.length; i++) {
          if (chart.data.chart.paths[i] !== null) {
            chart.data.processedPaths[i] = L.polyline(chart.data.chart.paths[i].points.map(function(p) {
              var l = new L.LatLng(p.lat, p.lon);
              l.time = moment(p.time, "YYYYMMDDThhmmss+ZZ");
              if (chart.other.bounds) {
                chart.other.bounds.extend(l);
              } else {
                chart.other.bounds = new L.latLngBounds(l);
              }
              return l;
            }), _.assign(chart.data.chart.paths[i], {
              geodesic: true,
              opacity: 0.4,
              weight: 2.5,
              lineCap: "round",
              lineJoin: "round",
              color: chart.data.chart.paths[i].strokeColor,
              startTime: moment(chart.data.chart.paths[i].points[0].time, "YYYYMMDDThhmmss+ZZ"),
              endTime: moment(chart.data.chart.paths[i].points[chart.data.chart.paths[i].points.length - 1].time, "YYYYMMDDThhmmss+ZZ")
            }));

            //Populate Min & Max Dates
            chart.other.dateSlider.rangeObj.timestampArray.push(chart.data.processedPaths[i].options.startTime.clone().startOf("day").valueOf());
            chart.other.dateSlider.rangeObj.timestampArray.push(chart.data.processedPaths[i].options.endTime.clone().endOf("day").valueOf());

            //Populate Key
            if ([].filter.call(chart.other.key.childNodes, function(node) {
                return node.id == chart.data.processedPaths[i].options.type;
              }).length < 1) {
              chart.other.key.typeMask[i] = chart.data.processedPaths[i].options.type;

              chart.other.key.entries[i] = document.createElement("span");
              chart.other.key.entries[i].innerHTML = convertCase(chart.data.processedPaths[i].options.type);
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

                  chart.other.key.typeMask.splice(chart.other.key.typeMask.indexOf(thisOne.options.type), 1);
                  chart.other.dataFilter.remove('options.type');
                  chart.other.dataFilter.add('options.type', '==', chart.other.key.typeMask);
                  chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                  chart.data.processedPaths.forEach(function(p) {
                    chart.graph.removeLayer(p);
                  });
                  chart.data.filtered.forEach(function(p) {
                    chart.graph.addLayer(p);
                  });
                  this.on = false;
                } else {
                  this.classList.remove("off");
                  this.classList.add("on");

                  chart.other.key.typeMask.push(thisOne.options.type);
                  console.log(thisOne);
                  chart.other.dataFilter.remove('options.type');
                  chart.other.dataFilter.add('options.type', '==', chart.other.key.typeMask);
                  chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                  console.log(chart.data.filtered);
                  chart.data.processedPaths.forEach(function(p) {
                    chart.graph.removeLayer(p);
                  });
                  chart.data.filtered.forEach(function(p) {
                    chart.graph.addLayer(p);
                  });
                  this.on = true;
                }
              });

              chart.other.key.appendChild(chart.other.key.entries[i]);
            }


            //Zoom Map
            chart.graph.fitBounds(chart.other.bounds);

            chart.data.processedPaths[i].addEventListener('click', function() {
              console.log(this);
              chart.other.holdMapPos = {
                zoom: chart.graph.getZoom(),
                center: chart.graph.getCenter()
              };
              chart.graph.fitBounds(this.getBounds());

              chart.other.speedPoly = L.speedSplit(this, 1000);
              chart.graph.removeLayer(this);
              chart.graph.addLayer(chart.other.speedPoly);
              console.log(this);

              outputToInfoWindow(this, [{
                name: "Start",
                func: function(o) {
                  return o.options.startTime.format("HH:mm, dd Do MMM YY");
                }
              }, {
                name: "End",
                func: function(o) {
                  return o.options.endTime.format("HH:mm, dd Do MMM YY");
                }
              }, {
                name: "Speed",
                func: function(o) {
                  return (o.measureDistance() / o.options.endTime.diff(o.options.startTime, 'hours', true)).toFixed(2) + "km/h";
                }
              }, {
                name: "Distance",
                func: function(o) {
                  return o.measureDistance().toFixed(2) + "km";
                }
              }, {
                name: "Type",
                func: function(o) {
                  return convertCase(o.options.type);
                }
              }], document.getElementById("infoWindow"), function() {
                console.log(this);

                chart.graph.addLayer(this);
                chart.graph.removeLayer(chart.other.speedPoly);

                chart.graph.setView(chart.other.holdMapPos.center, chart.other.holdMapPos.zoom);
                chart.other.dataFilter.remove('options.uuid');
                chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
                chart.data.processedPaths.forEach(function(p) {
                  chart.graph.removeLayer(p);
                });
                chart.data.filtered.forEach(function(p) {
                  chart.graph.addLayer(p);
                });
              });


              var thisOne = this;
              chart.other.dataFilter.add('options.uuid', '==', thisOne.options.uuid);
              chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
              chart.data.processedPaths.forEach(function(p) {
                chart.graph.removeLayer(p);
              });
              // chart.data.filtered.forEach(function(p) {
              //   chart.graph.addLayer(p);
              // });

              // google.maps.event.addListener(infoWindow, 'closeclick', function() {
              //   chart.graph.setZoom(chart.other.holdMapPos.zoom);
              //   chart.graph.setCenter(chart.other.holdMapPos.center);
              //   chart.other.dataFilter.remove('options.uuid');
              //   chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
              //   chart.data.processedPaths.forEach(function(p) {
              //     chart.graph.removeLayer(p);
              //   });
              //   chart.data.filtered.forEach(function(p) {
              //     chart.graph.addLayer(p);
              //   });
              // });


            });
          }

        }

        //Copy processedPaths to filtered
        chart.data.filtered = chart.data.processedPaths.slice(0);
        chart.data.filtered.forEach(function(p) {
          chart.graph.addLayer(p);
        });

        //Create Sliders

        //Slider Update function
        chart.other.dateSlider.updateFunction = function(chart) {
          chart.other.dataFilter.remove('options.startTime');
          chart.other.dataFilter.remove('options.endTime');

          chart.other.dataFilter.add('options.startTime', function(a, b) {
            if (a.isAfter(b) || a.isSame(b, 'day')) {
              return true;
            } else {
              return false;
            }
          }, chart.other.dateSlider.rangeObj.from.date);

          chart.other.dataFilter.add('options.endTime', function(a, b) {
            if (a.isBefore(b) || a.isSame(b, 'day')) {
              return true;
            } else {
              return false;
            }
          }, chart.other.dateSlider.rangeObj.to.date);

          chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
          chart.data.processedPaths.forEach(function(p) {
            chart.graph.removeLayer(p);
          });
          chart.data.filtered.forEach(function(p) {
            chart.graph.addLayer(p);
          });
          console.log(chart.other.dataFilter.conditions);
        };

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
          //     chart.graph.addLayer(a);
          //   } else {
          //     chart.graph.removeLayer(a);
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

        //Draw filters
        chart.other.drawing = new L.Draw.Polygon(chart.graph).enable();

        chart.graph.on('draw:created', function(e) {
          var thisOne = e.layer;
          //chart.other.drawFilters.push(thisOne);
          console.log(thisOne);
          chart.other.dataFilter.remove('_latlngs');
          chart.other.dataFilter.add('_latlngs', function(sourceValue, conditionValue) {
            console.log(sourceValue);
            console.log(conditionValue);
            var result = _.every(sourceValue.map(function(point) {
              return pip(point, conditionValue.holder);
            }));
            console.log(result);
            return result;
          }, {holder: thisOne._latlngs});
          chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
          chart.data.processedPaths.forEach(function(p) {
            chart.graph.removeLayer(p);
          });
          chart.data.filtered.forEach(function(p) {
            chart.graph.addLayer(p);
          });

          chart.graph.addLayer(thisOne);

          thisOne.addEventListener("dblclick",function(){
            chart.other.dataFilter.remove('_latlngs');
            chart.data.filtered = chart.other.dataFilter.match(chart.data.processedPaths);
            chart.data.processedPaths.forEach(function(p) {
              chart.graph.removeLayer(p);
            });
            chart.data.filtered.forEach(function(p) {
              chart.graph.addLayer(p);
            });

            chart.graph.removeLayer(this);
            delete this;
          })
        });

      }
    }
  }
};
