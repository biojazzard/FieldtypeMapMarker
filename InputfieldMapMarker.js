/**
 * Display a Google Map and pinpoint a location for InputfieldMapMarker
 *
 */

// Create an array of styles.

/* SHOWN ON ADMIN */

var mapOptions = {
	zoom: 11,
	center: new google.maps.LatLng(50.957433837969454, -114.20762548217772),
	styles: mapStyle
};

var styles = [
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#cccccc"
            },
            {
                "weight": 0.1
            },
            {
                "lightness": 68
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 10
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 65
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 30
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "saturation": -100
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": -25
            }
        ]
    }
];

var InputfieldMapMarker = {

	options: {
		zoom: 12, // mats, previously 5
		draggable: true, // +mats
		center: null,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		scrollwheel: false,
		mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, 'map_style']
    },
		scaleControl: false
	},	


	init: function(mapId, lat, lng, zoom, mapType) {

		var options = InputfieldMapMarker.options; 

		if(zoom < 1) zoom = 12; 
		options.center = new google.maps.LatLng(lat, lng);
		options.zoom = parseInt(zoom); 

		if(mapType == 'SATELLITE') options.mapTypeId = google.maps.MapTypeId.SATELLITE; 
			else if(mapType == 'ROADMAP') options.mapTypeId = google.maps.MapTypeId.ROADMAP; 

		// Create a new StyledMapType object, passing it the array of styles,
		// as well as the name to be displayed on the map type control.
		var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

		var map = new google.maps.Map(document.getElementById(mapId), options);

		//Associate the styled map with the MapTypeId and set it to display.
		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');

		var marker = new google.maps.Marker({
			position: options.center, 
			map: map,
			draggable: options.draggable	
		}); 

		var $map = $('#' + mapId); 
		var $lat = $map.siblings(".InputfieldMapMarkerLat").find("input[type=text]");
		var $lng = $map.siblings(".InputfieldMapMarkerLng").find("input[type=text]");
		var $addr = $map.siblings(".InputfieldMapMarkerAddress").find("input[type=text]"); 
		var $addrJS = $map.siblings(".InputfieldMapMarkerAddress").find("input[type=hidden]"); 
		var $toggle = $map.siblings(".InputfieldMapMarkerToggle").find("input[type=checkbox]");
		var $zoom = $map.siblings(".InputfieldMapMarkerZoom").find("input[type=number]");
		var $notes = $map.siblings(".notes");

		$lat.val(marker.getPosition().lat());
		$lng.val(marker.getPosition().lng());
		$zoom.val(map.getZoom()); 

		google.maps.event.addListener(marker, 'dragend', function(event) {
			var geocoder = new google.maps.Geocoder();
			var position = this.getPosition();
			$lat.val(position.lat());
			$lng.val(position.lng());
			if($toggle.is(":checked")) {
				geocoder.geocode({ 'latLng': position }, function(results, status) {
					if(status == google.maps.GeocoderStatus.OK && results[0]) {
						$addr.val(results[0].formatted_address);	
						$addrJS.val($addr.val()); 
					}
					$notes.text(status);
				});
			}
		});

		google.maps.event.addListener(map, 'zoom_changed', function() {
			$zoom.val(map.getZoom()); 
		}); 

		$addr.blur(function() {
			if(!$toggle.is(":checked")) return true;
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({ 'address': $(this).val()}, function(results, status) {
				if(status == google.maps.GeocoderStatus.OK && results[0]) {
					var position = results[0].geometry.location;
					map.setCenter(position);
					marker.setPosition(position);
					$lat.val(position.lat());
					$lng.val(position.lng());
					$addrJS.val($addr.val()); 
				}
				$notes.text(status); 
			});
			return true;	
		}); 

		$zoom.change(function() {
			map.setZoom(parseInt($(this).val())); 
		}); 

		$toggle.click(function() {
			if($(this).is(":checked")) {
				$notes.text('Geocode ON');
				// google.maps.event.trigger(marker, 'dragend'); 
				$addr.trigger('blur');
			} else {
				$notes.text('Geocode OFF');
			}
			return true;
		});

		// added by diogo to solve the problem of maps not rendering correctly in hidden elements
		// trigger a resize on the map when either the tab button or the toggle field bar are pressed

		// get the tab element where this map is integrated
		var $tab = $('#_' + $(map.b).closest('.InputfieldFieldsetTabOpen').attr('id'));
		// get the inputfield where this map is integrated and add the tab to the stack
		var $inputFields = $(map.b).closest('.Inputfield').find('.InputfieldStateToggle').add($tab);

		$inputFields.on('click',function(){
			// give it time to open
			window.setTimeout(function(){
				google.maps.event.trigger(map,'resize');
				map.setCenter(options.center); 
			}, 200);
		});
		
	}
};

$(document).ready(function() {
	$(".InputfieldMapMarkerMap").each(function() {
		var $t = $(this);
		InputfieldMapMarker.init($t.attr('id'), $t.attr('data-lat'), $t.attr('data-lng'), $t.attr('data-zoom'), $t.attr('data-type')); 
	}); 
}); 
