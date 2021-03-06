// Generated by CoffeeScript 1.8.0

/**
ProcessWire Map Markup (JS)

Renders maps for the FieldtypeMapMarker module

ProcessWire 2.x
Copyright (C) 2013 by Ryan Cramer
Licensed under GNU/GPL v2, see LICENSE.TXT

http://processwire.com

Javascript Usage:
=================
var map = new MarkupGoogleMap();
map.setOption('any-google-maps-option', 'value');
map.setOption('zoom', 12); // example

// init(container ID, latitude, longitude):
map.init('#map-div', 26.0936823, -77.5332796);

// addMarker(latitude, longitude, optional URL, optional URL to icon file):
map.addMarker(26.0936823, -77.5332796, 'en.wikipedia.org/wiki/Castaway_Cay', '');
map.addMarker(...you may have as many of these as you want...);

// optionally fit the map to the bounds of the markers you added
map.fitToMarkers();
 */
var MarkupGoogleMap;

MarkupGoogleMap = void 0;

(function($, undefined_) {
  var MY_MAPTYPE_ID;
  MY_MAPTYPE_ID = "BOXCALF";
  google.maps.event.addDomListener(window, "load", initMarkupGoogleMaps);
  return MarkupGoogleMap = function() {
    this.map = null;
    this.markers = [];
    this.numMarkers = 0;
    this.icon = "";
    this.hoverBox = null;
    this.hoverBoxOffsetTop = 0;
    this.hoverBoxOffsetLeft = 0;
    this.options = {
      zoom: 10,
      center: null,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.TERRAIN, MY_MAPTYPE_ID]
      },
      mapTypeId: MY_MAPTYPE_ID,
      scaleControl: false
    };

    /*
        mapResponse = []
        $.getJSON "http://localhost/dropbox/boxcalf.es/site/modules/FieldtypeMapMarker/mapStyle.json", (data) ->
          mapResponse = JSON.stringify(data)
          console.log mapResponse
          return
        @styles = mapResponse
     */
    this.styles = [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [
          {
            color: "#cccccc"
          }, {
            weight: 0.1
          }, {
            lightness: 68
          }
        ]
      }, {
        featureType: "poi",
        elementType: "all",
        stylers: [
          {
            visibility: "simplified"
          }, {
            saturation: -100
          }, {
            lightness: 10
          }
        ]
      }, {
        featureType: "landscape",
        elementType: "all",
        stylers: [
          {
            visibility: "on"
          }, {
            saturation: -100
          }, {
            lightness: 65
          }
        ]
      }, {
        featureType: "road.highway",
        elementType: "all",
        stylers: [
          {
            saturation: -100
          }
        ]
      }, {
        featureType: "road.arterial",
        elementType: "all",
        stylers: [
          {
            visibility: "on"
          }, {
            saturation: -100
          }, {
            lightness: 30
          }
        ]
      }, {
        featureType: "road.local",
        elementType: "all",
        stylers: [
          {
            visibility: "on"
          }, {
            saturation: -100
          }, {
            lightness: 40
          }
        ]
      }, {
        featureType: "transit",
        elementType: "all",
        stylers: [
          {
            visibility: "simplified"
          }, {
            saturation: -100
          }
        ]
      }, {
        featureType: "administrative.province",
        elementType: "all",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          {
            saturation: -100
          }, {
            lightness: -25
          }
        ]
      }
    ];

    /*
     * VARS
     */
    this.styledMapOptions = {
      name: "BOXCALF"
    };
    this._currentURL = "";
    this.setMarkerContent = function(marker, text, id, selector) {
      var item, items;
      item = document.getElementById(id);
      items = document.body.querySelectorAll(selector);
      marker.setContent(text);
    };
    this.setJqueryMarkerContent = function(marker, id) {
      var content;
      content = document.getElementById("contact-headline");
      marker.setContent(content);
    };
    this.init = function(mapID, lat, lng) {
      if (lat !== 0) {
        this.options.center = new google.maps.LatLng(lat, lng);
      }
      this.styledMap = new google.maps.StyledMapType(this.styles, this.styledMapOptions);
      this.map = new google.maps.Map(document.getElementById(mapID), this.options);
      this.map.mapTypes.set(MY_MAPTYPE_ID, this.styledMap);
      this.map.setMapTypeId(MY_MAPTYPE_ID);
    };
    this.setOption = function(key, value) {
      this.options[key] = value;
    };
    this.setIcon = function(url) {
      this.icon = url;
    };
    this.setHoverBox = function(markup) {
      var $hoverBox;
      if (!markup.length) {
        this.hoverBox = null;
        return;
      }
      this.hoverBox = $(markup);
      $hoverBox = this.hoverBox;
      this.hoverBoxOffsetTop = parseInt($hoverBox.attr("data-top"));
      this.hoverBoxOffsetLeft = parseInt($hoverBox.attr("data-left"));
      $("body").append($hoverBox);
      $hoverBox.css({
        position: "absolute",
        left: 0,
        top: "-100px"
      });
      $hoverBox.mouseout(function() {
        $hoverBox.hide();
      }).click(function() {
        if (this._currentURL.length > 0) {
          window.location.href = this._currentURL;
        }
      });
    };
    this.addMarker = function(lat, lng, url, title, icon, body, tel, class_name, imgsrc, imgid) {
      var $hoverBox, latLng, marker, markerOptions, mouseMove, offsetLeft, offsetTop, zIndex;
      if (lat === 0.0) {
        return;
      }
      latLng = new google.maps.LatLng(lat, lng);
      zIndex = 99990 + this.numMarkers;
      markerOptions = {
        position: latLng,
        map: this.map,
        linkURL: "",
        zIndex: zIndex
      };
      if (icon.length > 0) {
        markerOptions.icon = icon;
      } else {
        if (this.icon.length > 0) {
          markerOptions.icon = this.icon;
        }
      }
      marker = new google.maps.Marker(markerOptions);
      if (url.length > 0) {
        marker.linkURL = url;
      }
      if (this.hoverBox) {
        marker.hoverBoxTitle = title;
      } else {
        marker.setTitle(title);
      }
      this.markers[this.numMarkers] = marker;
      this.numMarkers++;
      if (marker.linkURL.length > 0) {
        google.maps.event.addListener(marker, "click", function(e) {
          window.location.href = marker.linkURL;
        });
      }
      if (this.hoverBox) {
        $hoverBox = this.hoverBox;
        offsetTop = this.hoverBoxOffsetTop;
        offsetLeft = this.hoverBoxOffsetLeft;
        mouseMove = function(e) {
          $hoverBox.css({
            top: e.pageY + offsetTop,
            left: e.pageX + offsetLeft
          });
        };
        google.maps.event.addListener(marker, "mouseover", function(e) {
          this._currentURL = url;
          $hoverBox.html("<span>" + marker.hoverBoxTitle + "</span>").css("top", "0px").css("left", "0px").css("display", "block").css("width", "auto").css("z-index", 9999);
          $hoverBox.show();
          $(document).mousemove(mouseMove);
        });
        google.maps.event.addListener(marker, "mouseout", function(e) {
          $hoverBox.hide();
          $(document).unbind("mousemove", mouseMove);
        });
      }
      this.addRichMarker(lat, lng, url, title, body, tel, class_name, imgsrc, imgid);
    };

    /*
     * richmarker
     */
    this.addRichMarker = function(lat, lng, url, title, body, tel, class_name, imgsrc, imgid) {
      var btnGroup, count, latLng, panelBtn, panelBtnTel, panelTitle, richmarker, richmarkerOptions, zIndex;
      if (lat === 0.0) {
        return;
      }
      latLng = new google.maps.LatLng(lat, lng);
      zIndex = 99990 + this.numMarkers;
      panelTitle = title;
      panelBtn = "<a class=\"btn btn-flat\" href=\"https://www.google.es/maps?ff=q&source=embed&hl=es&geocode&q=" + title + "&sll=" + lat + "," + lng + "&ie=UTF8\">" + body + "</a>";
      panelBtnTel = "<a class=\"btn btn-flat\" href=\"tel:" + tel + "\">" + tel + "</a>";
      btnGroup = "<div class=\"btn-group btn-group-justified\">" + panelBtn + panelBtnTel + "</div>";
      richmarkerOptions = {
        position: latLng,
        map: this.map,
        draggable: false,
        anchor: RichMarkerPosition[class_name],
        shadow: '0 0 0 rgba(0,0,0,0.0)',
        content: '<div class="panel"><div class="panel-heading"><h3 class="panel-title">' + title + '</h3></div>' + '<div class="panel-body panel-xs">' + panelBtn + '<br>' + panelBtnTel + '</div></div>'
      };
      richmarker = new RichMarker(richmarkerOptions);
      this.setMarkerContent(richmarker, richmarkerOptions.content, "contactHeadline", ".credits");
      richmarker.setMap(this.map);
      google.maps.event.addListener(richmarker, "position_changed", function() {
        console.log("Marker position: " + marker.getPosition());
      });
      count = 1;
      return google.maps.event.addListener(richmarker, "click", function() {
        console.log("richmarker clicked: " + count++);
      });
    };

    /*
     * fitToMarkers
     */
    this.specialStyles = function() {
      console.log('@specialStyles');
      return $('.panel-heading').find('h3').each(function() {
        var index, word;
        word = $(this).html().trim();
        index = word.indexOf(' ');
        if (index === -1) {
          index = word.length;
        }
        if (word.substring(0, index) === 'Boxcalf') {
          return $(this).html('<span class="first-word boxcalf">' + '&nbsp;' + '</span>' + word.substring(index, word.length));
        } else {
          return $(this).html('<span class="first-word kalam">' + word.substring(0, index) + '</span>' + word.substring(index, word.length));
        }
      });
    };
    this.fitToMarkers = function() {
      var bounds, i, latLng, listener, map;
      bounds = new google.maps.LatLngBounds();
      map = this.map;
      i = 0;
      while (i < this.numMarkers) {
        latLng = this.markers[i].position;
        bounds.extend(latLng);
        i++;
      }
      map.fitBounds(bounds);
      listener = google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() >= 20) {
          map.setZoom(17);
        }
        google.maps.event.removeListener(listener);
      });
    };
  };
})(window.jQuery);
