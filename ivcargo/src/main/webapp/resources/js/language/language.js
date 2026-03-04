function loadLanguage(){
	var fileName = getFileName();
	var filePath = getFilePath();
	changeLanguage(filePath,fileName,'en-GB');
	includeHTML();
}
//used when filepath is not used for 
function loadLanguageWithParams(languageObj){
	var fileName = getFileNameByObj(languageObj);
	var filePath = getFilePathByObj(languageObj);
	var keySet = changeLanguage(filePath,fileName,'en-GB');
	includeHTML();
	return keySet;
}

function checkCondition(object){
	if( typeof(object) === "undefined" || object == null || object == 'undefined'){
		return false;
	}
	return true;
}

function getFilePath(){
	if(checkCondition(globalLanguageObj)){
		if(globalLanguageObj.filePath){
			return globalLanguageObj.filePath;
		}else{
			console.log('file path is not present in object');
		}
	}else{
		console.log('Global Language is not created');
	}
}

function getFilePathByObj(languageObj){
	if(checkCondition(languageObj)){
		if(languageObj.filePath){
			return languageObj.filePath;
		}else{
			console.log('file path is not present in object');
		}
	}else{
		console.log('Global Language is not created');
	}
}

function getFileNameByObj(languageObj){
	if(checkCondition(languageObj)){
		if(languageObj.fileName){
			return languageObj.fileName;
		}else{
			console.log('file name is not present in object');
		}
	}else{
		console.log('Global Language is not created');
	}
}

function getFileName(){
	if(checkCondition(globalLanguageObj)){
		if(globalLanguageObj.fileName){
			return globalLanguageObj.fileName;
		}else{
			console.log('file name is not present in object');
		}
	}else{
		console.log('Global Language is not created');
	}
}
function includeHTML(){
	/*$.get("/ivviewpages/language/language.do", function(data) {
	    $("#langSelect").html(data);
	  });*/
}

function updateLanguage()
{
	var newlanguage = $("#language").val();
	$.linguaLoadAutoUpdate(newlanguage); // this will also update controls by ID
}

function changeLanguage(filePath,fileName,lang){
	//path of Language.txt file present, name of page starting 
	 $.linguaInit(filePath+'/', fileName);

     // try to change our drop-down to the browser language
     $("#language").val($.linguaGetLanguage());

     // try loading the default browser language
     $.linguaLoad(lang);
     return $.linguaUpdateElements(); // manual updating of controls by ID
}