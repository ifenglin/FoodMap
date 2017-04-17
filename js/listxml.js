function download_list(save_list){
      if (save_list.length !== 0){
          console.log('preparing data...');
          var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'xml');
          var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'list');   
          doc.documentElement.appendChild(body);
          for (sublist of save_list) {
//              console.log('sublist:'+sublist.sublist_name);
              var node_sublist = document.createElement('sublist');
              var node_sublist_name = document.createTextNode(sublist.sublist_name);
              node_sublist.append(node_sublist_name);
              for (item of sublist.places){
//                  console.log('place:'+item.place.name);
                  var node_place = document.createElement('place');
                  var node_name = document.createTextNode(item.place.name);
                  node_place.setAttribute('id', item.place.place_id);   
                  node_place.append(node_name);
                  node_sublist.appendChild(node_place);
              }
              body.appendChild(node_sublist);
          }
          //console.log(doc.getElementById('abc')); 
          //xml = doc.getElementById('abc');
          var xmlText = new XMLSerializer().serializeToString(doc);
          var blob = new Blob([xmlText], {type: "text/plain;charset=utf-8"});
          saveAs(blob, "my_list.xml");
      } else {
          console.log('Download has been requested but the list is empty.');
      }
}

function read_list(callback){
    // callback function is used to wait for FileReader to finish loading
    var uploads = document.getElementById("upload");
    var txt = "";
    var reader = new FileReader();
    if ('files' in uploads) {
        if (uploads.files.length == 0) {
            txt += "No files selected.";
        } else {
            for (var i = 0; i < uploads.files.length; i++) {
                reader.readAsText(uploads.files[i]);
                var file = uploads.files[i];
                if ('name' in file) {
                    txt += "name: " + file.name + "\n";
                }
                if ('size' in file) {
                    txt += "size: " + file.size + " bytes \n";
                }          
            }
        }
        reader.onload = function(event) {
            console.log(reader.result);
            callback(cook_list(reader.result));
        };      
    } 
    else {
        if (uploads.value == "") {
            txt += "Select one or more files.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt += "<br>The path of the selected file: " + uploads.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    console.log(txt);
}

function cook_sub_list(sublist_id, places, callback){
    var sub_list = [];
    for (var i=0; i< places.length ; i++){
        var a_place = places[i];
        console.log(a_place.childNodes[0].nodeValue+':'+a_place.getAttribute('id'));
        service.getDetails({
                placeId: a_place.getAttribute('id')
              }, function(place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var new_place = {
                        'place': place,
                        'marker': createMarkers(place)
                    };
                    console.log('Insert ' + new_place.place.name + ' to list: ' + sublist_id);
                    sub_list.push(new_place);
                    insert_saved_places_row(sublist_id, new_place);
                    bounds.extend(place.geometry.location);
                    map.fitBounds(bounds);
                } else {
                    console.log("Google Places Service failed: " + status);
                }
        });
    }
    callback(sub_list);
}

function cook_list(text){
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text, 'text/xml');
    var node_list = xmlDoc.getElementsByTagName('list')[0];
    if (node_list === undefined) {
        console.log('Tag "list" is not found in the uploaded xml file.');
        return;
    }
    var new_list = [];
    var sublists = node_list.getElementsByTagName('sublist');
     $('#saved_places').empty();
    console.log('Number of sublists:' + sublists.length);
    for ( var i = 0; i < sublists.length; i++){
        var node_sublist = sublists[i];
        var sublist_name = node_sublist.childNodes[0].nodeValue;
        var sublist_id = i;
        console.log('Insert sublist to list: ' + sublist_name);
        insert_saved_places_sublist(sublist_id, sublist_name);
        var places = node_sublist.getElementsByTagName('place'); 
        cook_sub_list(sublist_id, places, function(sub_list){
            new_list.push({
                'sublist_id' : i,
                'sublist_name': sublist_name,
                'places': sub_list
                }); 
            console.log('Sublist '+ sublist_name + ' cooked:');
            console.log(sub_list)
        });
    }
    return new_list;
}