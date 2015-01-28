###*
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
###
MarkupGoogleMap = undefined

# SHOWN ON FRONTEND
(($, undefined_) ->

  #"use strict"

  MY_MAPTYPE_ID = "BOXCALF"

  # initMarkupGoogleMaps es la funcion que renderea el modulo MarkupGoogleMap.module

  google.maps.event.addDomListener window, "load", initMarkupGoogleMaps

  MarkupGoogleMap = ->
    @map = null
    @markers = []
    @numMarkers = 0
    @icon = ""
    @hoverBox = null
    @hoverBoxOffsetTop = 0
    @hoverBoxOffsetLeft = 0
    @options =
      zoom: 10
      center: null
      mapTypeControlOptions:
        mapTypeIds: [
          google.maps.MapTypeId.TERRAIN
          MY_MAPTYPE_ID
        ]

      mapTypeId: MY_MAPTYPE_ID
      scaleControl: false


    ###
        mapResponse = []
        $.getJSON "http://localhost/dropbox/boxcalf.es/site/modules/FieldtypeMapMarker/mapStyle.json", (data) ->
          mapResponse = JSON.stringify(data)
          console.log mapResponse
          return
        @styles = mapResponse
    ###


    @styles = [
      {
        featureType: "all"
        elementType: "geometry.fill"
        stylers: [
          {
            color: "#cccccc"
          }
          {
            weight: 0.1
          }
          {
            lightness: 68
          }
        ]
      }
      {
        featureType: "poi"
        elementType: "all"
        stylers: [
          {
            visibility: "simplified"
          }
          {
            saturation: -100
          }
          {
            lightness: 10
          }
        ]
      }
      {
        featureType: "landscape"
        elementType: "all"
        stylers: [
          {
            visibility: "on"
          }
          {
            saturation: -100
          }
          {
            lightness: 65
          }
        ]
      }
      {
        featureType: "road.highway"
        elementType: "all"
        stylers: [saturation: -100]
      }
      {
        featureType: "road.arterial"
        elementType: "all"
        stylers: [
          {
            visibility: "on"
          }
          {
            saturation: -100
          }
          {
            lightness: 30
          }
        ]
      }
      {
        featureType: "road.local"
        elementType: "all"
        stylers: [
          {
            visibility: "on"
          }
          {
            saturation: -100
          }
          {
            lightness: 40
          }
        ]
      }
      {
        featureType: "transit"
        elementType: "all"
        stylers: [
          {
            visibility: "simplified"
          }
          {
            saturation: -100
          }
        ]
      }
      {
        featureType: "administrative.province"
        elementType: "all"
        stylers: [visibility: "off"]
      }
      {
        featureType: "water"
        elementType: "geometry"
        stylers: [
          {
            saturation: -100
          }
          {
            lightness: -25
          }
        ]
      }
    ]

    ###
    # VARS
    ###

    @styledMapOptions = name: "BOXCALF"
    @_currentURL = ""

    @setMarkerContent = (marker, text, id, selector) ->
      item = document.getElementById(id)
      items = document.body.querySelectorAll(selector)
      marker.setContent text
      return

    @setJqueryMarkerContent = (marker, id) ->
      content = document.getElementById("contact-headline")
      marker.setContent content
      return

    @init = (mapID, lat, lng) ->
      @options.center = new google.maps.LatLng(lat, lng)  if lat isnt 0

      # Create a new StyledMapType object, passing it the array of styles,
      # as well as the name to be displayed on the map type control.
      @styledMap = new google.maps.StyledMapType(@styles, @styledMapOptions)

      # Original
      @map = new google.maps.Map(document.getElementById(mapID), @options)

      #Associate the styled map with the MapTypeId and set it to display.
      @map.mapTypes.set MY_MAPTYPE_ID, @styledMap
      @map.setMapTypeId MY_MAPTYPE_ID
      return

    @setOption = (key, value) ->
      @options[key] = value
      return

    @setIcon = (url) ->
      @icon = url
      return

    @setHoverBox = (markup) ->
      unless markup.length
        @hoverBox = null
        return
      @hoverBox = $(markup)
      $hoverBox = @hoverBox
      @hoverBoxOffsetTop = parseInt($hoverBox.attr("data-top"))
      @hoverBoxOffsetLeft = parseInt($hoverBox.attr("data-left"))
      $("body").append $hoverBox

      # keep it hidden/out of the way until needed
      $hoverBox.css
        position: "absolute"
        left: 0
        top: "-100px"

      $hoverBox.mouseout(->
        $hoverBox.hide()
        return
      ).click ->
        window.location.href = @_currentURL  if @_currentURL.length > 0
        return

      return

    @addMarker = (lat, lng, url, title, icon, body, tel, class_name, imgsrc, imgid) ->
      return  if lat is 0.0
      latLng = new google.maps.LatLng(lat, lng)
      zIndex = 99990 + @numMarkers
      markerOptions =
        position: latLng
        map: @map
        linkURL: ""
        zIndex: zIndex

      if icon.length > 0
        markerOptions.icon = icon
      else markerOptions.icon = @icon  if @icon.length > 0
      marker = new google.maps.Marker(markerOptions)
      marker.linkURL = url  if url.length > 0
      if @hoverBox
        marker.hoverBoxTitle = title
      else
        marker.setTitle title
      @markers[@numMarkers] = marker
      @numMarkers++
      if marker.linkURL.length > 0
        google.maps.event.addListener marker, "click", (e) ->
          window.location.href = marker.linkURL
          return

      if @hoverBox
        $hoverBox = @hoverBox
        offsetTop = @hoverBoxOffsetTop
        offsetLeft = @hoverBoxOffsetLeft
        mouseMove = (e) ->
          $hoverBox.css
            top: e.pageY + offsetTop
            left: e.pageX + offsetLeft

          return

        google.maps.event.addListener marker, "mouseover", (e) ->
          @_currentURL = url
          $hoverBox.html("<span>" + marker.hoverBoxTitle + "</span>").css("top", "0px").css("left", "0px").css("display", "block").css("width", "auto").css "z-index", 9999
          $hoverBox.show()
          $(document).mousemove mouseMove
          return

        google.maps.event.addListener marker, "mouseout", (e) ->
          $hoverBox.hide()
          $(document).unbind "mousemove", mouseMove
          return

      @addRichMarker lat, lng, url, title, body, tel, class_name, imgsrc, imgid

      return

    ###
    # richmarker
    ###

    @addRichMarker = (lat, lng, url, title, body, tel, class_name, imgsrc, imgid) ->
      return  if lat is 0.0
      latLng = new google.maps.LatLng(lat, lng)
      zIndex = 99990 + @numMarkers

      #https://www.google.es/maps?f=q&source=embed&hl=es&sll=43.262049,-2.934293&hq=BOXCALF,+Elcano+11,&hnear=Bilbao,+Vizcaya
      #https://www.google.es/maps?f=q&source=embed&hl=es&geocode&q=BOXCALF,+Elcano+11,+bilbao&sll=43.262049,-2.934293&sspn=0.008524,0.009913&ie=UTF8&hq=BOXCALF,+Elcano+11,&hnear=Bilbao,+Vizcaya,+Pa%C3%ADs+Vasco&t=h&layer=c&cbll=43.262007,-2.934419&panoid=30g6A51Zz7TFxuZEfVomUQ&cbp=13,50.56,,0,7.09&ll=43.258198,-2.932749&spn=0.00972,0.009871&z=15
      panelTitle = title
      panelBtn = "<a class=\"btn btn-flat\" href=\"https://www.google.es/maps?ff=q&source=embed&hl=es&geocode&q=" + title + "&sll=" + lat + "," + lng + "&ie=UTF8\">" + body + "</a>"
      panelBtnTel = "<a class=\"btn btn-flat\" href=\"tel:" + tel + "\">" + tel + "</a>"
      btnGroup = "<div class=\"btn-group btn-group-justified\">" + panelBtn + panelBtnTel + "</div>"
      richmarkerOptions =
        position: latLng
        map: @map
        draggable: false
        anchor: RichMarkerPosition[class_name]
        shadow: '0 0 0 rgba(0,0,0,0.0)'
        content: '<div class="panel">\
          <div class="panel-heading"><h3 class="panel-title">' + title + '</h3></div>' + '\
            <div class="panel-body panel-xs">' + panelBtn + '<br>' + panelBtnTel + '</div>\
          </div>'

      richmarker = new RichMarker(richmarkerOptions)
      @setMarkerContent richmarker, richmarkerOptions.content, "contactHeadline", ".credits"
      richmarker.setMap @map
      google.maps.event.addListener richmarker, "position_changed", ->
        console.log "Marker position: " + marker.getPosition()
        return

      count = 1
      google.maps.event.addListener richmarker, "click", ->
        console.log "richmarker clicked: " + count++
        return

    ###
    # fitToMarkers
    ###

    @specialStyles = ()->

      console.log '@specialStyles'

      $('.panel-heading').find('h3').each ->
        word = $(@).html().trim()
        index = word.indexOf(' ')
        index = word.length if index is -1
        if word.substring(0, index) == 'Boxcalf'
          $(@).html '<span class="first-word boxcalf">' + '&nbsp;' +  '</span>' + word.substring(index, word.length)
        else
          $(@).html '<span class="first-word kalam">' + word.substring(0, index) + '</span>' + word.substring(index, word.length)

    @fitToMarkers = ->
      bounds = new google.maps.LatLngBounds()
      map = @map
      i = 0

      while i < @numMarkers
        latLng = @markers[i].position
        bounds.extend latLng
        i++

      map.fitBounds bounds

      listener = google.maps.event.addListener(map, "idle", ->
        map.setZoom 17  if map.getZoom() >= 20
        google.maps.event.removeListener listener
        return
      )
      return

    return

  #return

) window.jQuery