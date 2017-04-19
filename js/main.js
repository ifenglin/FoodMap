var map;
var service;
var geocoder;
var infowindow;
var markers = [];
var save_list = [];
var select_list = [];
var bounds;
var show_POI="off", show_streets="off";
var sublist_counter=0;

function initMap() {
  var pyrmont = {lat: 52.5200, lng: 13.4550};
  geocoder = new google.maps.Geocoder;
  //default map styles
  var myStyles = getMapOptions(show_POI, show_streets);
  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 15,
//    clickableIcons: false,
    styles: myStyles
  });
  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  service = new google.maps.places.PlacesService(map);
  newSearch(pyrmont);
    
  // register new button click event
  $('#new').click(function(){
      newSearch(map.getCenter());
  });
  

  // register POI button click event
  var POI_button = $('#poi');
  var message_panel = $('#message-panel');
  message_panel.hide();
  POI_button.click(function(){
    if(show_POI=='off'){
        show_POI = 'on';
        POI_button.text('Hide POIs');
        var text = "Click on a point of interest to search nearby restaurants."
        message_panel.text(text).show();
    } else {
        show_POI = 'off';
        POI_button.text('Show POIs');
        message_panel.text(text).hide();
    }
    var newStyles = getMapOptions(show_POI, show_streets);
    map.setOptions({styles: newStyles});
  });
    
  // register street button click event
  var street_button = $('#street');
  street_button.click(function(){
    if(show_streets=='off'){
        show_streets = 'on';
        street_button.text('Hide Streets');
    } else {
        show_streets = 'off';
        street_button.text('Show Streets');
    }
    var newStyles = getMapOptions(show_POI, show_streets)
    map.setOptions({styles: newStyles});
  });
  
  // register POI click event
  var clickHandler = new ClickEventHandler(map, pyrmont);
  var save_button = $('#save');
  var cancel_button = $('#cancel');
  save_button.hide();
  cancel_button.hide();
  save_button.click(function(){
      saveToList(select_list);
      releaseSelects();
      save_button.hide();
      cancel_button.hide();
  }); 
  cancel_button.click(function(){
      releaseSelects();
      save_button.hide();
      cancel_button.hide();
  }); 
  $('#download').click(function() {
      download_list(save_list);
  });
  $('#edit').click(function(){
      edit_list(); 
      $('.dropdown').hide();
      $('.done').show();
  });
  $('#clean').click(function(){
      clean_list(); 
  });
  $('#donebtn').click(function(){
      edit_list(); 
      $('.dropdown').show();
      $('.done').hide();
  });
  $('.done').hide();
}

function getContentString(place){
    return '<div>' +
        '<h4 style="display: inline;">' + place.name + '  </h4>' +
        (place.hasOwnProperty('opening_hours')? (place.opening_hours.open_now? '<h5 style="display: inline; color:green;">open now</h5>':
        '<h5 style="display: inline; color:red;">closed</h5>'):'') +
        '<h5>Rating: ' + place.rating + '</h5>' +
        (place.hasOwnProperty('reviews')?'<h5>Latest review: </h5>' + '<p><i>' + place.reviews[0].text + '</i></p>':'') +
//        (save_list.indexOf(place.place_id) !== -1 ? 
//         '<button class="btn-danger btn-save" id="' + place.place_id + '" onclick="removeFromList(\'' + place.place_id + '\');">Remove from the list.</button>' : 
//         
//         '<button class="btn-info btn-save" id="' + place.place_id + '" onclick="saveToList(\'' + [place.place_id] + '\', \''+ place.name +'\');">Save to the list!</button>') +
      '</div>';
}

function getMapOptions(show_poi, show_streets){
  var myStyles =[ {
    featureType: "poi",
    elementType: "labels",
    stylers: [
          { visibility: show_poi}
    ]}, {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "on" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: show_streets, }
      ]
    },{
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        { visibility: "on" }
      ]
    }
  ];
  return myStyles;
}

function newSearch(origin){
      for (marker of markers) {
          marker.setMap(null);
      }
      bounds = new google.maps.LatLngBounds();
      markers = [];
      $('#right-panel #inner-panel tbody').empty();
      service.nearbySearch({
          location: origin,
          radius: 2000,
          types: ['cafe', 'restaurant', 'meal_takeaway', 'meal_delivery']
      }, processResults);
}

function releaseSelects(){
  for (item of select_list){
        var image = {
              url: item.place.icon,
              size: new google.maps.Size(25, 25),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 0),
              scaledSize: new google.maps.Size(25, 25)
            };
        item.marker.setAnimation('');
        item.marker.setIcon(image);
  }
  select_list = [];
  infowindow.close(map);
}

//// event handler for clicks on the map
var ClickEventHandler = function(map, origin) {
    this.origin = origin;
    this.map = map;
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);
    this.placesService = new google.maps.places.PlacesService(map);
    this.infowindow = new google.maps.InfoWindow;
    this.infowindowContent = document.getElementById('infowindow-content');
    this.infowindow.setContent(this.infowindowContent);
    // Listen for clicks on the map.
    this.map.addListener('click', this.handleClick.bind(this));
};

ClickEventHandler.prototype.handleClick = function(event) {
//    console.log('You clicked on: ' + event.latLng);
    // If the event has a placeId, use it.
    if (event.placeId) {
      console.log('You clicked on place:' + event.placeId);
      // Calling e.stop() on the event prevents the default info window from
      // showing.
      // If you call stop here when there is no placeId you will prevent some
      // other map click event handlers from receiving the event.
      event.stop();
      this.searchNearbyPOI(event.placeId);
    }
};

ClickEventHandler.prototype.searchNearbyPOI = function(placeId) {
      service.getDetails({
                placeId: placeId
          }, function(place, status) {
              if ('geometry' in place){
                  newSearch(place.geometry.location);
              } else {
                  window.alert("Something is wrong with this point of interest. Try again?")
              }
              
      });
};
////

//// check if a property exists
$.fn.exists = function () {
    return this.length !== 0;
}

function processResults(results, status, pagination) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
  } else {
    // loop for create markers
    // set bounds for POIs on the map
    // var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place=results[i]; i++){
        service.getDetails({
            placeId: place.place_id
          }, function(place, status) {
            // check status and skip hotels and existing items
            if (status === google.maps.places.PlacesServiceStatus.OK && place.types.indexOf('lodging') === -1 &&
                !$("#places tr#"+place.place_id).exists()){
              createMarkers(place);
            }
          });
        // extend the maps to the new POI
        bounds.extend(place.geometry.location);
    }   
    var more_button = $("#more");
    if (pagination.hasNextPage) {
        pauseButtons(more=true);
        more_button.click(function() {
            pagination.nextPage();
        });
        // if there is too few results, paginate.
        if(markers.length < 5){
            pagination.nextPage();
        }
    } else {
        pauseButtons(more=false);
    }
    map.fitBounds(bounds);
  }
}

//// manage select list and save list
function saveToList(select_list) {
    var selectorString;
    sublist_name = 'Area ' + (sublist_counter+1);
    save_list.push({
        'sublist_id' : sublist_counter,
        'sublist_name': sublist_name,
        'places': select_list});
    insert_saved_places_sublist(sublist_counter, sublist_name);
    for (var i = 0; i< select_list.length; i++){
        insert_saved_places_row(sublist_counter, select_list[i]);
    }
    sublist_counter += 1;
}

function removeFromList(place_id) {
    var place_index = save_list.indexOf(place_id); 
    if (place_index !== -1) {
        console.log('Remove ' + place_id);
        save_list.splice(place_index, 1);
        remove_saved_list_row(sublist_id, place_id);
    } else {
        console.log('Error: ' + place_id + ' is not in the list.');
    }
}

function upload_list(){
    for (marker of markers) {
          marker.setMap(null);
      }
    bounds = new google.maps.LatLngBounds();
    markers = [];
    read_list( function(cooked_list){
        console.log('Set new save_list with:');
        console.log(cooked_list);
        save_list = cooked_list;
        sublist_counter = cooked_list.length;
    });  
}
////

function createMarkers(place) {
    // put a marker on the map
    var image = {
      url: place.icon,
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
      scaledSize: new google.maps.Size(25, 25)
    };

    var marker = new google.maps.Marker({
      map: map,
      icon: image,
      title: place.name,
      position: place.geometry.location
    });
    // push by reference
    markers.push(marker);
    
    // update place list and add click events
    $('<tr class="clickable-row" id="'+ place.place_id +'"><td>' + place.name + '</td><td>' + place.rating + '</td></tr>').appendTo('#places').click(
        function() {
        var placeId = this.id;
        geocoder.geocode({'placeId': placeId}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            map.setZoom(15);
            map.setCenter(results[0].geometry.location);
            infowindow.setContent(getContentString(place)); 
            infowindow.open(map, marker);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    });
    
    // register marker click event
    google.maps.event.addListener(marker, 'click', function(){
        // change icons to bouncing pikachus
        // if not yet selected
        if(marker.getAnimation() !== google.maps.Animation.BOUNCE){
            var image = {
              url: 'img/pikachu.png',
              size: new google.maps.Size(30, 60),
              origin: new google.maps.Point(0, -15),
              anchor: new google.maps.Point(0, 30),
              scaledSize: new google.maps.Size(30, 45)
            };
            select_list.push({
                'place': place,
                'marker': marker
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setIcon(image);
            infowindow.setContent(getContentString(place)); 
            infowindow.open(map, this);
        } else {
            var image = {
              url: place.icon,
              size: new google.maps.Size(25, 25),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 0),
              scaledSize: new google.maps.Size(25, 25)
            };
            marker.setAnimation('');
            marker.setIcon(image);
            select_list = select_list.filter(function( obj ) {
                return obj.place.place_id !== place.place_id;
            });
            infowindow.close(map, marker);
        }
        if (select_list.length === 0){
            $('#save').hide();
            $('#cancel').hide();
        } else{
            $('#save').show();
            $('#cancel').show();
        }
    });
    return marker;
}

//// pause buttons with async thread
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pauseButtons(more) {
    var more_button = $('#more');
    var new_button = $('#new');
    var time_to_wait = 5000
  
  // diable buttons
    more_button.attr('class', 'btn')
    more_button.prop('disabled', 'true');
    new_button.attr('class', 'btn')
    new_button.prop('disabled', 'true');
    new_button.text('Searching...');
//  console.log('Taking a break...');
    await sleep(time_to_wait);
//  console.log(time_to_wait+' ms later.');
    // enable buttons
    if(more){
        more_button.prop('disabled', false);
        more_button.attr('class', 'btn-primary');
    }
    new_button.prop('disabled', false);
    new_button.attr('class', 'btn-danger');
    new_button.text('New Search');
}
////