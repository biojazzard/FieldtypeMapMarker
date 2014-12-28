/**
 * ProcessWire Map Markup (JS)
 *
 * Renders maps for the FieldtypeMapMarker module
 * 
 * ProcessWire 2.x 
 * Copyright (C) 2013 by Ryan Cramer 
 * Licensed under GNU/GPL v2, see LICENSE.TXT
 * 
 * http://processwire.com
 *
 * Javascript Usage:
 * =================
 * var map = new MarkupGoogleMap();
 * map.setOption('any-google-maps-option', 'value'); 
 * map.setOption('zoom', 12); // example
 * 
 * // init(container ID, latitude, longitude):
 * map.init('#map-div', 26.0936823, -77.5332796); 
 * 
 * // addMarker(latitude, longitude, optional URL, optional URL to icon file):
 * map.addMarker(26.0936823, -77.5332796, 'en.wikipedia.org/wiki/Castaway_Cay', ''); 
 * map.addMarker(...you may have as many of these as you want...); 
 * 
 * // optionally fit the map to the bounds of the markers you added
 * map.fitToMarkers();
 *
 */

var MarkupGoogleMap;

/* SHOWN ON FRONTEND */

(function ($, undefined_) {

  //"use strict";

  var MY_MAPTYPE_ID = 'BOXCALF';

  google.maps.event.addDomListener(window, 'load', initMarkupGoogleMaps);

  MarkupGoogleMap = function () {

    this.map = null;
    this.markers = [];
    this.numMarkers = 0;
    this.icon = '';

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

    /* coffee

    mapResponse = []
    $.getJSON "http://localhost/dropbox/boxcalf.es/site/modules/FieldtypeMapMarker/mapStyle.json", (data) ->
      mapResponse = JSON.stringify(data)
      console.log mapResponse
      return

    @styles = mapResponse

    */

    this.styles = [{
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{
        "color": "#cccccc"
        }, {
            "weight": 0.1
        }, {
            "lightness": 68
        }]
    }, {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{
            "visibility": "simplified"
        }, {
            "saturation": -100
        }, {
            "lightness": 10
        }]
    }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{
            "visibility": "on"
        }, {
            "saturation": -100
        }, {
            "lightness": 65
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{
            "saturation": -100
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [{
            "visibility": "on"
        }, {
            "saturation": -100
        }, {
            "lightness": 30
        }]
    }, {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [{
            "visibility": "on"
        }, {
            "saturation": -100
        }, {
            "lightness": 40
        }]
    }, {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{
            "visibility": "simplified"
        }, {
            "saturation": -100
        }]
    }, {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": -25
        }]
    }];
    /*

    $.ajax({
      dataType: 'json',
      url: 'http://localhost/dropbox/boxcalf.es/site/modules/FieldtypeMapMarker/mapStyle.json',
      data: function(resp) {
        console.log(resp);
        this.styles = [resp];
      },
      success: function(resp) {
        console.log(resp);
        this.styles = [resp];
      },
      error: function() {

      }
    });

    */

    this.styledMapOptions = {
      name: 'BOXCALF'
    };

    this._currentURL = '';

    this.setMarkerContent = function(marker, text, id, selector) {
      var item = document.getElementById(id);
      items = document.body.querySelectorAll(selector);
      marker.setContent(text);
    }

    this.setJqueryMarkerContent = function(marker, id) {
      var content = document.getElementById('contact-headline');
      marker.setContent(content);
    }

    this.init = function(mapID, lat, lng) {
      if(lat !== 0) this.options.center = new google.maps.LatLng(lat, lng);
      // Create a new StyledMapType object, passing it the array of styles,
      // as well as the name to be displayed on the map type control.
      this.styledMap = new google.maps.StyledMapType(this.styles, this.styledMapOptions);
      // Original
      this.map = new google.maps.Map(document.getElementById(mapID), this.options);
      //Associate the styled map with the MapTypeId and set it to display.
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

      if(!markup.length) {
        this.hoverBox = null;
        return;
      }

      this.hoverBox = $(markup);
      var $hoverBox = this.hoverBox;

      this.hoverBoxOffsetTop = parseInt($hoverBox.attr('data-top')); 
      this.hoverBoxOffsetLeft = parseInt($hoverBox.attr('data-left')); 

      $("body").append($hoverBox);

      // keep it hidden/out of the way until needed
      $hoverBox.css({
        position: 'absolute',
        left: 0,
        top: '-100px'
      });

      $hoverBox.mouseout(function() {
        $hoverBox.hide();
      }).click(function() {
        if(this._currentURL.length > 0) window.location.href = this._currentURL;
      });
    };

    this.addMarker = function(lat, lng, url, title, icon, body, tel, class_name, imgsrc) {

      if(lat === 0.0) return;

      var latLng = new google.maps.LatLng(lat, lng); 
      var zIndex = 99990 + this.numMarkers;

      var markerOptions = {
        position: latLng, 
        map: this.map,
        linkURL: '',
        zIndex: zIndex
      };

      if(icon.length > 0) markerOptions.icon = icon;
        else if(this.icon.length > 0) markerOptions.icon = this.icon;

      var marker = new google.maps.Marker(markerOptions);

      if(url.length > 0) marker.linkURL = url;
      if(this.hoverBox) marker.hoverBoxTitle = title; 
        else marker.setTitle(title); 

      this.markers[this.numMarkers] = marker;
      this.numMarkers++;

      if(marker.linkURL.length > 0) {
        google.maps.event.addListener(marker, 'click', function(e) {
          window.location.href = marker.linkURL; 
        }); 
      }

      if(this.hoverBox) {

        var $hoverBox = this.hoverBox; 
        var offsetTop = this.hoverBoxOffsetTop;
        var offsetLeft = this.hoverBoxOffsetLeft; 

        var mouseMove = function(e) {
          $hoverBox.css({
            'top': e.pageY + offsetTop,
            'left': e.pageX + offsetLeft
            });
        }; 

        google.maps.event.addListener(marker, 'mouseover', function(e) {
          this._currentURL = url;
          $hoverBox.html("<span>" + marker.hoverBoxTitle + "</span>")
            .css('top', '0px')
            .css('left', '0px')
            .css('display', 'block')
            .css('width', 'auto')
            .css('z-index', 9999); 
          $hoverBox.show();

          $(document).mousemove(mouseMove); 
        }); 

        google.maps.event.addListener(marker, 'mouseout', function(e) {
          $hoverBox.hide();
          $(document).unbind("mousemove", mouseMove);
        });

      }

      this.addRichMarker(lat, lng, url, title, body, tel, class_name, imgsrc);

    };

    /* richmarker */

    this.addRichMarker = function(lat, lng, url, title, body, tel, class_name, imgsrc) {

      if(lat === 0.0) return;

      var latLng = new google.maps.LatLng(lat, lng); 
      var zIndex = 99990 + this.numMarkers;

      //https://www.google.es/maps?f=q&source=embed&hl=es&sll=43.262049,-2.934293&hq=BOXCALF,+Elcano+11,&hnear=Bilbao,+Vizcaya
      //https://www.google.es/maps?f=q&source=embed&hl=es&geocode&q=BOXCALF,+Elcano+11,+bilbao&sll=43.262049,-2.934293&sspn=0.008524,0.009913&ie=UTF8&hq=BOXCALF,+Elcano+11,&hnear=Bilbao,+Vizcaya,+Pa%C3%ADs+Vasco&t=h&layer=c&cbll=43.262007,-2.934419&panoid=30g6A51Zz7TFxuZEfVomUQ&cbp=13,50.56,,0,7.09&ll=43.258198,-2.932749&spn=0.00972,0.009871&z=15
          
      var panelTitle = title;

      var panelBtn = '<a class="btn btn-xs btn-default btn-block btn-abs-top" href="https://www.google.es/maps?ff=q&source=embed&hl=es&geocode&q=' + title + '&sll=' + lat + ',' + lng +'&ie=UTF8">' + body + '</a>';
      var panelBtnTel = '<a class="btn btn-lg btn-success btn-block btn-abs-bottom" href="tel:' + tel + '"><i class="md md-phone"></i> ' + tel + '</a>';
    

      var btnGroup = '<div class="btn-group btn-group-justified">' + panelBtn + panelBtnTel + '</div>';  
      
      var richmarkerOptions = {
        position: latLng, 
        map: this.map,
        draggable: false,
        anchor: RichMarkerPosition[class_name],
        shadow: '0 0 0 rgba(0,0,0,0.0)',
        content: '<div class="panel panel-primary"> \
                    <div class="panel-heading"><h3 class="panel-title text-right">' + title + '</h3></div>' + ' \
                      <div class="panel-body panel-xs" style="background-image:url(' + imgsrc + ');">' + panelBtn + panelBtnTel + '</div> \
                  </div>'
      };

      var richmarker = new RichMarker(richmarkerOptions);

      this.setMarkerContent(richmarker, richmarkerOptions.content, 'contactHeadline', '.credits');

      richmarker.setMap(this.map);

      google.maps.event.addListener(richmarker, 'position_changed', function() {
        console.log('Marker position: ' + marker.getPosition());
      });

      var count = 1;

      google.maps.event.addListener(richmarker, 'click', function() {
        console.log('richmarker clicked: ' + count++);
      });

    };

    /* fitToMarkers */

    this.fitToMarkers = function() {

      var bounds = new google.maps.LatLngBounds();
      var map = this.map;

      for(var i = 0; i < this.numMarkers; i++) {  
        var latLng = this.markers[i].position; 
        bounds.extend(latLng); 
      }

      map.fitBounds(bounds);

      var listener = google.maps.event.addListener(map, "idle", function() { 
        if(map.getZoom() < 2) map.setZoom(2); 
        google.maps.event.removeListener(listener); 
      });

    };
  }

})(window.jQuery);



