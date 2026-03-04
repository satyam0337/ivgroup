/**
 * @Author Anant Chaudhary	13-07-0216
 */

define(function(require) {
	return {
		loadLanguage:function(){
			//global variable Language file Path Needs to be present in every HTML file
			var globalLanguageObj = new Object();
			//file path needs to be specified from languages folder
			globalLanguageObj.filePath 		= PROJECT_IVUIRESOURCES+'/resources/data/languages/module/trafficwisesearch';
			//file name for language to be specified
			globalLanguageObj.fileName 		= 'trafficwisesearch'
			return globalLanguageObj;
		}
	}
})

