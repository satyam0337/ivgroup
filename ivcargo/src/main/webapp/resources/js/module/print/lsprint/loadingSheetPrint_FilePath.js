/**
 * Anant 08-Mar-2024 6:50:22 pm 2024
 */

 define(function(require) {
	return {
		loadLanguage:function(flavourNo){
			//global variable Language file Path Needs to be present in every HTML file
			var globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/module/dispatchlsprint';
			//file name for language to be specified
			globalLanguageObj.fileName 		= flavourNo
			return globalLanguageObj;
		}
	}
});