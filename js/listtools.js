//// #saved_place
function insert_saved_places_sublist(sublist_id, sublist_name){
    $('#saved_places').append('<th id="' + sublist_id + '">' + sublist_name + '</th>'); 
}

function insert_saved_places_row(sublist_id, a_place){
    var place_id = a_place.place.place_id;
    $('<tr class="clickable-row" id="' + sublist_id + '-' + place_id + '"><td>' + a_place.place.name + 
      '<button class="btn-warning remove" style="display:none" onclick="remove_saved_list_row('+ sublist_id + ',\'' + place_id+ '\')">remove</button>' +
      '</td></tr>').insertAfter('#saved_places th#' + sublist_id).click(function() {
        var placeId = place_id;
        geocoder.geocode({'placeId': placeId}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            map.setZoom(15);
            map.setCenter(results[0].geometry.location);
            infowindow.setContent(getContentString(a_place.place)); 
            infowindow.open(map, a_place.marker);
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });
    });
}

function remove_saved_list_row(sublist_id, place_id){
    console.log('remove ' + sublist_id + '-' + place_id);
    console.log(save_list);
    $('#saved_places tr#' + sublist_id + '-' + place_id).remove();
    var sublist_index = save_list.findIndex(function(a_sublist){
        return a_sublist.sublist_id === sublist_id;
    })
    save_list[sublist_index].places.splice(save_list[sublist_index].places.findIndex(function(a_place){
        return a_place.place.place_id === place_id;
    }), 1);
    
    // remove sublist if empty after removal
    if (save_list[sublist_index].places.length === 0){
        save_list.splice(sublist_index, 1);
        $('#saved_places th#' + sublist_id).remove();
    }
    console.log(save_list);
}

function clean_list(){
    save_list = [];
    sublist_counter = 0;
    $("#saved_places").empty();
}

function edit_list(){
    $(".remove").toggle();
}