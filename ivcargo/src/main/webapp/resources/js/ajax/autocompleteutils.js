/**
 * auto complete wrepper
 */
$.fn.autocompleteCustom = function (auto) {

	var configuration = new Object();

	// Check if primary key is passed or no default is "id" which is already present in library
	if(auto != undefined && auto.primary_key != undefined){
		configuration.primary_key = auto.primary_key;
	}

	//Check if primary key is passed or no default is "name" already present in library
	if(auto != undefined && auto.field != undefined){
		configuration.field = auto.field;
	}

	if(auto != undefined && auto.url != undefined){
		configuration.url = auto.url;
	}else{
		var defauttObj = new Object();
		configuration.url = defauttObj;
	}
	if(auto != undefined && auto.callBack != undefined){
		configuration.callBack = auto.callBack;
	}else{
			configuration.callBack = '';
	}
	if(auto != undefined && auto.blurFunction != undefined){
		configuration.blur = auto.blurFunction;
	}else{
		configuration.blur = '';
	}
	if(auto != undefined && auto.keyupFunction != undefined){
		configuration.keyup = auto.keyupFunction;
	}else{
		configuration.keyup = '';
	}
	if(auto != undefined && auto.show_field != undefined){
		configuration.show_field = auto.show_field;/*'name, mobileNumber'*/
	}else{
		configuration.show_field = '';
	}
	if(auto != undefined && auto.sub_info != undefined){
		configuration.sub_info = auto.sub_info;
	}else{
		configuration.sub_info = false;
	}
	if(auto != undefined && auto.sub_as != undefined){
		configuration.sub_as = auto.sub_as;
	}else{
		configuration.sub_as = '';
	}
	
	configuration.bind_to = 'callBack';

	return $( this ).ajaxComboBox (
			configuration.url, configuration)
			.bind('blur', configuration.blur)
			.bind('keyup', configuration.keyup)
			.bind('callBack', configuration.callBack);
};

/**
 * set source in autocomplete. 
 * 
 * @param instance	- autocomplete instance
 * @param source	- autocomplete source
 * 
 */
$.fn.setSourceToAutoComplete = function (source) { // Input Value like in URL 
	$( this ).each(function() {
		this.elem.combo_input.context.value = '';
		$(this.elem.combo_input.context.id+'_primary_key').val("");
		this.option.source = source;
	});
};

function setSpecificDataToElement(data) {  

	var dataCollection = data.dataCollection;
	var resultArr = new Array(); 
	for(var i=0;i<dataCollection.length;i++){
		if(data.showAllBranch) {
			resultArr.push(dataCollection[i]);
		} else {
			if(parseInt(dataCollection[i][data.dependentId]) ==  parseInt(data.equateValue)){
				resultArr.push(dataCollection[i]);
			}
		}
	}
	var autocompleteSourceAndDest = $(data.instanceElementId).getInstance();
	autocompleteSourceAndDest.setSourceToAutoComplete(resultArr);
	//present in autocompleteutils.js
	if(resultArr.length == 1){
	$( autocompleteSourceAndDest ).each(function() {
		if(data.fieldName != undefined){
			this.elem.combo_input.context.value = resultArr[0][data.fieldName];
		}else{
			this.elem.combo_input.context.value = "";
		}
		if(data.primaryKey != undefined){
			document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = resultArr[0][data.primaryKey];
		}else{
			document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = "";
		}
		
	});
	}
};
