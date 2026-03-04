var PROJECT_IVUIRESOURCES = '/ivcargo';
define(function(require) {
	return {
		loadLanguage:function(){
			//global variable Language file Path Needs to be present in every HTML file
			var globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/module/fuelreceiptregister';
			//file name for language to be specified
			globalLanguageObj.fileName 		= 'fuelreceiptregister'
			return globalLanguageObj;
		}
	}
})

