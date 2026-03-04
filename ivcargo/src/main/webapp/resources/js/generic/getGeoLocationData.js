/**
 * 
 */

 
 function getcurrentPosition(){
 	var allowToSave = getCookie('geoLocationSaved');
 	if(allowToSave == undefined || !(allowToSave == true || allowToSave == 'true')){
	 	navigator.geolocation.getCurrentPosition(position => {
		  const { latitude, longitude } = position.coords;
			updateBranch(latitude,longitude)
		  saveBranchGeoLocationData(latitude, longitude);
		});
 	}
 }
 
 
 function updateBranch(latitude,longitude){
	 var jsonObject					= new Object();
		
		jsonObject.longitude		= longitude;
		jsonObject.latitude			= latitude;
		$.ajax({
			type		: 	"POST",
			url			: 	'BranchMasterAction.do?pageId=209&eventId=1&filter=2&isGeoLocation=true&longitude='+longitude+'&latitude='+latitude+'',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				var expDate = new Date();
				
			}
		});
 }
 
 function saveBranchGeoLocationData(latitude, longitude) {
	
	var jsonObject					= new Object();
	
	jsonObject.longitude		= longitude;
	jsonObject.latitude			= latitude;
	jsonObject.executiveId		= localStorage.getItem("executiveIdCheck");
	
	$.ajax({
		type		: 	"POST",
		url			: 	'/ivwebservices/geoLocationWS/saveBranchGeoLocationData.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			var expDate = new Date();
	
			setCookie('geoLocationSaved', true, 36000);
			
			document.cookie = "geoLocationSaved=true; expires=expDate";
			
		}
	});
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, expMinutes) {
  const d = new Date();
  d.setTime(d.getTime() + (expMinutes * 10 * 365 * 24 * 60 * 60));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
 