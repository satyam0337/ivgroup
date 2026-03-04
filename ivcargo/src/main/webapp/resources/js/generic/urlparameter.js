$.urlParam = function(name){
	//fetches all parameter of current URL as key value pair 
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
		return null;
	}
	else{
		return results[1] || 0;
	}
}

define(function(require) {
	return {
		//this method receives propertyname from URL and return the value 
		//corresponding to that key 
		getModuleNameFromParam:function(propertyName){
			return $.urlParam(propertyName);
		}
	}
})