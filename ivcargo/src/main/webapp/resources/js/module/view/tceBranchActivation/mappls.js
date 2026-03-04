	var map, Marker1, marker;

    function initMap1() {
		
		 var locationData = localStorage.getItem('branchLocationData');
		 
		     var parsedData = JSON.parse(locationData);


		var latitude  = parsedData.latitude;
		var longitude = parsedData.longitude;
		
		if(latitude == undefined || latitude == null || latitude == 1)
			latitude = 28.09;
		if(longitude == undefined || longitude == null || longitude == 1)
			longitude = 78.3;
		
		
      map = new mappls.Map('map', {
        center: [parseFloat(latitude), parseFloat(longitude)],
        zoomControl: true,
        location: true
      });
      Marker1 = new mappls.Marker({
        map: map,
        position: {
          "lat": parseFloat(latitude),
          "lng": parseFloat(longitude)
        },
        fitbounds: true,
        icon_url: 'https://apis.mapmyindia.com/map_v3/1.png'
      });
         
       map.addListener('click', function(e) {
			        var lngLat = e.lngLat;
			        // Get reference to the main window
    var mainWindow = window.opener || window.parent;

    // Write content to the main window
    mainWindow.document.getElementById('latitude').value = parseFloat(lngLat.lat);
    mainWindow.document.getElementById('longitude').value = parseFloat(lngLat.lng);
    
      alert('Latitude & Longitude Data Of Branch Has Been Selected ');
      
      window.close();

  });
  
  	 map.addListener('load',function(){
                var optional_config = {
                    /* location: [28.61, 77.23], */
                    region: "IND",
                    height:300,
                    searchChars:8
                };
                new mappls.search(document.getElementById("auto"), optional_config, callback);
                function callback(data) {
                    console.log(data);
                    if (data) {
                        var dt = data[0];
                        if (!dt) return false;
                        var eloc = dt.eLoc;
                        var place = dt.placeName + ", " + dt.placeAddress;
                        /*Use elocMarker Plugin to add marker*/
                        if (marker) marker.remove();
                        mappls.pinMarker({
                            map: map,
                            pin: eloc,
                            popupHtml: place,
                            popupOptions: {
                                openPopup: true
                            }
                        }, function(data){
                            marker=data;
                            marker.fitbounds();
                        })
                    }
                }
            });
      
    }
